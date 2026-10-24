import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { getAllWritingFrontmatter, type WritingFrontmatter } from '@/lib/mdx'

export const getAllWritings = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const allWritings = await getAllWritingFrontmatter()
      const viewsData = await prisma.writingView.findMany({
        orderBy: { views: 'desc' },
        select: { slug: true, views: true, createdAt: true },
      })

      const viewsMap = new Map(
        viewsData.map((view) => [
          view.slug,
          { views: view.views, createdAt: view.createdAt },
        ]),
      )

      const writingsWithViews: WritingFrontmatter[] = allWritings.map(
        (writing) => ({
          ...writing,
          date:
            viewsMap.get(writing.slug)?.createdAt?.toISOString() ||
            writing.date,
          views: viewsMap.get(writing.slug)?.views || 0,
        }),
      )

      return { writings: writingsWithViews }
    } catch (error) {
      console.error('Error loading writings with views:', error)
      return { writings: [] }
    }
  },
)

export const getDetailWriting = createServerFn({ method: 'GET' })
  .validator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const writing = await getAllWritingFrontmatter().then((writings) =>
      writings.find((w) => w.slug === data.slug),
    )

    if (!writing) {
      throw notFound()
    }

    const view = await prisma.writingView.findUnique({
      where: { slug: data.slug },
      select: { views: true, createdAt: true },
    })

    return {
      slug: data.slug,
      frontmatter: {
        ...writing,
        views: view?.views ?? 0,
        date: view?.createdAt?.toISOString() || writing.date,
      },
    }
  })
