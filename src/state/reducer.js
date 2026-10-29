import { AGENT, CUSTOMERS, nextId, seed } from './data.js'
import { SCENARIOS } from './scenarios.js'

/** Formats a number of seconds as "42s" or "3m 07s". */
export function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
}

export function callSeconds(call, now = Date.now()) {
  return call.state === 'active' ? Math.floor((now - call.start) / 1000) : call.total
}

export function caseCounts(cases) {
  return {
    new: cases.filter(c => c.status === 'new').length,
    progress: cases.filter(c => c.status === 'progress').length,
    done: cases.filter(c => c.status === 'done').length,
  }
}

function withLog(state, text, customer = null) {
  const entry = { id: nextId(), who: AGENT.name, initials: AGENT.initials, text, when: 'Just now', customer, fresh: true }
  return { ...state, activity: [entry, ...state.activity.map(a => (a.fresh ? { ...a, fresh: false } : a))] }
}

export const ASSISTANT = { name: 'Virtual assistant', initials: 'VA' }

function withAssistantLog(state, text, customer) {
  const entry = { id: nextId(), who: ASSISTANT.name, initials: ASSISTANT.initials, text, when: 'Just now', customer, fresh: true, ai: true }
  return { ...state, activity: [entry, ...state.activity.map(a => (a.fresh ? { ...a, fresh: false } : a))] }
}

const bump =(state, key) => ({ ...state, metrics: { ...state.metrics, [key]: state.metrics[key] + 1 } })

const setCaseStatus = (state, id, status) => ({
  ...state,
  cases: state.cases.map(c => (c.id === id ? { ...c, status } : c)),
})

/**
 * All state changes in the app go through this reducer, so every action
 * (closing a case, ending a call, sending an email) is logged in one place.
 */
export function reducer(state, action) {
  const now = action.now ?? Date.now()
  switch (action.type) {
    case 'reset':
      return seed()
    case 'presence':
      return { ...state, presence: action.value }

    // Cases
    case 'filter':
      return { ...state, filter: state.filter === action.value ? null : action.value }
    case 'openCase':
      return { ...state, openCase: action.id, caseTab: 'tasks', filter: null }
    case 'collapseCase':
      return { ...state, openCase: null }
    case 'caseTab':
      return { ...state, caseTab: action.value }
    case 'completeCase': {
      const c = state.cases.find(x => x.id === action.id)
      if (!c || c.status === 'done') return state
      return withLog(setCaseStatus(state, c.id, 'done'), `completed “${c.task.title}” on ${c.id}`, c.customer)
    }
    case 'requestInfo': {
      const c = state.cases.find(x => x.id === action.id)
      if (!c || c.status === 'done' || !action.message?.trim()) return state
      const next = bump(setCaseStatus(state, c.id, 'progress'), 'emails')
      return withLog(next, `requested more information on ${c.id}`, c.customer)
    }

    // Customer workspace
    case 'pickCustomer':
      return { ...state, currentCustomer: action.id, recordTab: 'info' }
    case 'recordTab':
      return { ...state, recordTab: action.value }
    case 'channel':
      return { ...state, channel: action.value }

    // Virtual assistant (IVR) handoff
    case 'simulateContact': {
      if (state.call.state === 'active') return state
      const sc = SCENARIOS[action.id]
      if (!sc) return state
      return {
        ...state,
        currentCustomer: sc.customer,
        recordTab: 'info',
        call: { state: 'ivr', customer: sc.customer, channel: sc.channel, scenario: sc.id, summary: null, start: 0, total: 0 },
      }
    }
    case 'handoff': {
      if (state.call.state !== 'ivr' || state.call.scenario !== action.scenario) return state
      return { ...state, call: { ...state.call, state: 'ringing', summary: action.summary } }
    }

    // Calls and SMS
    case 'answer': {
      if (state.call.state !== 'ringing') return state
      const { customer, channel = 'call', summary } = state.call
      const name = CUSTOMERS[customer].name
      const sms = channel === 'sms'
      let next = { ...state, presence: 'Busy', call: { ...state.call, state: 'active', start: now, total: 0 } }
      next = bump(next, sms ? 'chats' : 'calls')
      if (sms) next = { ...next, channel: 'chat' }
      if (summary) {
        next = withAssistantLog(next, `handed over ${name}: ${summary.headline}`, customer)
        if (summary.caseId) next = { ...next, openCase: summary.caseId, caseTab: 'tasks' }
      }
      return withLog(next, sms ? `accepted an SMS conversation with ${name}` : `answered an inbound call from ${name}`, customer)
    }
    case 'dial': {
      if (state.call.state === 'active') return state
      const id = state.currentCustomer
      const next = bump({ ...state, presence: 'Busy', call: { state: 'active', customer: id, channel: 'call', start: now, total: 0 } }, 'calls')
      return withLog(next, `called ${CUSTOMERS[id].name}`, id)
    }
    case 'decline':
      return ['ringing', 'ivr'].includes(state.call.state) ? { ...state, call: { ...state.call, state: 'idle', summary: null, scenario: null } } : state
    case 'endCall':
    case 'transfer': {
      if (state.call.state !== 'active') return state
      const total = callSeconds(state.call, now)
      let next = { ...state, presence: 'Available', call: { ...state.call, state: 'idle', total } }
      const what = state.call.channel === 'sms' ? 'conversation' : 'call'
      if (action.type === 'transfer') {
        next = bump(next, 'support')
        return withLog(next, `transferred the ${what} to ${action.team}`, state.call.customer)
      }
      return withLog(next, `ended the ${what} (${formatDuration(total)})`, state.call.customer)
    }

    // Communication
    case 'sendEmail':
      return withLog(bump(state, 'emails'), `sent an email “${action.subject}” to ${action.to}`, state.currentCustomer)
    case 'sendChat':
      return withLog(bump(state, 'chats'), 'sent a chat message to the customer', state.currentCustomer)
    case 'saveNote': {
      const t = action.text.trim()
      return withLog(state, `added a note “${t.length > 60 ? t.slice(0, 57) + '…' : t}”`, state.currentCustomer)
    }

    // Support chat
    case 'openTeam':
      return { ...state, chat: { team: action.team, msgs: [] } }
    case 'closeTeam':
      return { ...state, chat: { team: null, msgs: [] } }
    case 'teamMessage':
      return bump({ ...state, chat: { ...state.chat, msgs: [...state.chat.msgs, { id: nextId(), me: true, text: action.text }] } }, 'support')
    case 'teamReply':
      if (state.chat.team !== action.team) return state
      return {
        ...state,
        chat: { ...state.chat, msgs: [...state.chat.msgs, { id: nextId(), me: false, text: `Thanks, someone from ${action.team} will pick this up in a few minutes.` }] },
      }
    default:
      return state
  }
}
