import { AnimatedLines } from "@/components/common/Background";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { iconMap, skills, achievements } from "@/constants/about";
import ContributionGraph from "@/components/common/ContributionGraph";
import type { Contributions } from "@/pages/home/server";

interface AboutPageProps {
  contributions: Contributions | null;
}

const AboutPage = ({ contributions }: AboutPageProps) => {
  return (
    <main className="bg-background min-h-screen">
      <div className="pt-20">
        <section className="relative py-12">
          <div className="absolute -top-12 left-1/2 w-full max-w-4xl -translate-x-1/2 transform">
            <AnimatedLines className="opacity-30" />
          </div>

          <div className="page-container">
            <div className="mb-16">
              <h1 className="font-amatic mb-3 text-6xl font-bold tracking-wide md:text-7xl">
                About
              </h1>
              <p className="text-muted-foreground text-lg">
                Understanding the person behind the work
              </p>
            </div>

            <div className="mb-24 grid gap-16 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <div className="sticky top-32">
                  <div className="group mx-auto mb-8 w-full max-w-sm lg:mx-0">
                    <img
                      src="/images/profile.webp"
                      alt="Muhamad Putra Satria - Portfolio"
                      className="aspect-square w-full rounded-3xl object-cover shadow-md grayscale transition-all duration-500 group-hover:grayscale-0"
                    />
                  </div>

                  <div className="space-y-2 text-center lg:text-left">
                    <h2 className="text-2xl font-light">
                      Muhamad Putra Satria
                    </h2>
                    <p className="text-muted-foreground">
                      Software Frontend Engineer
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Palu, Indonesia
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-12 lg:col-span-2">
                <div>
                  <h3 className="text-muted-foreground mb-6 font-mono text-sm tracking-wider uppercase">
                    Summary
                  </h3>
                  <div className="text-foreground space-y-6 text-lg leading-relaxed">
                    <p>
                      <strong>Software Engineer</strong> with <em>2+ years</em>{" "}
                      of specialized experience in building{" "}
                      <strong>responsive, user interfaces</strong>. Skilled at
                      translating design concepts into{" "}
                      <strong>seamless user experiences</strong>, while
                      leveraging full-stack knowledge to optimize application
                      functionality.
                    </p>
                    <p>
                      Collaborated closely with cross-functional teams to
                      deliver scalable solutions and improve development
                      processes. Passionate about exploring new technologies and
                      sharing knowledge with the developer community.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-muted-foreground mb-6 font-mono text-sm tracking-wider uppercase">
                    Recognition
                  </h3>
                  <Timeline defaultValue={achievements.length}>
                    {achievements.map((achievement, index) => (
                      <TimelineItem key={achievement.title} step={index + 1}>
                        <TimelineHeader>
                          <TimelineDate className="font-mono text-sm">
                            {achievement.year}
                          </TimelineDate>
                          <TimelineTitle className="text-base font-medium">
                            <TooltipProvider>
                              {achievement.tooltip ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>{achievement.title}</span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-[300px]"
                                  >
                                    <p>{achievement.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                achievement.title
                              )}
                            </TooltipProvider>
                          </TimelineTitle>
                        </TimelineHeader>
                        <TimelineContent className="text-sm">
                          {achievement.organization}
                        </TimelineContent>
                        <TimelineHeader>
                          <img src={achievement.image} className="h-8" />
                        </TimelineHeader>
                        <TimelineIndicator className="border border-border" />
                        <TimelineSeparator />
                      </TimelineItem>
                    ))}
                  </Timeline>
                </div>

                <div className="relative">
                  <h3 className="text-muted-foreground mb-6 font-mono text-sm tracking-wider uppercase">
                    Education
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-6">
                    <h4 className="mb-2 font-medium">
                      Bachelor's Degree in Computer Science
                    </h4>
                    <p className="text-muted-foreground mb-1">
                      Tadulako University
                    </p>
                    <p className="text-muted-foreground text-sm">
                      08/2020 - 03/2024 • Cumlaude • GPA: 3.95/4.00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border relative border-t pt-12">
              <h3 className="text-muted-foreground mb-12 text-center font-mono text-sm uppercase">
                Skills & Expertise
              </h3>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {skills.map((skillGroup) => (
                  <div key={skillGroup.category}>
                    <div className="mb-6 flex items-center gap-2">
                      <h4 className="text-lg font-medium">
                        {skillGroup.category}
                      </h4>
                      {skillGroup.isLearning && (
                        <Badge variant="outline" className="text-xs">
                          Learning
                        </Badge>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {skillGroup.items.map((skill) => {
                        const icon = iconMap[skill.icon];
                        return (
                          <li
                            key={skill.name}
                            className="text-muted-foreground hover:text-foreground group flex items-center gap-3 text-sm transition-colors"
                          >
                            {icon && (
                              <svg
                                role="img"
                                viewBox="0 0 24 24"
                                className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110"
                                fill="currentColor"
                                dangerouslySetInnerHTML={{ __html: icon.svg }}
                              />
                            )}
                            <span>{skill.name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-border relative mt-24 border-t pt-12">
              <h3 className="text-muted-foreground mb-12 text-center font-mono text-sm uppercase">
                Contribution Activity
              </h3>

              <ContributionGraph contributions={contributions} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
