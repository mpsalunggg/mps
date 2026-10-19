import { AnimatedLines } from "@/components/common/Background";
import SectionHeader from "./components/SectionHeader";
import ContactSection from "./components/ContactSection";
import CardProject from "@/pages/project/components/CardProject";
import CardWriting from "@/pages/writing/components/CardWriting";
import { ExperienceTimeline } from "@/pages/work/components/ExperienceTimeline";
import { iconMap, skills } from "@/constants/about";
import { workExperiences } from "@/constants/work";
import { isNewWriting } from "@/lib/mdx";
import type { ProjectFrontmatter, WritingFrontmatter } from "@/lib/mdx";
import type { Contributions, GithubStats } from "@/pages/home/server";
import ContributionGraph from "@/components/common/ContributionGraph";

interface HomeProps {
  projects: ProjectFrontmatter[];
  writings: WritingFrontmatter[];
  githubStats: GithubStats | null;
  contributions: Contributions | null;
}

// Three per group keeps all four skill groups represented in one row.
const stack = skills.flatMap((group) => group.items.slice(0, 3));

const Home = ({
  projects,
  writings,
  githubStats,
  contributions,
}: HomeProps) => {
  const featuredProjects = projects.slice(0, 2);
  const latestWritings = writings.slice(0, 3);
  const current = workExperiences[0];

  return (
    <main className="bg-background min-h-screen">
      <section className="relative flex min-h-[70vh] items-center overflow-hidden pt-28 pb-16">
        <AnimatedLines variant="hero" className="opacity-60" />

        <div className="page-container relative z-10">
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationFillMode: "both" }}
          >
            <p className="text-muted-foreground text-sm">
              Hi, I&apos;m Putra — based in South Tangerang.
            </p>
          </div>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.25s", animationFillMode: "both" }}
          >
            <h1 className="font-amatic text-foreground mt-6 mb-5 text-7xl leading-[0.95] font-bold tracking-wide text-balance md:text-8xl">
              I&apos;m a Software Engineer
            </h1>
          </div>

          <div
            className="animate-fade-in-up max-w-xl"
            style={{ animationDelay: "0.4s", animationFillMode: "both" }}
          >
            <p className="text-muted-foreground text-base leading-relaxed font-light text-pretty md:text-lg">
              Passionate about exploring new technologies and sharing knowledge
              through creative solutions.
            </p>
          </div>

          <div
            className="animate-fade-in-up text-muted-foreground mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] tracking-wider uppercase"
            style={{ animationDelay: "0.55s", animationFillMode: "both" }}
          >
            <span className="text-foreground">
              {current.position} · {current.company}
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-chart-2" />
              </span>
              Open to work
            </span>
          </div>
        </div>

        <AnimatedLines variant="floating" className="opacity-40" />
      </section>

      <div className="page-container space-y-24 pb-24">
        <section className="relative">
          <SectionHeader
            eyebrow="Who I am"
            title="About"
            note="the human behind the code"
            to="/about"
            linkLabel="Read more"
          />

          <div className="grid gap-8 sm:grid-cols-[minmax(0,180px)_1fr] sm:items-start">
            <div className="group">
              <img
                src="/images/profile.webp"
                alt="Muhamad Putra Satria"
                className="aspect-square w-full rounded-2xl object-cover shadow-sm grayscale transition-all duration-500 group-hover:grayscale-0"
              />
            </div>

            <div>
              <p className="text-foreground text-base leading-relaxed">
                Software Engineer with 2+ years of experience building
                responsive user interfaces, and translating design concepts into
                seamless user experiences.
              </p>
              <p className="text-muted-foreground mt-4 text-base leading-relaxed font-light">
                Currently at {current.company}, working across frontend and
                backend to ship scalable products.
              </p>

              <div className="mt-6">
                <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                  Stack
                </p>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {stack.map((skill) => {
                    const icon = iconMap[skill.icon];
                    if (!icon) return null;
                    return (
                      <li
                        key={skill.name}
                        title={skill.name}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <svg
                          role="img"
                          aria-label={skill.name}
                          viewBox="0 0 24 24"
                          className="h-5 w-5 transition-transform hover:scale-110"
                          fill="currentColor"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="relative">
          <SectionHeader
            eyebrow="Things I've built"
            title="Selected Work"
            note="my favorite builds live here"
            noteSide="right"
            to="/projects"
            linkLabel="All projects"
          />

          {featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {featuredProjects.map((project, index) => (
                <CardProject
                  key={project.slug}
                  project={project}
                  isEven={index % 2 === 0}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No projects yet. Check back soon.
            </p>
          )}
        </section>

        <section className="relative">
          <SectionHeader
            eyebrow="Where I've worked"
            title="Experience"
            note="where I learned things the hard way"
            to="/work"
            linkLabel="Full history"
          />

          <ExperienceTimeline items={workExperiences} limit={2} />
        </section>

        <section className="relative">
          <SectionHeader
            eyebrow="What I'm thinking about"
            title="Writing"
            note="notes I wish I had earlier"
            noteSide="right"
            to="/writing"
            linkLabel="All articles"
          />

          {latestWritings.length > 0 ? (
            <div className="-mt-6">
              {latestWritings.map((writing, index) => (
                <CardWriting
                  key={writing.slug}
                  writing={writing}
                  isLast={index === latestWritings.length - 1}
                  isNew={isNewWriting(writing, index)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No articles yet. Check back soon.
            </p>
          )}
        </section>

        <section className="relative">
          <SectionHeader
            eyebrow="How I show up"
            title="Activity"
            note="proof I actually ship"
          />
          <ContributionGraph contributions={contributions} />
        </section>

        <ContactSection githubStats={githubStats} />

        <div className="border-border border-t pt-8 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Mps
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;
