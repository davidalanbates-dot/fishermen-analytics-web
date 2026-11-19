'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'

import { track } from '@/lib/analytics'
import { GameTitle } from './GameTitle'
import type { GameProps } from './types'

/** A still frame of the sea and boat, shown until the live game takes over. */
function StillSea() {
  return (
    <svg
      className="still-sea"
      viewBox="0 0 560 330"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <g transform="translate(380 266) rotate(-10)">
        <path d="M-32 -10 H32 L22 6 H-22 Z" fill="#FFF200" />
        <rect x="-9" y="-18" width="18" height="8" fill="#FFF200" />
        <rect x="-2" y="-36" width="4" height="20" fill="#FFF200" />
      </g>
      <path
        d="M0 282 C 70 266, 140 266, 210 284 S 330 296, 380 272 S 480 258, 560 276 L560 330 L0 330 Z"
        fill="#063448"
        fillOpacity="0.92"
      />
      <path
        d="M0 282 C 70 266, 140 266, 210 284 S 330 296, 380 272 S 480 258, 560 276"
        fill="none"
        stroke="#00A2E8"
        strokeWidth="2"
      />
    </svg>
  )
}

type LiveGame = ComponentType<GameProps & { autoStart?: boolean }>

let gameModule: Promise<typeof import('./ServicesGame')> | null = null
const loadGame = () => (gameModule ??= import('./ServicesGame'))

/**
 * The game panel. The title screen renders immediately (no game code needed). The game
 * code is fetched only when the panel is about to scroll into view, then the live sea and
 * boat take over behind the same title. So the homepage loads no game JavaScript up front.
 */
export function GameLoader(props: GameProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [Game, setGame] = useState<LiveGame | null>(null)
  const [autoStart, setAutoStart] = useState(false)
  const { text, listId } = props

  // Fetch the game when the panel comes within 300px of the viewport.
  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    let cancelled = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        loadGame().then((mod) => {
          if (!cancelled) setGame(() => mod.ServicesGame)
        })
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [])

  // Play pressed before the code arrived: start the round as soon as it lands.
  function playEarly() {
    setAutoStart(true)
    loadGame().then((mod) => setGame(() => mod.ServicesGame))
  }

  return (
    <div className="game" ref={panelRef}>
      {Game ? (
        <Game {...props} autoStart={autoStart} />
      ) : (
        <div className="game-screen">
          <StillSea />
          <GameTitle text={text} onPlay={playEarly} busy={autoStart} onIntent={loadGame} />
        </div>
      )}
      <div className="game-help">
        <span className="help-fine">{text.help}</span>
        <span className="help-touch">{text.helpTouch}</span>
        <a href={`#${listId}`} onClick={() => track('services_game_skip')}>
          {text.skip}
        </a>
      </div>
    </div>
  )
}
