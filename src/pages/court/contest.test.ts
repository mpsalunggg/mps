import { describe, expect, it } from 'vitest'
import { contestReducer, initialContest, scoreOf, type ContestAction } from './contest'

const play = (...actions: ContestAction['type'][]) =>
    actions.reduce((state, type) => contestReducer(state, { type } as ContestAction), initialContest)

describe('contestReducer buzzer', () => {
    it('ends the contest when time runs out between shots', () => {
        expect(play('shoot', 'next', 'timeUp').phase).toBe('done')
    })

    it('still counts a ball released before the buzzer', () => {
        const state = play('shoot', 'timeUp', 'make', 'next')
        expect(state.phase).toBe('done')
        expect(scoreOf(state.made)).toBe(1)
    })
})
