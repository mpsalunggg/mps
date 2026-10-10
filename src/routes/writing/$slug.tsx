import { createFileRoute } from '@tanstack/react-router'
import { getDetailWriting } from '@/pages/writing/server'
import DetailWriting from '@/pages/writing/DetailWriting'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/writing/$slug')({
  loader: async ({ params }) =>
    await getDetailWriting({
      data: { slug: params.slug },
    }),
  staleTime: 0,
  gcTime: 0,
  head: ({ loaderData, params }) => {
    if (!loaderData) return {}

    const { meta, links } = seo({
      title: `${loaderData.frontmatter.title} - Writing`,
      description: loaderData.frontmatter.description,
      image: loaderData.frontmatter.image ?? `/og/${params.slug}.png`,
      keywords: loaderData.frontmatter.category,
      type: 'article',
      path: `/writing/${params.slug}`,
    })

    return { meta, links }
  },
  component: WritingDetail,
})

function WritingDetail() {
  const { slug, frontmatter } = Route.useLoaderData()
  return <DetailWriting frontmatter={frontmatter} slug={slug} />
}
