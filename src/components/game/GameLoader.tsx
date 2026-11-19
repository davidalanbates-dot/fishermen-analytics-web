'use client'

import { useState, type ComponentType } from 'react'

import { track } from '@/lib/analytics'
import type { GameProps } from './types'

let gameModule: Promise<typeof import('./ServicesGame')> | null = null
const loadGame = () => (gameModule ??= import('./ServicesGame'))

/** Where the four preview chips sit on the static screen (corners, clear of the text). */
const SPOTS = [
  { left: '6%', top: 44 },
  { left: '66%', top: 52 },
  { left: '8%', top: 250 },
  { left: '70%', top: 262 },
]

/**
 * The game panel. Shows a static sonar screen with a Play button; the game code is only
 * downloaded when someone shows intent (hover/focus preloads it, Play starts it), so the
 * homepage loads no game JavaScript up front.
 */
export function GameLoader(props: GameProps) {
  const [Game, setGame] = useState<ComponentType<GameProps> | null>(null)
  const [loading, setLoading] = useState(false)
  const { text, services, listId } = props

  async function play() {
    setLoading(true)
    const mod = await loadGame()
    setGame(() => mod.ServicesGame)
  }

  return (
    <div className="game">
      {Game ? (
        <Game {...props} />
      ) : (
        <div className="game-screen">
          {services.slice(0, 4).map((s, i) => (
            <span
              key={s.id}
              className={`block-chip${s.core ? ' core' : ''}`}
              style={SPOTS[i]}
              aria-hidden="true"
            >
              {s.label}
            </span>
          ))}
          <div className="game-overlay">
            <div>
              <p className="display">{text.title}</p>
              <p>{text.text}</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={play}
                onPointerEnter={loadGame}
                onFocus={loadGame}
                disabled={loading}
              >
                {loading ? text.loading : text.play}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="game-help">
        <span>{text.help}</span>
        <a href={`#${listId}`} onClick={() => track('services_game_skip')}>
          {text.skip}
        </a>
      </div>
    </div>
  )
}
