import { describe, expect, it } from 'vitest'
import { seed } from './data.js'
import { caseCounts, formatDuration, reducer } from './reducer.js'

describe('cases', () => {
  it('completing a case moves it to Done and logs it', () => {
    const s = reducer(seed(), { type: 'completeCase', id: 'C-1042' })
    expect(s.cases.find(c => c.id === 'C-1042').status).toBe('done')
    expect(caseCounts(s.cases)).toEqual({ new: 2, progress: 2, done: 1 })
    expect(s.activity[0].text).toContain('C-1042')
  })

  it('requesting information moves a new case to In progress and counts an email', () => {
    const s = reducer(seed(), { type: 'requestInfo', id: 'C-1043', message: 'Please confirm the cancellation date.' })
    expect(s.cases.find(c => c.id === 'C-1043').status).toBe('progress')
    expect(s.metrics.emails).toBe(1)
  })

  it('ignores an empty information request', () => {
    const before = seed()
    expect(reducer(before, { type: 'requestInfo', id: 'C-1043', message: '   ' })).toBe(before)
  })

  it('filters toggle on and off', () => {
    const on = reducer(seed(), { type: 'filter', value: 'new' })
    expect(on.filter).toBe('new')
    expect(reducer(on, { type: 'filter', value: 'new' }).filter).toBeNull()
  })
})

describe('calls', () => {
  it('answer then end records the call length and frees the agent', () => {
    let s = reducer(seed(), { type: 'answer', now: 1_000 })
    expect(s.call.state).toBe('active')
    expect(s.presence).toBe('Busy')
    expect(s.metrics.calls).toBe(1)
    s = reducer(s, { type: 'endCall', now: 1_000 + 95_000 })
    expect(s.call).toMatchObject({ state: 'idle', total: 95 })
    expect(s.presence).toBe('Available')
    expect(s.activity[0].text).toContain('1m 35s')
  })

  it('cannot end a call that is not active', () => {
    const before = seed()
    expect(reducer(before, { type: 'endCall' })).toBe(before)
  })

  it('transferring a call counts as a support contact', () => {
    let s = reducer(seed(), { type: 'answer', now: 0 })
    s = reducer(s, { type: 'transfer', team: 'compliance', now: 30_000 })
    expect(s.metrics.support).toBe(1)
    expect(s.activity[0].text).toContain('compliance')
  })
})

describe('formatDuration', () => {
  it.each([[0, '0s'], [59, '59s'], [60, '1m 00s'], [125, '2m 05s']])('%i → %s', (secs, out) => {
    expect(formatDuration(secs)).toBe(out)
  })
})
