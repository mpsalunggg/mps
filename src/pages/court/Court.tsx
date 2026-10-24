import { useEffect, useMemo, useRef, useState, type Ref, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, Line } from '@react-three/drei'
import {
  BallCollider,
  CuboidCollider,
  CylinderCollider,
  Physics,
  RigidBody,
} from '@react-three/rapier'
import { Group, Vector3 } from 'three'
import { Ball, type BallHandle } from './Ball'
import { RIM_HEIGHT, RIM_RADIUS, SPOTS, pingPong, type Vec3 } from './shot'

const BOARD_Z = -RIM_RADIUS - 0.15
const BASELINE_Z = -1.6
const ARC_RADIUS = 7.24
const CORNER_X = 6.7

interface Palette {
  background: string
  shadow: number
  line: string
}

const LIGHT: Palette = { background: '#ffffff', shadow: 0.14, line: '#0f172a' }
const DARK: Palette = { background: '#0f1113', shadow: 0.45, line: '#e5e7eb' }

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setDark(root.classList.contains('dark')))
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

function courtLines() {
  const cornerZ = Math.sqrt(ARC_RADIUS ** 2 - CORNER_X ** 2)
  const start = Math.atan2(cornerZ, -CORNER_X)
  const end = Math.atan2(cornerZ, CORNER_X)
  const arc: Vec3[] = Array.from({ length: 65 }, (_, i) => {
    const angle = start + ((end - start) * i) / 64
    return [Math.cos(angle) * ARC_RADIUS, 0.002, Math.sin(angle) * ARC_RADIUS]
  })
  const three: Vec3[] = [[-CORNER_X, 0.002, BASELINE_Z], ...arc, [CORNER_X, 0.002, BASELINE_Z]]
  const paint: Vec3[] = [
    [-2.44, 0.002, BASELINE_Z],
    [-2.44, 0.002, 4.19],
    [2.44, 0.002, 4.19],
    [2.44, 0.002, BASELINE_Z],
  ]
  const circle: Vec3[] = Array.from({ length: 49 }, (_, i) => {
    const angle = (Math.PI * i) / 48
    return [Math.cos(angle) * 1.8, 0.002, 4.19 + Math.sin(angle) * 1.8]
  })
  const baseline: Vec3[] = [
    [-7.5, 0.002, BASELINE_Z],
    [7.5, 0.002, BASELINE_Z],
  ]
  return [three, paint, circle, baseline]
}

function Floor({ palette }: { palette: Palette }) {
  const lines = useMemo(courtLines, [])
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[20, 0.1, 20]} position={[0, -0.1, 0]} restitution={0.8} friction={0.9} />
      </RigidBody>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial transparent opacity={palette.shadow} />
      </mesh>
      {lines.map((points, i) => (
        <Line key={i} points={points} color={palette.line} lineWidth={1.5} transparent opacity={0.3} />
      ))}
    </>
  )
}

function Net({ swish }: { swish: number }) {
  const group = useRef<Group>(null)
  const spring = useRef({ value: 0, velocity: 0 })

  useEffect(() => {
    if (swish > 0) spring.current.velocity += 2.6
  }, [swish])

  const strands = useMemo(() => {
    const count = 14
    const top = RIM_RADIUS
    const bottom = 0.13
    const depth = 0.42
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2
      const b = a + Math.PI / count
      return [
        [Math.cos(a) * top, 0, Math.sin(a) * top],
        [Math.cos(b) * ((top + bottom) / 2), -depth / 2, Math.sin(b) * ((top + bottom) / 2)],
        [Math.cos(a) * bottom, -depth, Math.sin(a) * bottom],
      ] as Vec3[]
    })
  }, [])

  useFrame((_, delta) => {
    const s = spring.current
    s.velocity += (-s.value * 90 - s.velocity * 9) * delta
    s.value += s.velocity * delta
    if (group.current) {
      group.current.scale.set(1 - s.value * 0.25, 1 + s.value, 1 - s.value * 0.25)
    }
  })

  return (
    <group ref={group} position={[0, RIM_HEIGHT, 0]}>
      {strands.map((points, i) => (
        <Line key={i} points={points} color="#f5f5f4" lineWidth={1.2} />
      ))}
      {strands.map((_, i) => (
        <Line
          key={`m${i}`}
          points={[strands[i][1], strands[(i + 1) % strands.length][0]]}
          color="#f5f5f4"
          lineWidth={1}
        />
      ))}
    </group>
  )
}

