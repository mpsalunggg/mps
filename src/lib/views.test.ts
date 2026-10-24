import { describe, expect, it } from 'vitest'
import { isBot } from './views'

describe('isBot', () => {
    it('lets real browsers through', () => {
        expect(
            isBot(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
            ),
        ).toBe(false)
        expect(
            isBot(
                'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
            ),
        ).toBe(false)
    })

    it('flags crawlers, link previews and missing user agents', () => {
        expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(true)
        expect(isBot('WhatsApp/2.23.20.0')).toBe(true)
        expect(isBot('')).toBe(true)
        expect(isBot(undefined)).toBe(true)
    })
})
