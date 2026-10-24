import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/lib/prisma'
import { reverseGeocode } from '@/lib/geo'

export interface GuestbookMessage {
  id: string
  name: string
  message: string
  theme: string
  lat: number | null
  lng: number | null
  city: string | null
  country: string | null
  createdAt: string
}

const MAX_NAME = 40
const MAX_MESSAGE = 280
const THEMES = ['gradient', 'wave', 'dot']

function serialize(m: {
  id: string
  name: string
  message: string
  theme: string
  lat: number | null
  lng: number | null
  city: string | null
  country: string | null
  createdAt: Date
}): GuestbookMessage {
  return {
    id: m.id,
    name: m.name,
    message: m.message,
    theme: m.theme,
    lat: m.lat,
    lng: m.lng,
    city: m.city,
    country: m.country,
    createdAt: m.createdAt.toISOString(),
  }
}

export const getGuestbookMessages = createServerFn({ method: 'GET' }).handler(
  async () => {
    try {
      const messages = await prisma.guestbookMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
      return { messages: messages.map(serialize) }
    } catch (error) {
      console.error('Error loading guestbook messages:', error)
      return { messages: [] as GuestbookMessage[] }
    }
  },
)

export const addGuestbookMessage = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      name: string
      message: string
      theme?: string
      lat?: number | null
      lng?: number | null
    }) => {
      const name = data.name?.trim() ?? ''
      const message = data.message?.trim() ?? ''

      if (!name) throw new Error('Name is required')
      if (!message) throw new Error('Message is required')
      if (name.length > MAX_NAME)
        throw new Error(`Name must be at most ${MAX_NAME} characters`)
      if (message.length > MAX_MESSAGE)
        throw new Error(`Message must be at most ${MAX_MESSAGE} characters`)

      const theme = THEMES.includes(data.theme ?? '')
        ? (data.theme as string)
        : 'gradient'

      // Optional precise coordinates from the browser Geolocation API.
      let lat: number | null = null
      let lng: number | null = null
      if (
        typeof data.lat === 'number' &&
        typeof data.lng === 'number' &&
        Number.isFinite(data.lat) &&
        Number.isFinite(data.lng) &&
        Math.abs(data.lat) <= 90 &&
        Math.abs(data.lng) <= 180
      ) {
        lat = data.lat
        lng = data.lng
      }

      return {
        name: name.slice(0, MAX_NAME),
        message: message.slice(0, MAX_MESSAGE),
        theme,
        lat,
        lng,
      }
    },
  )
  .handler(async ({ data }) => {
    let lat: number | null = null
    let lng: number | null = null
    let city: string | null = null
    let country: string | null = null

    if (data.lat != null && data.lng != null) {
      // Precise location granted by the visitor's browser.
      lat = data.lat
      lng = data.lng
      const rev = await reverseGeocode(lat, lng)
      city = rev?.city ?? null
      country = rev?.country ?? null
    }
    // No browser permission → stored without a location (no IP fallback).

    const created = await prisma.guestbookMessage.create({
      data: {
        name: data.name,
        message: data.message,
        theme: data.theme,
        lat,
        lng,
        city,
        country,
      },
    })

    return { message: serialize(created) }
  })
