'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { track } from '@/lib/analytics'
import type { GameProps, GameService } from './types'

/**
 * "Cast for our services": an original arcade game for the homepage.
 * A boat at the bottom casts hooks up at drifting service blocks. Each catch shows that
 * service; catching all seven within the round ends on a "Let's talk" call to action.
 *
 * Loaded only when someone presses Play (see GameLoader), so it adds nothing to page load.
 * Controls: arrow keys + Space/Up, mouse move + click, or touch drag + tap. Escape stops.
 * With reduced motion the blocks stay still and the water does not move.
 */

const ROUND_SECONDS = 30
const MAX_HOOKS = 2
const HOOK_SPEED = 520
const BOAT_SPEED = 360
const COLORS = {
  water: '#04202c',
  grid: 'rgba(0, 162, 232, 0.14)',
  wave: 'rgba(0, 162, 232, 0.55)',
  yellow: '#FFF200',
  sky: '#00A2E8',
  ink: '#000000',
  line: '#f2f5f7',
}

type Block = { s: GameService; x: number; y: number; w: number; h: number; caught: boolean }
type Phase = 'playing' | 'won' | 'lost'

export function ServicesGame({ services, text, contactHref, listId }: GameProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<Phase>('playing')
  const [caught, setCaught] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS)
  const [lastCatch, setLastCatch] = useState<GameService | null>(null)
  const [round, setRound] = useState(0)
  const total = services.length

  const restart = useCallback(() => {
    setPhase('playing')
    setCaught(0)
    setSecondsLeft(ROUND_SECONDS)
    setLastCatch(null)
    setRound((r) => r + 1)
  }, [])

  // The game loop. Re-runs for each round.
  useEffect(() => {
    if (phase !== 'playing') return
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() ||
      'sans-serif'

    let W = 0
    let H = 0
    let raf = 0
    let last = performance.now()
    let timeLeft = ROUND_SECONDS
    let shownSeconds = ROUND_SECONDS
    let caughtCount = 0
    let dir = 1
    let catchTimer = 0
    let ended = false
    const keys: Record<string, boolean> = {}
    let hooks: { x: number; y: number }[] = []
    let blocks: Block[] = []
    const boat = { x: 0, w: 64 }

    function layout() {
      const pad = 14
      const gap = 10
      const top = 44
      const perRow = W < 440 ? 3 : 4
      const bw = Math.min(150, (W - pad * 2 - gap * (perRow - 1)) / perRow - 8)
      const bh = 34
      blocks = services.map((s, i) => ({
        s,
        x: pad + (i % perRow) * (bw + gap),
        y: top + Math.floor(i / perRow) * (bh + gap),
        w: bw,
        h: bh,
        caught: false,
      }))
    }

    function resize() {
      const rect = wrap!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const firstLayout = W === 0
      W = rect.width
      H = rect.height
      canvas!.width = Math.round(W * dpr)
      canvas!.height = Math.round(H * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (firstLayout) {
        layout()
        boat.x = W / 2
      }
      boat.x = Math.max(boat.w / 2 + 6, Math.min(W - boat.w / 2 - 6, boat.x))
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx!.beginPath()
      ctx!.moveTo(x + r, y)
      ctx!.arcTo(x + w, y, x + w, y + h, r)
      ctx!.arcTo(x + w, y + h, x, y + h, r)
      ctx!.arcTo(x, y + h, x, y, r)
      ctx!.arcTo(x, y, x + w, y, r)
      ctx!.closePath()
    }

    function draw(now: number) {
      const c = ctx!
      // Water and sonar grid
      c.fillStyle = COLORS.water
      c.fillRect(0, 0, W, H)
      c.strokeStyle = COLORS.grid
      c.lineWidth = 1
      for (let y = 82; y < H; y += 82) {
        c.beginPath()
        c.moveTo(0, y)
        c.lineTo(W, y)
        c.stroke()
      }
      for (let x = 130; x < W; x += 130) {
        c.beginPath()
        c.moveTo(x, 0)
        c.lineTo(x, H)
        c.stroke()
      }
      // Surface line
      c.strokeStyle = COLORS.wave
      c.lineWidth = 2
      c.beginPath()
      const y0 = H - 30
      for (let x = 0; x <= W; x += 8) {
        const y = y0 + (reduceMotion ? 0 : Math.sin(x / 18 + now / 400) * 3)
        if (x === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.stroke()
      // Blocks
      c.font = `600 ${W < 440 ? 11.5 : 13}px ${fontFamily}`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      for (const b of blocks) {
        if (b.caught) continue
        roundRect(b.x, b.y, b.w, b.h, 6)
        c.fillStyle = b.s.core ? COLORS.yellow : COLORS.sky
        c.fill()
        c.fillStyle = COLORS.ink
        c.fillText(b.s.label, b.x + b.w / 2, b.y + b.h / 2 + 1, b.w - 10)
      }
      // Hooks and lines
      for (const h of hooks) {
        c.strokeStyle = COLORS.line
        c.lineWidth = 1.5
        c.setLineDash([4, 3])
        c.beginPath()
        c.moveTo(h.x, H - 52)
        c.lineTo(h.x, h.y + 16)
        c.stroke()
        c.setLineDash([])
        c.strokeStyle = COLORS.yellow
        c.lineWidth = 2.5
        c.beginPath()
        c.moveTo(h.x, h.y + 16)
        c.lineTo(h.x, h.y + 4)
        c.arc(h.x - 5, h.y + 4, 5, 0, Math.PI, true)
        c.stroke()
      }
      // Boat
      const by = H - 36
      c.fillStyle = COLORS.yellow
      c.beginPath()
      c.moveTo(boat.x - 32, by - 10)
      c.lineTo(boat.x + 32, by - 10)
      c.lineTo(boat.x + 22, by + 6)
      c.lineTo(boat.x - 22, by + 6)
      c.closePath()
      c.fill()
      c.fillRect(boat.x - 1.5, by - 28, 3, 18)
      c.strokeStyle = COLORS.yellow
      c.lineWidth = 2
      c.beginPath()
      c.moveTo(boat.x, by - 28)
      c.lineTo(boat.x + 14, by - 38)
      c.stroke()
    }

    function cast() {
      if (ended || hooks.length >= MAX_HOOKS) return
      hooks.push({ x: boat.x, y: H - 56 })
    }

    function finish(won: boolean) {
      if (ended) return
      ended = true
      cancelAnimationFrame(raf)
      track('services_game_complete', { caught: caughtCount, total, won })
      setPhase(won ? 'won' : 'lost')
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      timeLeft -= dt

      if (keys.ArrowLeft) boat.x -= BOAT_SPEED * dt
      if (keys.ArrowRight) boat.x += BOAT_SPEED * dt
      boat.x = Math.max(boat.w / 2 + 6, Math.min(W - boat.w / 2 - 6, boat.x))

      const live = blocks.filter((b) => !b.caught)
      if (!reduceMotion) {
        const speed = 70 + (total - live.length) * 6
        let hitEdge = false
        for (const b of live) {
          b.x += dir * speed * dt
          if (b.x < 8 || b.x + b.w > W - 8) hitEdge = true
        }
        if (hitEdge) {
          dir *= -1
          for (const b of live) {
            b.x += dir * speed * dt * 2
            b.y = Math.min(b.y + 10, H - 130)
          }
        }
      }

      for (const h of hooks) h.y -= HOOK_SPEED * dt
      hooks = hooks.filter((h) => {
        if (h.y < 0) return false
        const hit = live.find(
          (b) => !b.caught && h.x > b.x && h.x < b.x + b.w && h.y > b.y && h.y < b.y + b.h,
        )
        if (!hit) return true
        hit.caught = true
        caughtCount += 1
        catchTimer = 3.5
        setCaught(caughtCount)
        setLastCatch(hit.s)
        track('services_game_catch', { service: hit.s.title, caught: caughtCount })
        return false
      })

      if (catchTimer > 0) {
        catchTimer -= dt
        if (catchTimer <= 0) setLastCatch(null)
      }
      const s = Math.max(0, Math.ceil(timeLeft))
      if (s !== shownSeconds) {
        shownSeconds = s
        setSecondsLeft(s)
      }

      draw(now)
      if (caughtCount === total) return finish(true)
      if (timeLeft <= 0) return finish(false)
      raf = requestAnimationFrame(tick)
    }

    const pointerX = (e: PointerEvent) => e.clientX - canvas.getBoundingClientRect().left
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = true
        e.preventDefault()
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        cast()
        e.preventDefault()
      } else if (e.key === 'Escape') {
        finish(false)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false
    }
    const onPointerMove = (e: PointerEvent) => {
      boat.x = pointerX(e)
    }
    const onPointerDown = (e: PointerEvent) => {
      boat.x = pointerX(e)
      cast()
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)
    canvas.addEventListener('keydown', onKeyDown)
    canvas.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.focus({ preventScroll: true })
    track('services_game_start', { round: round + 1 })
    raf = requestAnimationFrame(tick)

    return () => {
      ended = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener('keydown', onKeyDown)
      canvas.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [phase, round, services, total])

  return (
    <div className="game-screen live" ref={wrapRef}>
      <canvas ref={canvasRef} tabIndex={0} aria-label={text.canvasLabel} />
      <div className="game-hud" aria-hidden="true">
        <span>
          {text.caught} {caught} / {total}
        </span>
        <span>
          {secondsLeft}
          {text.seconds}
        </span>
      </div>

      <div className="game-catch" role="status" aria-live="polite">
        {lastCatch && phase === 'playing' ? (
          <>
            <strong>{lastCatch.title}</strong>
            <span>{lastCatch.summary}</span>
            <Link
              href={lastCatch.href}
              onClick={() => track('services_game_service_click', { service: lastCatch.title })}
            >
              {text.more} →
            </Link>
          </>
        ) : null}
      </div>

      {phase !== 'playing' ? (
        <div className="game-overlay">
          <div>
            <p className="display">
              {phase === 'won' ? text.wonTitle : text.lostTitle.replace('{n}', String(caught))}
            </p>
            <p>{phase === 'won' ? text.wonText : text.lostText}</p>
            <div className="ctas" style={{ justifyContent: 'center', marginTop: 0 }}>
              {phase === 'won' ? (
                <Link
                  href={contactHref}
                  className="btn btn-primary"
                  onClick={() => track('services_game_cta_click', { caught })}
                >
                  {text.cta}
                </Link>
              ) : null}
              <button
                type="button"
                className={`btn ${phase === 'won' ? 'btn-ghost' : 'btn-primary'}`}
                onClick={restart}
              >
                {text.playAgain}
              </button>
              {phase === 'lost' ? (
                <a href={`#${listId}`} className="btn btn-ghost">
                  {text.skip}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
