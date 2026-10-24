export const RACKS = 5
export const BALLS_PER_RACK = 5
export const TIME_LIMIT = 70

export type Phase = 'aiming' | 'flying' | 'done'

export interface ContestState {
  shot: number
  phase: Phase
  made: boolean[]
  buzzer: boolean
}

export type ContestAction =
  | { type: 'shoot' }
  | { type: 'make' }
  | { type: 'next' }
  | { type: 'timeUp' }
  | { type: 'reset' }

export const initialContest: ContestState = {
  shot: 0,
  phase: 'aiming',
  made: [],
  buzzer: false,
}

export const isMoneyBall = (shot: number) => shot % BALLS_PER_RACK === BALLS_PER_RACK - 1

export const rackOf = (shot: number) => Math.min(RACKS - 1, Math.floor(shot / BALLS_PER_RACK))

export const scoreOf = (made: boolean[]) =>
  made.reduce((sum, hit, shot) => sum + (hit ? (isMoneyBall(shot) ? 2 : 1) : 0), 0)

export function contestReducer(state: ContestState, action: ContestAction): ContestState {
  switch (action.type) {
    case 'shoot':
      return state.phase === 'aiming' ? { ...state, phase: 'flying' } : state
    case 'make':
      if (state.phase !== 'flying' || state.made[state.shot]) return state
      return { ...state, made: Object.assign([...state.made], { [state.shot]: true }) }
    case 'next': {
      if (state.phase !== 'flying') return state
      const made = Object.assign([...state.made], { [state.shot]: !!state.made[state.shot] })
      const shot = state.shot + 1
      const done = state.buzzer || shot >= RACKS * BALLS_PER_RACK
      return { ...state, shot: done ? state.shot : shot, phase: done ? 'done' : 'aiming', made }
    }
    case 'timeUp':
      if (state.buzzer) return state
      if (state.phase === 'aiming') return { ...state, phase: 'done', buzzer: true }
      if (state.phase === 'flying') return { ...state, buzzer: true }
      return state
    case 'reset':
      return initialContest
  }
}
