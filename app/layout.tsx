import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'УЛЬТРАКОР — методика доктора Коробова',
  description: 'Инженерия мужской силы. Архитектура тела. Атлетизация 2.0.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