function Hoop({ swish, onMake, palette }: { swish: number; onMake: () => void; palette: Palette }) {
  const rimColliders = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2
        return [Math.cos(a) * RIM_RADIUS, RIM_HEIGHT, Math.sin(a) * RIM_RADIUS] as Vec3
      }),
    [],
  )

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {rimColliders.map((position, i) => (
          <BallCollider key={i} args={[0.012]} position={position} restitution={0.55} />
        ))}
        <CuboidCollider args={[0.915, 0.535, 0.015]} position={[0, RIM_HEIGHT + 0.43, BOARD_Z]} restitution={0.6} />
        <CylinderCollider
          sensor
          args={[0.03, 0.12]}
          position={[0, RIM_HEIGHT - 0.22, 0]}
          onIntersectionEnter={({ other }) => {
            if (other.rigidBodyObject?.name !== 'ball') return
            if ((other.rigidBody?.linvel().y ?? 0) < 0) onMake()
          }}
        />
      </RigidBody>

      <mesh position={[0, RIM_HEIGHT, 0]} rotation-x={Math.PI / 2} castShadow>
        <torusGeometry args={[RIM_RADIUS, 0.01, 16, 64]} />
        <meshStandardMaterial color="#e2552d" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, RIM_HEIGHT, (BOARD_Z - RIM_RADIUS) / 2]}>
        <boxGeometry args={[0.06, 0.02, -BOARD_Z - RIM_RADIUS]} />
        <meshStandardMaterial color="#e2552d" metalness={0.6} roughness={0.35} />
      </mesh>
      <Net swish={swish} />

      <group position={[0, RIM_HEIGHT + 0.43, BOARD_Z]}>
        <mesh>
          <boxGeometry args={[1.83, 1.07, 0.03]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            roughness={0.05}
            thickness={0.03}
            transparent
            opacity={0.35}
          />
        </mesh>
        <Line
          points={[
            [-0.915, -0.535, 0.02],
            [0.915, -0.535, 0.02],
            [0.915, 0.535, 0.02],
            [-0.915, 0.535, 0.02],
            [-0.915, -0.535, 0.02],
          ]}
          color={palette.line}
          lineWidth={2}
        />
        <Line
          points={[
            [-0.295, -0.385, 0.02],
            [-0.295, 0.065, 0.02],
            [0.295, 0.065, 0.02],
            [0.295, -0.385, 0.02],
            [-0.295, -0.385, 0.02],
          ]}
          color={palette.line}
          lineWidth={2}
        />
      </group>
      <mesh position={[0, (RIM_HEIGHT + 0.43) / 2, BOARD_Z - 1.1]} castShadow>
        <boxGeometry args={[0.16, RIM_HEIGHT + 0.43, 0.16]} />
        <meshStandardMaterial color={palette.line} roughness={0.6} />
      </mesh>
      <mesh position={[0, RIM_HEIGHT + 0.2, BOARD_Z - 0.55]}>
        <boxGeometry args={[0.1, 0.1, 1.1]} />
        <meshStandardMaterial color={palette.line} roughness={0.6} />
      </mesh>
    </>
  )
}

function cameraFor(spot: Vec3): Vec3 {
  const back = 1 + 2.4 / Math.hypot(spot[0], spot[2])
  return [spot[0] * back, 2.75, spot[2] * back]
}

const LOOK_AT = new Vector3(0, 2.55, 0)

function CameraRig({ spot }: { spot: Vec3 }) {
  const { camera } = useThree()
  const target = useMemo(() => new Vector3(...cameraFor(spot)), [spot])

  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-delta * 3.5)
    camera.position.lerp(target, ease)
    camera.lookAt(LOOK_AT)
  })

  return null
}

function Meter({
  chargeStart,
  power,
  fill,
}: {
  chargeStart: RefObject<number | null>
  power: RefObject<number>
  fill: RefObject<HTMLDivElement | null>
}) {
  useFrame(() => {
    const start = chargeStart.current
    power.current = start === null ? 0 : pingPong(performance.now() / 1000 - start)
    if (fill.current) fill.current.style.height = `${power.current * 100}%`
  })
  return null
}

interface CourtProps {
  ball: Ref<BallHandle>
  shot: number
  made: boolean
  makes: number
  chargeStart: RefObject<number | null>
  power: RefObject<number>
  meterFill: RefObject<HTMLDivElement | null>
  onMake: () => void
  onSettled: () => void
}

export default function Court({
  ball,
  shot,
  made,
  makes,
  chargeStart,
  power,
  meterFill,
  onMake,
  onSettled,
}: CourtProps) {
  const palette = useIsDark() ? DARK : LIGHT
  const spot = SPOTS[Math.min(SPOTS.length - 1, Math.floor(shot / 5))]
  const [start] = useState(() => cameraFor(spot))

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: start, fov: 50, near: 0.1, far: 80 }}>
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.background, 16, 38]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 11, 7]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
      />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 4]} scale={[10, 3, 1]} rotation-x={Math.PI / 2.5} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 3, 2]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[6, 3, 2]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={0.8} position={[0, 2, -6]} scale={3} />
      </Environment>

      <Physics gravity={[0, -9.81, 0]} timeStep={1 / 120}>
        <Floor palette={palette} />
        <Hoop swish={makes} onMake={onMake} palette={palette} />
        <Ball ref={ball} spot={spot} made={made} onSettled={onSettled} />
      </Physics>

      <CameraRig spot={spot} />
      <Meter chargeStart={chargeStart} power={power} fill={meterFill} />
    </Canvas>
  )
}
