import {
    Timeline,
    TimelineContent,
    TimelineDate,
    TimelineHeader,
    TimelineIndicator,
    TimelineItem,
    TimelineSeparator,
    TimelineTitle,
} from '@/components/ui/timeline'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Experience {
    period: string
    company: string
    link_company: string
    position: string
    location: string
    type?: string
    responsibilities: string[]
    stack?: string[]
}

export interface ExperienceGroup {
    company: string
    link_company: string
    location: string
    roles: Experience[]
}

/** '03/2024 - Present' -> sortable integer taken from the START month. */
const startKey = (period: string) => {
    const [mm, yyyy] = period.split(' - ')[0].split('/')
    return (Number(yyyy) || 0) * 12 + (Number(mm) || 0)
}

const isPresent = (period: string) => period.toLowerCase().includes('present')

/**
 * Collapse repeated companies into one entry, newest role first. Sorting up
 * front means a Map's insertion order already places each company at its
 * newest role — no second sort, and non-adjacent repeats still merge.
 */
export const groupExperiences = (items: Experience[]): ExperienceGroup[] => {
    const sorted = [...items].sort(
        (a, b) => startKey(b.period) - startKey(a.period)
    )

    const groups = new Map<string, ExperienceGroup>()
    for (const item of sorted) {
        const group = groups.get(item.company)
        if (group) {
            group.roles.push(item)
        } else {
            groups.set(item.company, {
                company: item.company,
                link_company: item.link_company,
                location: item.location,
                roles: [item],
            })
        }
    }
    return [...groups.values()]
}

interface ExperienceTimelineProps {
    items: Experience[]
    /** Section heading. Omit to render none. */
    heading?: string
    /** Show only the N most recent companies. Omit for the full history. */
    limit?: number
}

export const ExperienceTimeline = ({
    items,
    heading,
    limit,
}: ExperienceTimelineProps) => {
    const all = groupExperiences(items)
    const groups = limit ? all.slice(0, limit) : all

    return (
        <div>
            {heading && (
                <h3 className="text-muted-foreground mb-6 font-mono text-sm tracking-wider uppercase">
                    {heading}
                </h3>
            )}
            {/* Step 0 = nothing "completed": the rail stays one flat tone in
                every section, and the filled dot below marks the current role
                instead of the timeline's progress state. */}
            <Timeline defaultValue={0}>
                {groups.map((group, index) => {
                    const current = group.roles.some((role) =>
                        isPresent(role.period)
                    )
                    // Only useful when roles differ; for one role the period
                    // column below already prints it.
                    const span =
                        group.roles.length > 1
                            ? `${group.roles[group.roles.length - 1].period.split(' - ')[0]} - ${group.roles[0].period.split(' - ')[1]}`
                            : null

                    return (
                        <TimelineItem key={group.company} step={index + 1}>
                            <TimelineHeader>
                                <div className="flex flex-wrap items-baseline gap-x-3">
                                    <TimelineTitle className="text-base font-medium">
                                        <a
                                            href={group.link_company}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-foreground font-medium underline hover:text-primary"
                                        >
                                            {group.company}
                                        </a>
                                    </TimelineTitle>
                                    {span && (
                                        <TimelineDate className="ms-auto mb-0 font-mono text-xs tabular-nums">
                                            {span}
                                        </TimelineDate>
                                    )}
                                </div>
                                <span className="text-muted-foreground text-sm">
                                    {group.location}
                                </span>
                            </TimelineHeader>
                            <TimelineContent>
                                <div className="mt-5 space-y-8">
                                    {group.roles.map((role, idx) => (
                                        <div
                                            key={`${role.period}-${idx}`}
                                            className="grid gap-x-5 gap-y-1 sm:grid-cols-[6.5rem_1fr]"
                                        >
                                            <span className="text-muted-foreground font-mono text-xs tabular-nums sm:pt-0.5">
                                                {role.period}
                                            </span>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-foreground text-sm font-medium">
                                                        {role.position}
                                                    </h4>
                                                    {role.type && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {role.type}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <ul className="mt-3 space-y-1.5">
                                                    {role.responsibilities.map(
                                                        (
                                                            responsibility,
                                                            respIdx
                                                        ) => (
                                                            <li
                                                                key={respIdx}
                                                                className="text-muted-foreground text-sm"
                                                            >
                                                                • {responsibility}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                                {role.stack &&
                                                    role.stack.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                                            {role.stack.map(
                                                                (tech) => (
                                                                    <Badge
                                                                        key={tech}
                                                                        variant="secondary"
                                                                        className="text-xs font-normal"
                                                                    >
                                                                        {tech}
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TimelineContent>
                            <TimelineIndicator
                                className={cn(
                                    current ? 'bg-primary' : 'border border-border'
                                )}
                            />
                            <TimelineSeparator />
                        </TimelineItem>
                    )
                })}
            </Timeline>
        </div>
    )
}
