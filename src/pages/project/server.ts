import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { prisma } from '@/lib/prisma'
import { getAllProjectFrontmatter, type ProjectFrontmatter } from '@/lib/mdx'

export const getAllProjects = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const allProjects = await getAllProjectFrontmatter()
      const viewsData = await prisma.projectView.findMany({
        orderBy: { views: 'desc' },
        select: { slug: true, views: true, createdAt: true },
      })

      const viewsMap = new Map(
        viewsData.map((view) => [
          view.slug,
          { views: view.views, createdAt: view.createdAt },
        ]),
      )

      const projectsWithViews: ProjectFrontmatter[] = allProjects.map(
        (project) => ({
          ...project,
          date: viewsMap.get(project.slug)?.createdAt?.toISOString() || '',
          views: viewsMap.get(project.slug)?.views || 0,
        }),
      )
      // Newest first by DB createdAt; projects without a row sort last.
      projectsWithViews.sort(
        (a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0),
      )
      return { projects: projectsWithViews }
    } catch (error) {
      console.error('Error loading projects with views:', error)
      return { projects: [] }
    }
  },
)

export const getDetailProject = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const project = await getAllProjectFrontmatter().then((projects) =>
      projects.find((p) => p.slug === data.slug),
    )

    const createdAtDate = await prisma.projectView.findUnique({
      where: { slug: data.slug },
      select: { createdAt: true },
    })

    if (!project) {
      throw notFound()
    }

    try {
      if (import.meta.env.VITE_UPDATE_VIEWS === 'true') {
        const updatedView = await prisma.projectView.upsert({
          where: { slug: data.slug },
          update: {
            views: {
              increment: 1,
            },
          },
          create: {
            slug: data.slug,
            views: 1,
          },
        })

        return {
          slug: data.slug,
          frontmatter: {
            ...project,
            views: updatedView.views,
            date: createdAtDate?.createdAt?.toISOString() || '',
          },
        }
      } else {
        return {
          slug: data.slug,
          frontmatter: {
            ...project,
            views: project.views || 0,
            date: createdAtDate?.createdAt?.toISOString() || '',
          },
        }
      }
    } catch (error) {
      console.error('Error incrementing project view:', error)
      throw new Error('Failed to increment project view')
    }
  })
