'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import { Box3, MathUtils, Vector3 } from 'three'

const MODEL_KEYFRAMES = [
  { p: 0, x: -0.1, y: -0.92, s: 1.7, ry: 0.3 },
  { p: 0.33, x: 3.22, y: -0.86, s: 2.35, ry: 0.5 },
  { p: 0.66, x: 0.05, y: -1.58, s: 2, ry: 0 },
  { p: 1, x: 0.08, y: -0.7, s: 1.78, ry: 0 },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const lerp = (from, to, progress) => from + (to - from) * progress

function sampleKeyframes(keyframes, progress) {
  if (progress <= keyframes[0].p) return keyframes[0]

  for (let index = 0; index < keyframes.length - 1; index += 1) {
    const current = keyframes[index]
    const next = keyframes[index + 1]

    if (progress <= next.p) {
      const local = clamp((progress - current.p) / (next.p - current.p), 0, 1)
      const fields = ['x', 'y', 'z', 's', 'ry', 'size', 'opacity', 'lookY']
      const blended = {}

      for (const field of fields) {
        if (current[field] !== undefined || next[field] !== undefined) {
          const from = current[field] ?? next[field] ?? 0
          const to = next[field] ?? current[field] ?? 0
          blended[field] = lerp(from, to, local)
        }
      }

      return {
        ...current,
        ...blended,
      }
    }
  }

  return keyframes[keyframes.length - 1]
}

function Model({ progress }) {
  const groupRef = useRef(null)
  const targetRef = useRef(sampleKeyframes(MODEL_KEYFRAMES, progress))
  const fitScaleRef = useRef(1)
  const { scene } = useGLTF('/model.glb')
  const { camera } = useThree()
  const center = useMemo(() => new Vector3(), [])
  const size = useMemo(() => new Vector3(), [])

  useEffect(() => {
    targetRef.current = sampleKeyframes(MODEL_KEYFRAMES, progress)
  }, [progress])

  useEffect(() => {
    if (!scene || !groupRef.current) return

    const box = new Box3().setFromObject(scene)
    box.getCenter(center)
    box.getSize(size)

    const maxDimension = Math.max(size.x, size.y, size.z, 1)
    fitScaleRef.current = 3.2 / maxDimension

    scene.position.sub(center)

    const target = targetRef.current
    groupRef.current.position.set(target.x, target.y, 0)
    groupRef.current.rotation.set(0, target.ry, 0)
    groupRef.current.scale.setScalar(target.s * fitScaleRef.current)
  }, [camera, center, scene, size])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const target = targetRef.current
    const smoothing = 1 - Math.pow(0.001, delta)
    const scaleTarget = target.s * fitScaleRef.current

    const cameraTargets = [
      { p: 0, x: 0.65, y: 0.15, z: 5.4, lookY: 0.2 },
      { p: 0.33, x: 10.15, y: 0.05, z: 5.15, lookY: 0.05 },
      { p: 0.66, x: 0.1, y: -0.75, z: 4.65, lookY: -0.5 },
      { p: 1, x: 0, y: 4.85, z: 5.1, lookY: 0.05 },
    ]

    const cameraTarget = sampleKeyframes(cameraTargets, progress)

    groupRef.current.position.x = MathUtils.lerp(groupRef.current.position.x, target.x, smoothing)
    groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, target.y, smoothing)
    groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, target.ry, smoothing)
    groupRef.current.scale.x = MathUtils.lerp(groupRef.current.scale.x, scaleTarget, smoothing)
    groupRef.current.scale.y = MathUtils.lerp(groupRef.current.scale.y, scaleTarget, smoothing)
    groupRef.current.scale.z = MathUtils.lerp(groupRef.current.scale.z, scaleTarget, smoothing)

    camera.position.x = MathUtils.lerp(camera.position.x, cameraTarget.x, smoothing)
    camera.position.y = MathUtils.lerp(camera.position.y, cameraTarget.y, smoothing)
    camera.position.z = MathUtils.lerp(camera.position.z, cameraTarget.z, smoothing)
    camera.lookAt(0, cameraTarget.lookY, 0)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

export default function CharacterCanvas({ progress }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 42 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 8, 4]} intensity={1.8} />
      <directionalLight position={[-4, 2, -3]} intensity={0.45} color="#aabbff" />
      <pointLight position={[0, 3, 2]} intensity={0.55} />
      <Environment preset="city" />
      <Suspense fallback={null}>
        <Model progress={progress} />
        <ContactShadows
          position={[0, -3.2, 0]}
          opacity={0.18}
          scale={6}
          blur={3}
          color="#000000"
        />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload('/model.glb')
