'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { track } from '@/lib/analytics'
import { GameTitle } from './GameTitle'
import { ICON_CELLS } from './icons'
import type { GameProps, GameService } from './types'

/**
 * "Cast for our services": an original arcade game for the homepage.
 *
 * The boat rides a rolling sea. As the swell lifts and tilts it, its pixel shots fly along
 * the tilt, so timing a shot to the slope of a wave lets you hit targets that are not directly
 * above you. Each service is a buoy with a pixel icon riding a far swell higher up; both seas
 * get rougher with every catch, and a hit bursts the buoy into pixels. Each catch shows that service; catching
 * all seven within the round ends on a "Let's talk" call to action.
 * (Rolling-wave mechanic inspired by classic boat shooters; the game, art and content are ours.)
 *
 * Loaded only when someone presses Play (see GameLoader), so it adds nothing to page load.
 * Controls: arrow keys + Space/Up, mouse move + click, or touch drag + tap. Escape stops.
 * Reduced motion: calm seas, a level boat that fires straight up, and buoys that stay still.
 * Phones show five buoys at a time; the rest drift in as buoys are hit.
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
  farSea: '#052b3c',
  farCrest: 'rgba(0, 162, 232, 0.55)',
  line: '#f2f5f7',
}

/** A service buoy riding the far swell. y and tilt follow the wave under it each frame. */
type Buoy = {
  s: GameService
  x: number
  y: number
  vx: number
  tilt: number
  active: boolean // on screen (phones show fewer at a time; the rest drift in later)
  entering: boolean // still drifting in from off screen
  caught: boolean
}
type Shot = { x: number; y: number; vx: number; vy: number }
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string }

