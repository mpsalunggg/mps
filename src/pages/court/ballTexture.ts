import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

const WIDTH = 2048
const HEIGHT = 1024
const SEAM = 0.024
const GROOVE = 0.05

function seamDistance(x: number, y: number) {
  const curve = Math.abs(Math.abs(x) - 0.7 + 0.45 * y * y)
  return Math.min(Math.abs(y), Math.abs(x), curve)
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function hash(n: number) {
  const s = Math.sin(n) * 43758.5453
  return s - Math.floor(s)
}

function canvas() {
  const element = document.createElement('canvas')
  element.width = WIDTH
  element.height = HEIGHT
  const context = element.getContext('2d')!
  return { element, context, image: context.createImageData(WIDTH, HEIGHT) }
}

function pebbles() {
  const field = new Float32Array(WIDTH * HEIGHT)
  const count = 170000
  for (let i = 0; i < count; i++) {
    const cx = hash(i * 1.37) * WIDTH
    const cy = hash(i * 7.91 + 3.1) * HEIGHT
    const stretch = 1 / Math.max(0.15, Math.sin((cy / HEIGHT) * Math.PI))
    const radius = 1.5 + hash(i * 3.3) * 0.9
    const rx = radius * stretch
    for (let py = Math.floor(cy - radius); py <= cy + radius; py++) {
      if (py < 0 || py >= HEIGHT) continue
      for (let px = Math.floor(cx - rx); px <= cx + rx; px++) {
        const wrapped = (px + WIDTH) % WIDTH
        const d = ((px - cx) / rx) ** 2 + ((py - cy) / radius) ** 2
        if (d > 1) continue
        const index = py * WIDTH + wrapped
        field[index] = Math.max(field[index], Math.cos(d * Math.PI * 0.5))
      }
    }
  }
  return field
}

export function createBallTextures() {
  const color = canvas()
  const bump = canvas()
  const rough = canvas()
  const field = pebbles()

  for (let py = 0; py < HEIGHT; py++) {
    const lat = (0.5 - py / HEIGHT) * Math.PI
    const ring = Math.cos(lat)
    const y = Math.sin(lat)
    for (let px = 0; px < WIDTH; px++) {
      const lon = (px / WIDTH) * Math.PI * 2
      const x = ring * Math.cos(lon)
      const z = ring * Math.sin(lon)
      const distance = seamDistance(x, y)
      const seam = 1 - smoothstep(SEAM * 0.8, SEAM * 1.15, distance)
      const groove = 1 - smoothstep(SEAM, GROOVE, distance)
      const pebble = field[py * WIDTH + px] * (1 - groove)
      const mottle = 0.94 + 0.04 * Math.sin(x * 11 + z * 4) * Math.cos(y * 9 - x * 3)
      const shade = mottle * (0.86 + pebble * 0.2) * (1 - groove * 0.25)
      const i = (py * WIDTH + px) * 4

      color.image.data[i] = 204 * shade * (1 - seam) + 24 * seam
      color.image.data[i + 1] = 86 * shade * (1 - seam) + 20 * seam
      color.image.data[i + 2] = 30 * shade * (1 - seam) + 18 * seam
      color.image.data[i + 3] = 255

      const height = (0.5 + pebble * 0.3) * (1 - groove * 0.9)
      bump.image.data[i] = bump.image.data[i + 1] = bump.image.data[i + 2] = height * 255
      bump.image.data[i + 3] = 255

      const roughness = 0.78 - pebble * 0.16 + seam * 0.08
      rough.image.data[i] = rough.image.data[i + 1] = rough.image.data[i + 2] = roughness * 255
      rough.image.data[i + 3] = 255
    }
  }

  const toTexture = ({ element, context, image }: ReturnType<typeof canvas>, srgb = false) => {
    context.putImageData(image, 0, 0)
    const texture = new CanvasTexture(element)
    texture.wrapS = RepeatWrapping
    texture.anisotropy = 8
    if (srgb) texture.colorSpace = SRGBColorSpace
    return texture
  }

  return {
    map: toTexture(color, true),
    bumpMap: toTexture(bump),
    roughnessMap: toTexture(rough),
  }
}
