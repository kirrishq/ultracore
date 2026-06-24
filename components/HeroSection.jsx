'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const CharacterCanvas = dynamic(() => import('./CharacterCanvas'), { ssr: false })

const DARK_START = '#222222'
const DARK_END = '#0A0A0A'
const LIGHT_START = '#ECECEC'
const LIGHT_END = '#FFFFFF'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const lerp = (from, to, progress) => from + (to - from) * progress

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '')
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized

  const numeric = Number.parseInt(expanded, 16)
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  }
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mixHex(from, to, progress) {
  const start = hexToRgb(from)
  const end = hexToRgb(to)

  return rgbToHex({
    r: Math.round(lerp(start.r, end.r, progress)),
    g: Math.round(lerp(start.g, end.g, progress)),
    b: Math.round(lerp(start.b, end.b, progress)),
  })
}

function sampleKeyframes(keyframes, progress) {
  if (progress <= keyframes[0].p) return keyframes[0]

  for (let index = 0; index < keyframes.length - 1; index += 1) {
    const current = keyframes[index]
    const next = keyframes[index + 1]

    if (progress <= next.p) {
      const local = clamp((progress - current.p) / (next.p - current.p), 0, 1)

      return {
        ...current,
        x: lerp(current.x, next.x, local),
        y: lerp(current.y, next.y, local),
        size: lerp(current.size, next.size, local),
        opacity: lerp(current.opacity, next.opacity, local),
      }
    }
  }

  return keyframes[keyframes.length - 1]
}

function screenVisibility(progress, start, end, fade = 0.075) {
  if (progress < start - fade || progress > end + fade) return 0

  if (progress < start) {
    return clamp((progress - (start - fade)) / fade, 0, 1)
  }

  if (progress > end) {
    return clamp(((end + fade) - progress) / fade, 0, 1)
  }

  return 1
}

const SPOT_KEYFRAMES = [
  { p: 0, x: 76, y: 18, size: 64, opacity: 0.9 },
  { p: 0.33, x: 58, y: 12, size: 60, opacity: 0.88 },
  { p: 0.66, x: 50, y: 39, size: 54, opacity: 0.7 },
  { p: 0.82, x: 52, y: 58, size: 42, opacity: 0.18 },
  { p: 1, x: 50, y: 60, size: 34, opacity: 0 },
]

function ScreenFrame({
  progress,
  start,
  end,
  enter = [0, 18],
  children,
  justifyContent = 'flex-start',
  padding = '64px 20px 24px',
  alignItems = 'stretch',
  maxWidth = '100%',
}) {
  const opacity = screenVisibility(progress, start, end)
  const offsetX = lerp(enter[0], 0, opacity)
  const offsetY = lerp(enter[1], 0, opacity)

  return (
    <section
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        justifyContent,
        alignItems,
        padding,
        opacity,
        transform: `translate3d(${offsetX}px, ${offsetY}px, 0)`,
        pointerEvents: opacity > 0.02 ? 'auto' : 'none',
        willChange: 'opacity, transform',
        maxWidth,
      }}
    >
      {children}
    </section>
  )
}

function IntroScreen({ progress }) {
  return (
    <ScreenFrame
      progress={progress}
      start={0}
      end={0.28}
      justifyContent="space-between"
      padding="72px 20px 24px"
      enter={[0, 20]}
    >
      <div style={{ maxWidth: 340 }}>
        <p
          className="text-ui"
          style={{
            color: 'var(--hero-text-muted-dark)',
            marginBottom: 12,
            maxWidth: 260,
          }}
        >
          МУЖСКАЯ ЛИПОСКУЛЬПТУРА ОТ ХИРУРГА КОРОБОВА А.В.
        </p>
        <h1
          className="text-hero"
          style={{
            color: 'var(--hero-text-dark)',
            marginBottom: 18,
            maxWidth: 360,
          }}
        >
          УЛЬТРА
          <br />
          КОР
        </h1>
      </div>

      <div className="glass-card" style={{ maxWidth: 332 }}>
        <p
          className="text-body-copy"
          style={{
            color: 'var(--hero-text-muted-dark)',
            marginBottom: 18,
          }}
        >
          Собранное и атлетичное тело с естественным эффектом. Индивидуальная методика для мужчин,
          которым важно скорректировать пропорции тела и получить прогнозируемый результат с
          медицинским сопровождением.
        </p>
        <a href="#consultation" className="btn-dark">
          Записаться на консультацию
        </a>
      </div>
    </ScreenFrame>
  )
}