const FAR_SWELL_START = 7 // far swell height (px); it roughens with each catch too
const FAR_SWELL_PER_CATCH = 1.6
const FAR_SWELL_MAX = 18
const BUOY_HALF = 22 // half the buoy's width
const BUOY_GAP = 58 // minimum distance between neighbouring buoys
const ICON_PX = 3 // size of one icon pixel on a buoy
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
    let farSwell = reduceMotion ? 0 : FAR_SWELL_START
    let targetFarSwell = farSwell
    const keys: Record<string, boolean> = {}
    let shots: Shot[] = []
    let sparks: Spark[] = []
    let buoys: Buoy[] = []
    let nextEntrySide = -1
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

    // ---- The far swell the buoys ride, higher up the screen ----
    const farLevel = () => H * 0.47
    const farY = (x: number) => {
      if (farSwell === 0) return farLevel()
      const k = (Math.PI * 2) / Math.max(200, W * 0.47)
      return (
        farLevel() +
        farSwell * Math.sin(k * x - clock * 1.2 + 0.6) +
        farSwell * 0.3 * Math.sin(k * 2.6 * x + clock * 0.9 + 1)
      )
    }

    /** How many buoys fit on screen at once: all seven on desktop, five on phones. */
    const maxActive = () => (W < 440 ? 5 : services.length)
    const speedFor = (i: number) => 38 + ((i * 29) % 34) // 38–72 px/s, varied but repeatable

    /** Spread the first buoys evenly along the far swell; the rest wait off screen. */
    function layout() {
      const n = Math.min(maxActive(), services.length)
      buoys = services.map((s, i) => ({
        s,
        x: i < n ? ((i + 0.5) * W) / n : -60,
        y: 0,
        vx: (i % 2 === 0 ? 1 : -1) * speedFor(i),
        tilt: 0,
        active: i < n,
        entering: false,
        caught: false,
      }))
    }

    /** After a catch on a phone, the next waiting buoy drifts in from alternating sides. */
    function bringInNext() {
      const waiting = buoys.find((b) => !b.active && !b.caught)
      if (!waiting) return
      const i = buoys.indexOf(waiting)
      nextEntrySide *= -1
      waiting.active = true
      waiting.entering = true
      waiting.x = nextEntrySide < 0 ? -BUOY_HALF - 10 : W + BUOY_HALF + 10
      waiting.vx = (nextEntrySide < 0 ? 1 : -1) * speedFor(i)
    }

    function burst(x: number, y: number, color: string) {
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2
        const v = 80 + Math.random() * 160
        sparks.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 60,
          life: 0.55 + Math.random() * 0.25,
          color: i % 3 === 0 ? '#f2f5f7' : color,
        })
      }
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

      // Buoys riding the far swell, each leaning with the wave under it
      for (const b of buoys) {
        if (!b.active || b.caught) continue
        const body = b.s.core ? COLORS.yellow : COLORS.sky
        const shade = b.s.core ? '#b8ad00' : '#00719f'
        c.save()
        c.translate(b.x, b.y)
        c.rotate(b.tilt)
        c.fillStyle = COLORS.line
        c.fillRect(-2, -52, 4, 18) // mast
        c.fillStyle = b.s.core ? COLORS.line : COLORS.yellow
        c.fillRect(-5, -56, 10, 6) // lamp
        roundRect(-21, -36, 42, 40, 6) // body
        c.fillStyle = body
        c.fill()
        c.fillStyle = shade
        c.fillRect(16, -30, 5, 34) // shading on one side
        c.fillStyle = COLORS.ink
        for (const [x, y] of ICON_CELLS[b.s.icon]) {
          c.fillRect(-13.5 + x * ICON_PX, -30 + y * ICON_PX, ICON_PX, ICON_PX)
        }
        c.fillStyle = COLORS.line
        c.fillRect(-24, 2, 48, 8) // float collar at the waterline
        c.restore()
      }

      // The far sea, in front of the buoys so they sit in the water
      c.fillStyle = COLORS.farSea
      c.beginPath()
      c.moveTo(0, H)
      for (let x = 0; x <= W; x += 6) c.lineTo(x, farY(x))
      c.lineTo(W, H)
      c.closePath()
      c.globalAlpha = 0.94
      c.fill()
      c.globalAlpha = 1
      c.strokeStyle = COLORS.farCrest
      c.lineWidth = 1.5
      c.beginPath()
      for (let x = 0; x <= W; x += 6) {
        const y = farY(x)
        if (x === 0) c.moveTo(x, y)
        else c.lineTo(x, y)
      }
      c.stroke()

      // Name tags above the buoys, kept level so they stay readable
      c.font = `700 ${W < 440 ? 10.5 : 11}px ${fontFamily}`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      // Neighbouring tags alternate between two heights so they never overlap
      const tagged = buoys.filter((b) => b.active && !b.caught).sort((a, b) => a.x - b.x)
      tagged.forEach((b, rank) => {
        const tw = c.measureText(b.s.label).width + 14
        const ty = b.y - 70 - (rank % 2) * 22
        const tx = Math.max(tw / 2 + 4, Math.min(W - tw / 2 - 4, b.x)) // keep on screen
        if (rank % 2) {
          c.fillStyle = 'rgba(242, 245, 247, 0.35)'
          c.fillRect(b.x - 0.5, ty + 9, 1, 12) // short leader line down to the lamp
        }
        roundRect(tx - tw / 2, ty - 9, tw, 18, 9)
        c.fillStyle = 'rgba(0, 0, 0, 0.6)'
        c.fill()
        c.fillStyle = COLORS.line
        c.fillText(b.s.label, tx, ty + 0.5)
      })

      // Pixel burst from a hit buoy
      for (const p of sparks) {
        c.globalAlpha = Math.max(0, Math.min(1, p.life / 0.4))
        c.fillStyle = p.color
        c.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 4, 4)
      }
      c.globalAlpha = 1

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

      // The far swell roughens too
      farSwell += (targetFarSwell - farSwell) * Math.min(1, dt * 1.5)

      // Buoys drift along the far swell, bounce off the sides and keep their distance;
      // they speed up a little with each catch
      const live = buoys.filter((b) => b.active && !b.caught)
      if (!reduceMotion) {
        const pace = 1 + caughtCount * 0.06
        for (const b of live) {
          b.x += b.vx * pace * (b.entering ? 2.2 : 1) * dt // newcomers drift in quickly
          if (b.entering) {
            if (b.x > BUOY_HALF + 4 && b.x < W - BUOY_HALF - 4) b.entering = false
          } else if (b.x < BUOY_HALF + 4) {
            b.x = BUOY_HALF + 4
            b.vx = Math.abs(b.vx)
          } else if (b.x > W - BUOY_HALF - 4) {
            b.x = W - BUOY_HALF - 4
            b.vx = -Math.abs(b.vx)
          }
        }
        // Neighbours that get too close bounce apart
        const row = [...live].sort((a, b) => a.x - b.x)
        for (let i = 1; i < row.length; i++) {
          const a = row[i - 1]
          const b = row[i]
          if (b.x - a.x < BUOY_GAP) {
            const push = (BUOY_GAP - (b.x - a.x)) / 2
            a.x -= push
            b.x += push
            if (a.vx > 0 || b.vx < 0) {
              a.vx = -Math.abs(a.vx)
              b.vx = Math.abs(b.vx)
            }
          }
        }
      }
      // Each buoy sits on the wave under it and leans with its slope
      for (const b of live) {
        b.y = farY(b.x)
        const slope = (farY(b.x + 6) - farY(b.x - 6)) / 12
        b.tilt = Math.max(-0.5, Math.min(0.5, Math.atan(slope)))
      }

      // Pixel burst particles
      for (const p of sparks) {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 420 * dt
        p.life -= dt
      }
      sparks = sparks.filter((p) => p.life > 0)

      // Shots fly in a straight line along the angle they were fired at
      for (const s of shots) {
        s.x += s.vx * dt
        s.y += s.vy * dt
      }
      shots = shots.filter((s) => {
        if (s.y < -10 || s.x < -10 || s.x > W + 10) return false
        // Hit area: the buoy's body and mast (not the name tag)
        const hit = live.find(
          (b) =>
            !b.caught &&
            s.x > b.x - BUOY_HALF &&
            s.x < b.x + BUOY_HALF &&
            s.y > b.y - 58 &&
            s.y < b.y + 6,
        )
        if (!hit) return true
        hit.caught = true
        caughtCount += 1
        catchTimer = 3.5
        burst(hit.x, hit.y - 16, hit.s.core ? COLORS.yellow : COLORS.sky)
        bringInNext()
        if (!reduceMotion) {
          targetSwell = Math.min(SWELL_MAX, SWELL_START + caughtCount * SWELL_PER_CATCH)
          targetFarSwell = Math.min(
            FAR_SWELL_MAX,
            FAR_SWELL_START + caughtCount * FAR_SWELL_PER_CATCH,
          )
        }
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
