import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Send, X } from 'lucide-react'
import { AGENT, NEWS, TEAMS } from '../state/data.js'
import { caseCounts } from '../state/reducer.js'
import { ActivityList, Avatar, Button, Panel } from '../components/ui.jsx'

const SCHEDULE = [
  ['Starting time', '08:00', h => h >= 8 && h < 9],
  ['Meetings', '09:00–10:30', h => h >= 9 && h < 11],
  ['Lunch', '13:00–14:00', h => h === 13],
  ['End time', '17:00', h => h >= 16 && h < 17],
]

function greeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function SupportChat({ chat, dispatch }) {
  const [text, setText] = useState('')
  const logRef = useRef()
  useEffect(() => { logRef.current?.scrollTo(0, logRef.current.scrollHeight) }, [chat.msgs.length])

  function send(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    dispatch({ type: 'teamMessage', text: t })
    setText('')
    const team = chat.team
    setTimeout(() => dispatch({ type: 'teamReply', team }), 900)
  }

  return (
    <div className="chat">
      <div className="cw-panel__head">
        <b style={{ fontWeight: 500 }}>#{chat.team}</b>
        <Button variant="ghost" size="sm" iconOnly icon={X} aria-label="Close chat" title="Close chat" onClick={() => dispatch({ type: 'closeTeam' })} />
      </div>
      <div className="chatlog" ref={logRef}>
        {chat.msgs.length
          ? chat.msgs.map(m => <div key={m.id} className={`bubble${m.me ? ' bubble--me' : ''}`}>{m.text}</div>)
          : <div className="empty">Ask the {chat.team} team a question. They usually reply within a few minutes.</div>}
      </div>
      <form className="chatform" onSubmit={send}>
        <input id="chatmsg" className="cw-input" autoFocus value={text} onChange={e => setText(e.target.value)} placeholder={`Message #${chat.team}`} aria-label="Message" />
        <Button type="submit" variant="primary" iconOnly icon={Send} aria-label="Send message" title="Send message" />
      </form>
    </div>
  )
}

export default function Dashboard({ state, dispatch, notify, go }) {
  const counts = caseCounts(state.cases)
  const open = counts.new + counts.progress
  const hour = new Date().getHours()
  const myTasks = state.cases.filter(c => c.status !== 'done' && c.task.assignee === AGENT.name).length
  const m = state.metrics

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1 className="page__title">{greeting(hour)}, {AGENT.name.split(' ')[0]}</h1>
          <p className="page__sub">You have {open} open case{open === 1 ? '' : 's'} and {myTasks} task{myTasks === 1 ? '' : 's'} assigned to you.</p>
        </div>
      </div>

      <section className="schedule" aria-label="Today">
        {SCHEDULE.map(([label, value, isNow]) => (
          <div key={label} className={`cw-panel sched${isNow(hour) ? ' sched--now' : ''}`}>
            <span className="sched__label">{label}</span>
            <span className="sched__value">{value}</span>
          </div>
        ))}
        <div className="cw-panel sched sched--cta">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span className="sched__label">Open cases</span>
            <span className="sched__value">{open}</span>
          </div>
          <Button variant="primary" size="sm" icon={ArrowRight} onClick={() => go('cases')}>View</Button>
        </div>
      </section>

      <div className="dash-row">
        <div className="dash-side">
          <Panel title="Activity log">
            <ActivityList items={state.activity} limit={6} />
          </Panel>
          <Panel title="Latest news">
            <div className="news">
              {NEWS.map(([title], i) => (
                <button key={title} className="story" onClick={() => notify(`Opened: ${title}`)}>
                  <span className="story__kicker">{['People', 'Product', 'Workplace', 'Customers'][i]}</span>
                  <span className="story__title">{title}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="dash-side">
          <Panel title="Today's metrics">
            <div className="metric-grid">
              <div className="metric"><span className="metric__value">{m.calls}</span><span className="metric__label">Calls</span></div>
              <div className="metric"><span className="metric__value">{m.emails}</span><span className="metric__label">Emails</span></div>
              <div className="metric"><span className="metric__value">{m.chats}</span><span className="metric__label">Customer chats</span></div>
              <div className="metric"><span className="metric__value">{m.support}</span><span className="metric__label">Support requests</span></div>
            </div>
          </Panel>
          <Panel title="Support chat">
            <div className="teams">
              {TEAMS.map(t => (
                <button key={t.name} className="team" onClick={() => dispatch({ type: 'openTeam', team: t.name })}>
                  <Avatar initials={t.initials} tone="team" />
                  <span><b>{t.name}</b><small>10 members</small></span>
                </button>
              ))}
            </div>
            {state.chat.team && <SupportChat chat={state.chat} dispatch={dispatch} />}
          </Panel>
        </div>
      </div>
    </div>
  )
}
