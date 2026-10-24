import { lazy, Suspense } from 'react'
import { Github, ExternalLink, Calendar, ArrowLeft, Eye } from 'lucide-react'
import { MDXProvider } from '@mdx-js/react'
import { Badge } from '@/components/ui/badge'
import { mdxComponents } from '@/components/common/MDXComponents'
import { ProjectFrontmatter } from '@/lib/mdx'
import { AnimatedLines } from '@/components/common/Background'
import { Link } from '@tanstack/react-router'
import { useViews } from '@/lib/views'

interface DetailProjectProps {
  frontmatter: ProjectFrontmatter
  slug: string
}

const DetailProject = ({ frontmatter, slug }: DetailProjectProps) => {
  const views = useViews('project', slug, frontmatter.views)

  const MDXComponent = lazy(() =>
    import(`../../content/projects/${slug}.mdx`).then((module) => ({
      default: module.default,
    }))
  )

  return (
    <main className="bg-background min-h-screen">
      <div className="pt-20">
        <article className="page-container py-12">
          <div className="flex justify-between items-center">
            <Link
              to="/projects"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>
            <div>
              <Eye className="inline-block h-4 w-4 mr-1" />
              <span className="text-sm text-muted-foreground">
                {views} views
              </span>
            </div>
          </div>
          <header className="mb-12">
            {frontmatter.image && (
              <img
                src={frontmatter.image}
                alt={frontmatter.title}
                className="mb-8 aspect-video w-full rounded-lg object-cover"
              />
            )}

            <div className="mb-4 flex items-center gap-4 text-sm">
              <Badge variant="secondary">{frontmatter.category}</Badge>
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={frontmatter.date}>
                  {new Date(frontmatter.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>

            <h1 className="font-amatic mb-5 max-w-[95%] origin-top-left -rotate-1 text-6xl font-bold leading-[1.05] md:text-7xl">
              {frontmatter.title}
            </h1>

            <p className="text-muted-foreground mb-6 text-xl">
              {frontmatter.description}
            </p>

            {frontmatter.tech && frontmatter.tech.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {frontmatter.tech.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {frontmatter.github && (
                <a
                  href={frontmatter.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-muted hover:text-foreground border-border text-muted-foreground flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
                >
                  <Github className="h-4 w-4" />
                  View Code
                </a>
              )}
              {frontmatter.demo && (
                <a
                  href={frontmatter.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-primary/90 bg-primary text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>
          </header>

          <AnimatedLines variant="section" className="-mt-8" />

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <MDXProvider components={mdxComponents}>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                }
              >
                <MDXComponent />
              </Suspense>
            </MDXProvider>
          </div>
        </article>
      </div>
    </main>
  )
}
export default DetailProject
