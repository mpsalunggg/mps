import { useImperativeHandle, useMemo, useRef, type Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import { BallCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { createBallTextures } from './ballTexture'
import { BALL_RADIUS, RIM_HEIGHT, releasePoint, shotFromPower, type Vec3 } from './shot'

export interface BallHandle {
  shoot: (power: number, shotIndex: number) => void
}

interface BallProps {
  ref: Ref<BallHandle>
  spot: Vec3
  made: boolean
  onSettled: () => void
}

const MISS_TIMEOUT = 2.2
const MAKE_TIMEOUT = 0.6
const MISS_DELAY = 0.35
const MISS_HEIGHT = RIM_HEIGHT - 0.6

export function Ball({ ref, spot, made, onSettled }: BallProps) {
  const body = useRef<RapierRigidBody>(null)
  const textures = useMemo(createBallTextures, [])
  const flight = useRef<{ start: number; madeAt: number | null; missedAt: number | null } | null>(
    null,
  )
  const hand = useMemo(() => releasePoint(spot), [spot])

  useImperativeHandle(ref, () => ({
    shoot(power, shotIndex) {
      const rb = body.current
      if (!rb || flight.current) return
      const { velocity, backspin } = shotFromPower(hand, power, shotIndex)
      rb.setGravityScale(1, true)
      rb.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true)
      rb.setAngvel({ x: backspin[0], y: backspin[1], z: backspin[2] }, true)
      flight.current = { start: performance.now() / 1000, madeAt: null, missedAt: null }
    },
  }))

  useFrame(({ clock }) => {
    const rb = body.current
    if (!rb) return
    const now = performance.now() / 1000
    const current = flight.current

    if (!current) {
      rb.setGravityScale(0, false)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, false)
      rb.setAngvel({ x: 0, y: 0.6, z: 0 }, false)
      rb.setTranslation(
        { x: hand[0], y: hand[1] + Math.sin(clock.elapsedTime * 2.2) * 0.012, z: hand[2] },
        true,
      )
      return
    }

    if (made && current.madeAt === null) current.madeAt = now
    if (!made && current.missedAt === null && rb.linvel().y < 0 && rb.translation().y < MISS_HEIGHT) {
      current.missedAt = now
    }
    const settled =
      current.madeAt !== null
        ? now - current.madeAt > MAKE_TIMEOUT
        : (current.missedAt !== null && now - current.missedAt > MISS_DELAY) ||
          now - current.start > MISS_TIMEOUT
    if (settled) {
      flight.current = null
      onSettled()
    }
  })

  return (
    <RigidBody
      ref={body}
      name="ball"
      colliders={false}
      position={hand}
      gravityScale={0}
      ccd
      angularDamping={0.1}
    >
      <BallCollider args={[BALL_RADIUS]} mass={0.62} restitution={0.72} friction={0.8} />
      <mesh castShadow>
        <sphereGeometry args={[BALL_RADIUS, 96, 64]} />
        <meshStandardMaterial
          map={textures.map}
          bumpMap={textures.bumpMap}
          bumpScale={1}
          roughnessMap={textures.roughnessMap}
          roughness={1}
          envMapIntensity={1.6}
        />
      </mesh>
    </RigidBody>
  )
}
