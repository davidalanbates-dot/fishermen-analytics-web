'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { track } from '@/lib/analytics'
import { GameTitle } from './GameTitle'
import type { GameProps, GameService } from './types'

/**
 * "Cast for our services": an original arcade game for the homepage.
 *
 * The boat rides a rolling sea. As the swell lifts and tilts it, its pixel shots fly along
 * the tilt, so timing a shot to the slope of a wave lets you hit blocks that are not directly
 * above you. The sea gets rougher with every catch. Each catch shows that service; catching
 * all seven within the round ends on a "Let's talk" call to action.
 * (Rolling-wave mechanic inspired by classic boat shooters; the game, art and content are ours.)
 *
 * Loaded only when someone presses Play (see GameLoader), so it adds nothing to page load.
 * Controls: arrow keys + Space/Up, mouse move + click, or touch drag + tap. Escape stops.
 * Reduced motion: a calm sea, a level boat that fires straight up, and blocks that stay still.
 */

const ROUND_SECONDS = 30
const MAX_SHOTS = 2
const RELOAD_SECONDS = 0.5 // minimum time between shots, so mashing fire does not win
const SHOT_SPEED = 560
const BOAT_SPEED = 360
const PIXEL = 4 // size of one "pixel" in the shot sprite
const SWELL_START = 13 // wave height (px) at the start of a round
const SWELL_PER_CATCH = 2 // added per catch
const SWELL_MAX = 26
const MAX_TILT = 0.45 // radians, about 26°
const COLORS = {
  water: '#04202c',
  sea: '#063448',
  grid: 'rgba(0, 162, 232, 0.14)',
  crest: '#00A2E8',
  yellow: '#FFF200',
  sky: '#00A2E8',
  ink: '#000000',
  trail: 'rgba(255, 242, 0, 0.45)',
}

type Block = {
  s: GameService
  x: number
  y: number
  w: number
  h: number
  vx: number
  phase: number
  bob: number
  caught: boolean
}
type Shot = { x: number; y: number; vx: number; vy: number }
type Phase = 'title' | 'playing' | 'won' | 'lost'

