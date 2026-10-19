export interface ProjectFrontmatter {
  title: string
  description: string
  image?: string
  tech: string[]
  github?: string
  demo?: string
  date: string
  category: string
  slug: string
  views?: number
}

export interface WritingFrontmatter {
  slug: string
  title: string
  description: string
  /** Optional override; writings fall back to the generated card in public/og. */
  image?: string
  date: string
  category: string
  readingTime: string
  views?: number
}

const mdxModules = import.meta.glob<{
  default: any
  frontmatter: ProjectFrontmatter
}>('/src/content/projects/*.mdx', { eager: false })

const writingMdxModules = import.meta.glob<{
  default: any
  frontmatter: WritingFrontmatter
}>('/src/content/writings/*.mdx', { eager: false })

export const getMDXProject = async (slug: string) => {
  const modulePath = `/src/content/projects/${slug}.mdx`
  const moduleLoader = mdxModules[modulePath]

  if (!moduleLoader) {
    return null
  }

  try {
    const module = await moduleLoader()
    return {
      Content: module.default,
      frontmatter: module.frontmatter,
    }
  } catch (error) {
    return null
  }
}

export const getAllProjectFrontmatter = async (): Promise<
  ProjectFrontmatter[]
> => {
  const allProjects = await Promise.all(
    Object.entries(mdxModules).map(async ([path, loader]) => {
      try {
        const module = await loader()
        return module.frontmatter
      } catch (error) {
        console.error(`[MDX] Error loading frontmatter from ${path}`, error)
        return null
      }
    })
  )

  return allProjects.filter(
    (frontmatter): frontmatter is ProjectFrontmatter => frontmatter !== null
  )
}

export function getAllProjectSlugs(): string[] {
  return Object.keys(mdxModules)
    .map((path) => {
      const match = path.match(/\/([^/]+)\.mdx$/)
      return match ? match[1] : ''
    })
    .filter(Boolean)
}

export const getMDXWriting = async (slug: string) => {
  const modulePath = `/src/content/writings/${slug}.mdx`
  const moduleLoader = writingMdxModules[modulePath]

  if (!moduleLoader) {
    return null
  }

  try {
    const module = await moduleLoader()
    return {
      Content: module.default,
      frontmatter: module.frontmatter,
    }
  } catch (error) {
    return null
  }
}

export const getAllWritingFrontmatter = async (): Promise<
  WritingFrontmatter[]
> => {
  const allWritings = await Promise.all(
    Object.entries(writingMdxModules).map(async ([path, loader]) => {
      try {
        const module = await loader()
        return module.frontmatter
      } catch (error) {
        console.error(`[MDX] Error loading frontmatter from ${path}`, error)
        return null
      }
    })
  )

  return allWritings
    .filter(
      (frontmatter): frontmatter is WritingFrontmatter => frontmatter !== null
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllWritingSlugs(): string[] {
  return Object.keys(writingMdxModules)
    .map((path) => {
      const match = path.match(/\/([^/]+)\.mdx$/)
      return match ? match[1] : ''
    })
    .filter(Boolean)
}

const NEW_WINDOW_DAYS = 30

/** Only the latest writing (list index 0) counts as new, and only within the window. */
export function isNewWriting(writing: WritingFrontmatter, index: number) {
  return (
    index === 0 &&
    Date.now() - new Date(writing.date).getTime() <=
      NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
  )
}
