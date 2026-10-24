import { describe, expect, it } from 'vitest'
import { GRAVITY, RIM_CENTER, SPOTS, launchVelocity, releasePoint } from './shot'

describe('launchVelocity', () => {
    it('drops the ball through the rim center from every spot', () => {
        for (const spot of SPOTS) {
            const from = releasePoint(spot)
            const [vx, vy, vz] = launchVelocity(from, RIM_CENTER)
            const t = Math.abs((RIM_CENTER[0] - from[0]) / vx || (RIM_CENTER[2] - from[2]) / vz)
            const landing = [from[0] + vx * t, from[1] + vy * t - 0.5 * GRAVITY * t * t, from[2] + vz * t]
            landing.forEach((value, i) => expect(value).toBeCloseTo(RIM_CENTER[i], 2))
            expect(vy - GRAVITY * t).toBeLessThan(0)
        }
    })
})
