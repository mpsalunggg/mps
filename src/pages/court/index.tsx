import { lazy, Suspense, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { ClientOnly, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BallHandle } from './Ball'
import {
  BALLS_PER_RACK,
  RACKS,
  TIME_LIMIT,
  contestReducer,
  initialContest,
  isMoneyBall,
  rackOf,
  scoreOf,
} from './contest'
import { SWEET_RANGE, SWEET_SPOT } from './shot'

const Court = lazy(() => import('./Court'))

const BEST_KEY = 'court-best'

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function saveBest(score: number) {
  try {
    localStorage.setItem(BEST_KEY, String(score))
  } catch {
    return
  }
}

function formatTime(seconds: number) {
  const whole = Math.ceil(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

const CourtPage = () => {
  const [state, dispatch] = useReducer(contestReducer, initialContest)
  const [best, setBest] = useState(0)
  const ball = useRef<BallHandle>(null)
  const chargeStart = useRef<number | null>(null)
  const power = useRef(0)
  const meterFill = useRef<HTMLDivElement>(null)
  const [charging, setCharging] = useState(false)
  const deadline = useRef<number | null>(null)
  const [remaining, setRemaining] = useState(TIME_LIMIT)

  const score = scoreOf(state.made)
  const rack = rackOf(state.shot)

  useEffect(() => setBest(readBest()), [])

  useEffect(() => {
    if (state.phase !== 'done' || score <= best) return
    setBest(score)
    saveBest(score)
  }, [state.phase, score, best])

  useEffect(() => {
    if (state.phase === 'done') return
    const timer = setInterval(() => {
      if (deadline.current === null) return
      const left = Math.max(0, (deadline.current - performance.now()) / 1000)
      setRemaining(left)
      if (left === 0) dispatch({ type: 'timeUp' })
    }, 100)
    return () => clearInterval(timer)
  }, [state.phase])

  const startCharge = useCallback(() => {
    if (state.phase !== 'aiming' || chargeStart.current !== null) return
    chargeStart.current = performance.now() / 1000
    setCharging(true)
  }, [state.phase])

  const release = useCallback(() => {
    if (chargeStart.current === null) return
    chargeStart.current = null
    setCharging(false)
    deadline.current ??= performance.now() + TIME_LIMIT * 1000
    ball.current?.shoot(power.current, state.shot)
    dispatch({ type: 'shoot' })
  }, [state.shot])

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return
      event.preventDefault()
      startCharge()
    }
    const up = (event: KeyboardEvent) => {
      if (event.code === 'Space') release()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [startCharge, release])

  const onMake = useCallback(() => dispatch({ type: 'make' }), [])
  const onSettled = useCallback(() => dispatch({ type: 'next' }), [])

  const playAgain = () => {
    deadline.current = null
    setRemaining(TIME_LIMIT)
    dispatch({ type: 'reset' })
  }

  return (
    <main className="bg-background fixed inset-0">
      <div
        className="relative h-full w-full touch-none overflow-hidden select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          startCharge()
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <ClientOnly fallback={<div className="bg-muted/40 h-full w-full" />}>
          <Suspense fallback={<div className="bg-muted/40 h-full w-full" />}>
            <Court
              ball={ball}
              shot={state.shot}
              made={!!state.made[state.shot]}
              makes={state.made.filter(Boolean).length}
              chargeStart={chargeStart}
              power={power}
              meterFill={meterFill}
              onMake={onMake}
              onSettled={onSettled}
            />
          </Suspense>
        </ClientOnly>

        <Link
          to="/"
          onPointerDown={(event) => event.stopPropagation()}
          className="text-muted-foreground hover:text-foreground absolute top-5 left-5 inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <p
          className={cn(
            'font-amatic pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 text-6xl leading-none font-bold transition-colors',
            remaining <= 10 ? 'text-destructive' : 'text-foreground',
          )}
        >
          {formatTime(remaining)}
        </p>

        <div className="pointer-events-none absolute top-5 right-5 text-right">
          <p className="font-amatic text-foreground text-6xl leading-none font-bold">{score}</p>
          <p className="text-muted-foreground mt-1 text-xs">Best {best}</p>
          <p className="text-muted-foreground text-xs">
            Rack {rack + 1} of {RACKS}
          </p>
        </div>

        <div className="pointer-events-none absolute top-1/2 right-5 h-40 w-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className="bg-chart-2/50 absolute inset-x-0"
            style={{
              bottom: `${(SWEET_SPOT - SWEET_RANGE) * 100}%`,
              height: `${SWEET_RANGE * 200}%`,
            }}
          />
          <div ref={meterFill} className="bg-foreground/70 absolute inset-x-0 bottom-0 h-0" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center gap-2 sm:gap-5">
          {Array.from({ length: RACKS }, (_, r) => (
            <div key={r} className="flex gap-0.5 sm:gap-1">
              {Array.from({ length: BALLS_PER_RACK }, (_, b) => {
                const shot = r * BALLS_PER_RACK + b
                const taken = shot < state.made.length
                return (
                  <span
                    key={b}
                    className={cn(
                      'h-2 w-2 rounded-full border transition-colors sm:h-2.5 sm:w-2.5',
                      isMoneyBall(shot) ? 'border-[#e2552d]' : 'border-foreground/30',
                      taken && state.made[shot] && (isMoneyBall(shot) ? 'bg-[#e2552d]' : 'bg-foreground'),
                      shot === state.shot && state.phase !== 'done' && 'ring-foreground/40 ring-2',
                    )}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {state.shot === 0 && state.phase === 'aiming' && !charging && (
          <p className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-14 text-center text-sm">
            Hold anywhere or press space, let go in the green.
            <br />
            The clock starts on your first shot.
          </p>
        )}

        {state.phase === 'done' && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              {state.buzzer && state.made.length < RACKS * BALLS_PER_RACK && (
                <p className="text-muted-foreground text-sm">Time&apos;s up</p>
              )}
              <p className="font-amatic text-7xl font-bold">{score}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                out of 30{score >= best && score > 0 ? ', your best so far' : ''}
              </p>
              <Button
                className="mt-6"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={playAgain}
              >
                Play again
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default CourtPage
