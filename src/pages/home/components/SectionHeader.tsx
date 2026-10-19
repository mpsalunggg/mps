import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  eyebrow: string
  /** ReactNode so a title can carry inline emphasis, e.g. Let's <em>Connect</em>. */
  title: ReactNode
  description?: string
  /** Omit to render a heading with no read-more link. */
  to?: string
  linkLabel?: string
  /** Hand-drawn aside that draws in right after switching to dark mode. */
  note?: string
  /** Which page gutter the note sits in on wide screens. */
  noteSide?: 'left' | 'right'
  className?: string
}

const SectionHeader = ({
  eyebrow,
  title,
  description,
  to,
  linkLabel = 'Read more',
  note,
  noteSide = 'left',
  className,
}: SectionHeaderProps) => {
  return (
    <div className={cn('relative mb-10 xl:static', className)}>
      {note && (
        // Sits above the eyebrow on narrow screens; from xl it moves out into
        // the gutter beside the page column, centered on the parent <section>
        // (which must be `relative`).
        <span
          aria-hidden="true"
          className={cn(
            'section-note font-amatic text-foreground/90 pointer-events-none absolute bottom-full left-0 mb-2 flex items-start w-max max-w-full gap-1 font-bold',
            'xl:top-1/2 xl:bottom-auto xl:mb-0 xl:-translate-y-1/2 xl:w-40 xl:flex-col-reverse xl:gap-0',
            noteSide === 'left'
              ? 'xl:right-full xl:left-auto xl:mr-4 xl:items-end xl:text-right'
              : 'xl:left-full xl:ml-4 xl:items-start',
          )}
        >
          <svg
            viewBox="0 0 56 40"
            className={cn(
              'h-10 w-14 shrink-0 -scale-x-100',
              noteSide === 'left' && 'xl:scale-x-100',
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path pathLength="1" d="M6 4c6 18 22 28 44 30" />
            <path pathLength="1" d="M42 27l8 7-9 4" />
          </svg>
          <span className="text-2xl leading-none tracking-wide xl:text-3xl">
            {note}
          </span>
        </span>
      )}

      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
          <h2 className="font-amatic mt-2 text-4xl font-bold tracking-wide md:text-5xl">
            {title}
          </h2>
        </div>

        {to && (
          <Link
            to={to}
            className="group text-muted-foreground hover:text-foreground shrink-0 pb-1 transition-colors"
          >
            <span className="font-amatic flex items-center gap-1 text-2xl tracking-wide">
              {linkLabel}
              <ArrowUpRight className="text-muted-foreground/40 group-hover:text-foreground h-4 w-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        )}
      </div>

      {description && (
        <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed font-light text-pretty">
          {description}
        </p>
      )}
    </div>
  )
}

export default SectionHeader