function HowItWorksScreen({ progress }) {
  return (
    <ScreenFrame
      progress={progress}
      start={0.22}
      end={0.56}
      justifyContent="center"
      padding="0 20px"
      alignItems="flex-start"
      enter={[-18, 14]}
    >
      <div style={{ maxWidth: 330, paddingTop: '33vh' }}>
        <h2
          className="text-h2"
          style={{
            color: 'var(--hero-text-dark)',
            marginBottom: 14,
            maxWidth: 320,
          }}
        >
          КАК РАБОТАЕТ
          <br />
          УЛЬТРАКОР
        </h2>
        <p
          className="text-body-copy"
          style={{
            color: 'var(--hero-text-muted-dark)',
            maxWidth: 290,
          }}
        >
          Методика сочетает удаление лишних жировых отложений и точное моделирование пропорций с
          учётом мужской анатомии. Цель - не просто уменьшить объём, а сделать силуэт более
          рельефным и гармоничным.
        </p>
      </div>
    </ScreenFrame>
  )
}

function TissueScreen({ progress }) {
  return (
    <ScreenFrame
      progress={progress}
      start={0.48}
      end={0.82}
      justifyContent="flex-end"
      padding="0 20px 24px"
      enter={[0, 18]}
    >
      <div className="glass-card" style={{ maxWidth: 332 }}>
        <p
          className="text-ui"
          style={{
            color: 'var(--hero-text-muted-dark)',
            marginBottom: 12,
          }}
        >
          ЖИРОВАЯ ТКАНЬ КАК ЕСТЕСТВЕННЫЙ И НАДЁЖНЫЙ ФИЛЛЕР
        </p>
        <p
          className="text-body-copy"
          style={{
            color: 'var(--hero-text-muted-dark)',
            marginBottom: 12,
          }}
        >
          Липофилинг - это безопасная методика коррекции, при которой используется собственная
          жировая ткань пациента. Она полностью биосовместима, поэтому риск аллергии или
          отторжения сводится к минимуму.
        </p>
        <p className="text-body-copy" style={{ color: 'var(--hero-text-muted-dark)' }}>
          Введение жира проводится по строго отработанным медицинским протоколам. Жировая ткань
          не только восполняет объём, но и улучшает качество тканей, обеспечивая естественный и
          долговременный результат без имплантов.
        </p>
      </div>
    </ScreenFrame>
  )
}

