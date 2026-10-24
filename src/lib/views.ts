import { useEffect, useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import {
  getCookie,
  getRequestHeader,
  setCookie,
} from '@tanstack/react-start/server'
import { prisma } from '@/lib/prisma'
import { getAllProjectSlugs, getAllWritingSlugs } from '@/lib/mdx'

export type ViewKind = 'project' | 'writing'

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|headless/i

const ONE_DAY = 60 * 60 * 24

export function isBot(userAgent?: string) {
  return !userAgent || BOT_PATTERN.test(userAgent)
}

function slugsFor(kind: ViewKind) {
  return kind === 'project' ? getAllProjectSlugs() : getAllWritingSlugs()
}

async function readViews(kind: ViewKind, slug: string) {
  const where = { where: { slug }, select: { views: true } }
  const row =
    kind === 'project'
      ? await prisma.projectView.findUnique(where)
      : await prisma.writingView.findUnique(where)
  return row?.views ?? 0
}

async function incrementViews(kind: ViewKind, slug: string) {
  const args = {
    where: { slug },
    update: { views: { increment: 1 } },
    create: { slug, views: 1 },
    select: { views: true },
  }
  const row =
    kind === 'project'
      ? await prisma.projectView.upsert(args)
      : await prisma.writingView.upsert(args)
  return row.views
}

export const recordView = createServerFn({ method: 'POST' })
  .validator((data: { kind: ViewKind; slug: string }) => {
    if (data.kind !== 'project' && data.kind !== 'writing') {
      throw new Error('Invalid view kind')
    }
    if (!slugsFor(data.kind).includes(data.slug)) {
      throw new Error('Unknown slug')
    }
    return data
  })
  .handler(async ({ data: { kind, slug } }) => {
    const cookie = `viewed_${kind}_${slug}`
    const skip =
      import.meta.env.VITE_UPDATE_VIEWS !== 'true' ||
      isBot(getRequestHeader('user-agent')) ||
      getCookie(cookie) !== undefined

    if (skip) {
      return { views: await readViews(kind, slug) }
    }

    const views = await incrementViews(kind, slug)
    setCookie(cookie, '1', {
      maxAge: ONE_DAY,
      httpOnly: true,
      sameSite: 'lax',
      secure: import.meta.env.PROD,
      path: '/',
    })
    return { views }
  })

const recorded = new Set<string>()

export function useViews(kind: ViewKind, slug: string, initial = 0) {
  const [views, setViews] = useState(initial)

  useEffect(() => {
    const key = `${kind}:${slug}`
    if (recorded.has(key)) return
    recorded.add(key)
    recordView({ data: { kind, slug } })
      .then((result) => setViews(result.views))
      .catch(() => recorded.delete(key))
  }, [kind, slug])

  return views
}
