import { AnimatedLines } from '@/components/common/Background'
import CardWriting from './components/CardWriting'
import { WritingFrontmatter, isNewWriting } from '@/lib/mdx'

interface WritingPageProps {
  writings: WritingFrontmatter[]
}

const WritingPage = ({ writings }: WritingPageProps) => {
  return (
    <main className="bg-background min-h-screen">
      <div className="pt-20">
        <section className="relative py-12">
          <div className="absolute -top-12 left-1/2 w-full max-w-4xl -translate-x-1/2 transform">
            <AnimatedLines className="opacity-30" />
          </div>

          <div className="page-container">
            <div className="mb-10">
              <h1 className="font-amatic mb-3 text-6xl font-bold tracking-wide md:text-7xl">
                Writing
              </h1>
              <p className="text-muted-foreground text-base font-light tracking-wide">
                Thoughts on web development, engineering, and technology
              </p>
            </div>

            {writings.length > 0 ? (
              <div className="-mt-6">
                {writings.map((writing, index) => (
                  <CardWriting
                    key={writing.slug}
                    writing={writing}
                    isLast={index === writings.length - 1}
                    isNew={isNewWriting(writing, index)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm tracking-wide">
                No articles yet. Check back soon!
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default WritingPage