function StepsScreen({ progress }) {
  const steps = [
    {
      num: '01',
      title: 'КОНСУЛЬТАЦИЯ',
      desc: 'Врач оценивает пропорции тела, зоны коррекции и ожидаемый результат',
    },
    {
      num: '02',
      title: 'ЛИПОСАКЦИЯ',
      desc: 'Убираются локальные жировые отложения там, где они скрывают рельеф',
    },
    {
      num: '03',
      title: 'ЛИПОФИЛИНГ',
      desc: 'Собственные ткани используются для дополнительного объёма и акцента в нужных зонах',
    },
    {
      num: '04',
      title: 'РЕАБИЛИТАЦИЯ',
      desc: 'Восстановление после операции занимает всего несколько дней',
    },
  ]

  return (
    <ScreenFrame
      progress={progress}
      start={0.74}
      end={1}
      justifyContent="flex-end"
      padding="0 20px 28px"
      enter={[0, 22]}
    >
      <div className="glass-card-light" style={{ maxWidth: 332 }}>
        <h2
          className="text-h2"
          style={{
            color: 'var(--hero-text-light)',
            marginBottom: 18,
            maxWidth: 300,
          }}
        >
          ВЗГЛЯНИТЕ НА СЕБЯ
          <br />
          ПО-ДРУГОМУ ЗА 4 ШАГА:
        </h2>

        <div style={{ display: 'grid', gap: 14 }}>
          {steps.map((step) => (
            <div key={step.num}>
              <p
                className="text-ui"
                style={{
                  color: 'var(--hero-text-light)',
                  marginBottom: 4,
                }}
              >
                {step.num}. {step.title}
              </p>
              <p className="text-body-copy" style={{ color: 'var(--hero-text-muted-light)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <a href="#consultation" className="btn-light" style={{ marginTop: 18 }}>
          ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ
        </a>
      </div>
    </ScreenFrame>
  )
}

function Background({ progress }) {
  const bgBlend = smoothstep(0.74, 0.92, progress)
  const baseStart = mixHex(DARK_START, LIGHT_START, bgBlend)
  const baseEnd = mixHex(DARK_END, LIGHT_END, bgBlend)
  const spot = sampleKeyframes(SPOT_KEYFRAMES, progress)
  const noiseOpacity = lerp(0.045, 0.06, bgBlend)

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${baseStart} 0%, ${baseEnd} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, rgba(34, 34, 34, ${spot.opacity}) 0%, rgba(34, 34, 34, ${spot.opacity * 0.55}) 20%, rgba(34, 34, 34, 0) 56%)`,
          transform: 'translateZ(0)',
          filter: 'blur(38px)',
          opacity: 1 - bgBlend * 0.9,
          pointerEvents: 'none',
        }}
      />

      <div
        className="hero-noise"
        style={{
          zIndex: 1,
          opacity: noiseOpacity,
        }}
      />
    </div>
  )
}

export default function HeroSection() {
  const wrapperRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return undefined

    let frame = 0

    const updateProgress = () => {
      frame = 0

      const rect = wrapper.getBoundingClientRect()
      const totalScroll = rect.height - window.innerHeight
      const nextProgress = totalScroll <= 0
        ? 0
        : clamp((-rect.top) / totalScroll, 0, 1)

      setProgress(nextProgress)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateProgress)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div ref={wrapperRef} style={{ height: '400vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            isolation: 'isolate',
          }}
        >
          <Background progress={progress} />

          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
            <CharacterCanvas progress={progress} />
          </div>

          <IntroScreen progress={progress} />
          <HowItWorksScreen progress={progress} />
          <TissueScreen progress={progress} />
          <StepsScreen progress={progress} />
        </div>
      </div>

      <section
        id="about"
        style={{
          padding: '80px 20px 96px',
          background: 'linear-gradient(160deg, var(--color-bg-light-start) 0%, var(--color-bg-light-end) 100%)',
          color: 'var(--hero-text-light)',
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p className="text-ui" style={{ color: 'var(--hero-text-muted-light)', marginBottom: 12 }}>
            Показания
          </p>
          <h2 className="text-h2" style={{ color: 'var(--hero-text-light)', marginBottom: 32 }}>
            Кому подходит методика
          </h2>
          {[
            'Есть локальные жировые зоны, которые не уходят даже при тренировках',
            'Хочется более собранный и атлетичный силуэт без неестественного эффекта',
            'В теле не хватает визуальной чёткости: плечи, грудь, пресс, талия',
            'Нужен заметный результат, а времени на долгую трансформацию мало',
            'Важно, чтобы итог выглядел по-мужски и гармонично',
          ].map((text, index) => (
            <div
              key={text}
              style={{
                borderBottom: '1px solid rgba(10, 10, 10, 0.08)',
                padding: '14px 0',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <span
                className="text-ui"
                style={{
                  color: 'var(--hero-text-muted-light)',
                  minWidth: 24,
                }}
              >
                0{index + 1}
              </span>
              <p className="text-body-copy" style={{ color: 'var(--hero-text-muted-light)' }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
