import { ArrowUpRight, Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { WritingFrontmatter } from "@/lib/mdx";

interface CardWritingProps {
  writing: WritingFrontmatter;
  isLast?: boolean;
  isNew?: boolean;
}

const CardWriting = ({ writing, isLast, isNew }: CardWritingProps) => {
  const date = new Date(writing.date);
  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to="/writing/$slug"
      params={{ slug: writing.slug }}
      className="group block"
    >
      <article
        className={`relative flex items-start justify-between gap-6 py-6 ${!isLast ? "border-b border-border/50" : ""}`}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground">
            {isNew && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 font-medium text-primary-foreground">
                New
              </span>
            )}
            <span>{writing.category}</span>
            <span>·</span>
            <span>{writing.readingTime}</span>
            <span>·</span>
            <span>{formatted}</span>
          </div>

          <h3 className="font-amatic text-4xl font-bold tracking-wide text-foreground transition-colors group-hover:text-primary">
            {writing.title}
          </h3>

          <p className="text-muted-foreground line-clamp-2 max-w-xl text-sm">
            {writing.description}
          </p>

          {writing.views !== undefined && (
            <div className="text-muted-foreground font-mono flex items-center gap-1.5 text-[11px]">
              <Eye className="h-3 w-3" aria-hidden />
              <span>{writing.views.toLocaleString()} VIEWS</span>
            </div>
          )}
        </div>

        <div className="shrink-0 pt-1">
          <ArrowUpRight className="text-muted-foreground/25 group-hover:text-foreground h-4 w-4 transition-colors duration-200" />
        </div>
      </article>
    </Link>
  );
};

export default CardWriting;
