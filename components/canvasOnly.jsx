'use client'

import { useState, useEffect } from 'react'
import CharacterCanvas from './CharacterCanvas'

export default function CanvasOnly() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'scroll') setProgress(e.data.progress)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CharacterCanvas progress={progress} />
    </div>
  )
}