export type Vec3 = [number, number, number]

export const GRAVITY = 9.81
export const RIM_HEIGHT = 3.05
export const RIM_RADIUS = 0.2286
export const BALL_RADIUS = 0.12
export const RELEASE_HEIGHT = 2.25
export const LAUNCH_ANGLE = 52
export const SWEET_SPOT = 0.72
export const SWEET_RANGE = 0.045

export const RIM_CENTER: Vec3 = [0, RIM_HEIGHT, 0]

export const SPOTS: Vec3[] = [
  [-6.95, 0, 0.45],
  [-5.3, 0, 5.3],
  [0, 0, 7.5],
  [5.3, 0, 5.3],
  [6.95, 0, 0.45],
]

export function releasePoint(spot: Vec3): Vec3 {
  const distance = Math.hypot(spot[0], spot[2])
  const step = 0.3 / distance
  return [spot[0] - spot[0] * step, RELEASE_HEIGHT, spot[2] - spot[2] * step]
}

export function launchVelocity(from: Vec3, target: Vec3, angleDeg = LAUNCH_ANGLE): Vec3 {
  const dx = target[0] - from[0]
  const dz = target[2] - from[2]
  const distance = Math.hypot(dx, dz)
  const rise = target[1] - from[1]
  const angle = (angleDeg * Math.PI) / 180
  const cos = Math.cos(angle)
  const speed = Math.sqrt(
    (GRAVITY * distance * distance) / (2 * cos * cos * (distance * Math.tan(angle) - rise)),
  )
  const horizontal = speed * cos
  return [(dx / distance) * horizontal, speed * Math.sin(angle), (dz / distance) * horizontal]
}

export function powerError(power: number) {
  const offset = power - SWEET_SPOT
  const excess = Math.max(0, Math.abs(offset) - SWEET_RANGE)
  return Math.sign(offset) * excess
}

export function shotFromPower(from: Vec3, power: number, shotIndex: number) {
  const error = powerError(power)
  const ideal = launchVelocity(from, RIM_CENTER)
  const scale = 1 + error * 0.16
  const drift = error === 0 ? 0 : Math.abs(error) * 0.16 * (shotIndex % 2 === 0 ? 1 : -1)
  const cos = Math.cos(drift)
  const sin = Math.sin(drift)
  const velocity: Vec3 = [
    (ideal[0] * cos - ideal[2] * sin) * scale,
    ideal[1] * scale,
    (ideal[0] * sin + ideal[2] * cos) * scale,
  ]
  const flat = Math.hypot(velocity[0], velocity[2])
  const spin = 18
  const backspin: Vec3 = [(-velocity[2] / flat) * spin, 0, (velocity[0] / flat) * spin]
  return { velocity, backspin }
}

export function pingPong(seconds: number, period = 1.8) {
  const phase = (seconds / period) % 1
  return phase < 0.5 ? phase * 2 : 2 - phase * 2
}
