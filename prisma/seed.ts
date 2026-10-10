import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const projectSlugs = [
  { title: 'Hammercode Web', views: 0 },
  { title: 'Edu Quiz', views: 0 },
  { title: 'IQOS RFID Web', views: 0 },
  { title: 'IQOS RFID Dashboard', views: 0 },
  { title: 'Wellnest Event', views: 0 },
  { title: 'Kopi Garuda', views: 0 },
  { title: 'Netflix Clone', views: 0 },
  { title: 'Ask Me', views: 0 },
]

const writingSlugs = [
  { slug: 'building-modern-web-apps', views: 0 },
  { slug: 'database-transaction', views: 0 },
  { slug: 'my-career-journey', views: 0 },
]

async function main() {
  for (const project of projectSlugs) {
    const slug = createSlug(project.title)

    const existing = await prisma.projectView.findUnique({
      where: { slug },
    })

    if (existing) {
      console.log(`[project] Skipped (already exists): ${slug}`)
      continue
    }

    await prisma.projectView.create({
      data: {
        slug,
        views: project.views,
      },
    })

    console.log(`[project] Created: ${slug}`)
  }

  for (const writing of writingSlugs) {
    const existing = await prisma.writingView.findUnique({
      where: { slug: writing.slug },
    })

    if (existing) {
      console.log(`[writing] Skipped (already exists): ${writing.slug}`)
      continue
    }

    await prisma.writingView.create({
      data: {
        slug: writing.slug,
        views: writing.views,
      },
    })

    console.log(`[writing] Created: ${writing.slug}`)
  }

  console.log('Seed completed!')
}

main()
  .catch(() => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