export function ServicesGame({
  services,
  text,
  contactHref,
  listId,
  autoStart = false,
}: GameProps & { autoStart?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<Phase>(autoStart ? 'playing' : 'title')
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

  // The loop. Runs behind the title screen ("attract" mode: sea and boat only, no services,
  // no timer, no input) and for each round of play.
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'title') return
    const attract = phase === 'title'
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let visible = true // the title animation pauses while the panel is off screen
    let attractFire = 1.2
    const fontFamily =
      getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() ||
      'sans-serif'

    let W = 0
    let H = 0
    let raf = 0
    let last = performance.now()
    let clock = 0 // seconds since the round started, drives the sea
    let timeLeft = ROUND_SECONDS
    let shownSeconds = ROUND_SECONDS
    let caughtCount = 0
    let catchTimer = 0
    let reload = 0
    let ended = false
    let swell = reduceMotion ? 0 : SWELL_START
    let targetSwell = swell
    const keys: Record<string, boolean> = {}
    let shots: Shot[] = []
    let blocks: Block[] = []
    const boat = { x: 0, y: 0, w: 64, tilt: 0 }

    // ---- The sea ----
    const seaLevel = () => H - 50
    /** Height of the sea surface at x: two travelling sine waves make an irregular swell. */
    const seaY = (x: number) => {
      if (swell === 0) return seaLevel()
      const k = (Math.PI * 2) / Math.max(220, W * 0.55)
      return (
        seaLevel() +
        swell * Math.sin(k * x - clock * 1.9) +
        swell * 0.35 * Math.sin(k * 2.3 * x + clock * 1.3 + 1)
      )
    }

    /**
     * Blocks swim in lanes (3 rows), each at its own speed and direction, so they spread
     * out and bunch up like fish. Together they cover roughly 60% of the width.
     */
    function layout() {
      const pad = 14
      const top = 46
      const lanes = 3
      const bh = 32
      const perLane = Math.ceil(services.length / lanes)
      const slot = (W - pad * 2) / perLane
      const bw = Math.max(78, Math.min(124, slot * 0.6))
      blocks = services.map((s, i) => {
        const lane = i % lanes
        const col = Math.floor(i / lanes)
        const speed = 45 + ((i * 37) % 40) // 45–85 px/s, varied but repeatable
        return {
          s,
          x: pad + col * slot + (slot - bw) / 2 + (lane % 2) * slot * 0.35,
          y: top + lane * (bh + 14),
          w: bw,
          h: bh,
          vx: (lane % 2 === 0 ? 1 : -1) * speed,
          phase: i * 1.3,
          bob: 0,
          caught: false,
        }
      })
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
        if (!attract) layout()
        boat.x = attract ? W / 2 + Math.sin(1.2) * W * 0.3 : W / 2
      }
      if (attract && reduceMotion) {
        updateBoat(1)
        draw()
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

    /** The boat sits on the surface and leans with the slope of the wave under it. */
    function updateBoat(dt: number) {
      boat.y = seaY(boat.x)
      const slope = (seaY(boat.x + 8) - seaY(boat.x - 8)) / 16
      const target = Math.max(-MAX_TILT, Math.min(MAX_TILT, Math.atan(slope)))
      boat.tilt += (target - boat.tilt) * Math.min(1, dt * 10) // smooth, no jitter
    }

    /** Where shots leave the gun, in canvas coordinates. */
    function muzzle() {
      const len = 30 // from the waterline to the gun tip
      return {
        x: boat.x + Math.sin(boat.tilt) * len,
        y: boat.y - 6 - Math.cos(boat.tilt) * len,
      }
    }

    function draw() {
      const c = ctx!
      // Deep water and sonar grid
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

      // Blocks
      c.font = `600 ${W < 440 ? 11.5 : 13}px ${fontFamily}`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      for (const b of blocks) {
        if (b.caught) continue
        const y = b.y + b.bob
        roundRect(b.x, y, b.w, b.h, 6)
        c.fillStyle = b.s.core ? COLORS.yellow : COLORS.sky
        c.fill()
        c.fillStyle = COLORS.ink
        c.fillText(b.s.label, b.x + b.w / 2, y + b.h / 2 + 1, b.w - 10)
      }

      // Pixel shots: a square "pixel" with a two-step trail, snapped to the pixel grid
      for (const s of shots) {
        const speed = Math.hypot(s.vx, s.vy) || 1
        const ux = s.vx / speed
        const uy = s.vy / speed
        const px = (x: number) => Math.round(x / 2) * 2
        c.fillStyle = COLORS.trail
        c.fillRect(px(s.x - ux * 9 - PIXEL / 4), px(s.y - uy * 9 - PIXEL / 4), PIXEL / 2, PIXEL / 2)
        c.fillRect(
          px(s.x - ux * 5 - PIXEL / 2.6),
          px(s.y - uy * 5 - PIXEL / 2.6),
          PIXEL * 0.75,
          PIXEL * 0.75,
        )
        c.fillStyle = COLORS.yellow
        c.fillRect(px(s.x - PIXEL / 2), px(s.y - PIXEL / 2), PIXEL, PIXEL)
      }

      // Boat, rotated with the wave
      c.save()
      c.translate(boat.x, boat.y)
      c.rotate(boat.tilt)
      c.fillStyle = COLORS.yellow
      c.beginPath()
      c.moveTo(-32, -10)
      c.lineTo(32, -10)
      c.lineTo(22, 6)
      c.lineTo(-22, 6)
      c.closePath()
      c.fill()
      c.fillRect(-9, -18, 18, 8) // cabin
      c.fillRect(-2, -36, 4, 20) // gun
      c.restore()

      // Sea in front of the hull, so the boat sits in the water
      c.fillStyle = COLORS.sea
      c.beginPath()
      c.moveTo(0, H)
      for (let x = 0; x <= W; x += 6) c.lineTo(x, seaY(x))
      c.lineTo(W, H)
      c.closePath()
      c.globalAlpha = 0.92
      c.fill()
      c.globalAlpha = 1
      c.strokeStyle = COLORS.crest
      c.lineWidth = 2
      c.beginPath()
      for (let x = 0; x <= W; x += 6) {
        const y = seaY(x)
        if (x === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.stroke()
    }

    function fire() {
      if (ended || reload > 0 || shots.length >= MAX_SHOTS) return
      reload = RELOAD_SECONDS
      const m = muzzle()
      shots.push({
        x: m.x,
        y: m.y,
        vx: Math.sin(boat.tilt) * SHOT_SPEED,
        vy: -Math.cos(boat.tilt) * SHOT_SPEED,
      })
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
      if (!attract) timeLeft -= dt
      if (!reduceMotion) clock += dt
      if (reload > 0) reload -= dt

      // The sea roughens smoothly towards its target after each catch
      swell += (targetSwell - swell) * Math.min(1, dt * 1.5)

      if (attract) {
        // Behind the title: the boat cruises back and forth and fires now and then
        boat.x = W / 2 + Math.sin(clock * 0.35 + 1.2) * W * 0.3
        attractFire -= dt
        if (attractFire <= 0) {
          fire()
          attractFire = 1.6
        }
      }
      if (keys.ArrowLeft) boat.x -= BOAT_SPEED * dt
      if (keys.ArrowRight) boat.x += BOAT_SPEED * dt
      boat.x = Math.max(boat.w / 2 + 6, Math.min(W - boat.w / 2 - 6, boat.x))
      updateBoat(dt)

      // Blocks swim their lanes, bounce off the sides and bob; they speed up a little per catch
      const live = blocks.filter((b) => !b.caught)
      if (!reduceMotion) {
        const pace = 1 + (total - live.length) * 0.08
        for (const b of live) {
          b.x += b.vx * pace * dt
          if (b.x < 8) {
            b.x = 8
            b.vx = Math.abs(b.vx)
          } else if (b.x + b.w > W - 8) {
            b.x = W - 8 - b.w
            b.vx = -Math.abs(b.vx)
          }
          b.bob = Math.sin(clock * 1.7 + b.phase) * 6
        }
      }

      // Shots fly in a straight line along the angle they were fired at
      for (const s of shots) {
        s.x += s.vx * dt
        s.y += s.vy * dt
      }
      shots = shots.filter((s) => {
        if (s.y < -10 || s.x < -10 || s.x > W + 10) return false
        const hit = live.find(
          (b) =>
            !b.caught &&
            s.x > b.x &&
            s.x < b.x + b.w &&
            s.y > b.y + b.bob - 2 &&
            s.y < b.y + b.bob + b.h + 2,
        )
        if (!hit) return true
        hit.caught = true
        caughtCount += 1
        catchTimer = 3.5
        if (!reduceMotion)
          targetSwell = Math.min(SWELL_MAX, SWELL_START + caughtCount * SWELL_PER_CATCH)
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

      draw()
      if (!attract && caughtCount === total) return finish(true)
      if (!attract && timeLeft <= 0) return finish(false)
      if (attract && !visible) {
        raf = 0 // paused off screen; the observer below resumes it
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const pointerX = (e: PointerEvent) => e.clientX - canvas.getBoundingClientRect().left
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = true
        e.preventDefault()
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        fire()
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
      updateBoat(1)
      fire()
    }

    resize()
    updateBoat(1)
    const observer = new ResizeObserver(resize)
    observer.observe(wrap)

    // Title screen: animate only while the panel is on screen (with reduced motion it
    // stays a still picture, drawn by resize()).
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf && !ended && !reduceMotion) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    })

    if (attract) {
      onScreen.observe(wrap)
      if (!reduceMotion) raf = requestAnimationFrame(tick)
    } else {
      canvas.addEventListener('keydown', onKeyDown)
      canvas.addEventListener('keyup', onKeyUp)
      canvas.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerdown', onPointerDown)
      canvas.focus({ preventScroll: true })
      track('services_game_start', { round: round + 1 })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      ended = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      onScreen.disconnect()
      canvas.removeEventListener('keydown', onKeyDown)
      canvas.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
    }
  }, [phase, round, services, total])

  return (
    <div className="game-live">
      <div className="game-screen live" ref={wrapRef}>
        {phase === 'title' ? (
          <canvas ref={canvasRef} aria-hidden="true" />
        ) : (
          <canvas ref={canvasRef} tabIndex={0} aria-label={text.canvasLabel} />
        )}
        {phase === 'title' ? (
          <GameTitle text={text} onPlay={restart} />
        ) : (
          <div className="game-hud" aria-hidden="true">
            <span>
              {text.caught} {caught} / {total}
            </span>
            <span>
              {secondsLeft}
              {text.seconds}
            </span>
          </div>
        )}

        {phase === 'won' || phase === 'lost' ? (
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

      {/* Catch info sits below the screen so it never hides the boat. Space is reserved. */}
      {phase !== 'title' ? (
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
      ) : null}
    </div>
  )
}
