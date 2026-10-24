import { createFileRoute } from '@tanstack/react-router'
import CourtPage from '@/pages/court'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/court/')({
  head: () => {
    const { meta, links } = seo({
      title: 'Court - Muhamad Putra Satria',
      description:
        'A small 3-point contest in the browser. Five spots, twenty-five balls, hold and release to shoot.',
      keywords: 'Basketball, 3-point contest, Game, Three.js, Muhamad Putra Satria',
      path: '/court',
    })
    return { meta, links }
  },
  component: CourtPage,
})
