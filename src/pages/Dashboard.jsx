import { useEffect, useRef, useState } from 'react'
import { Send, X } from 'lucide-react'
import { AGENT, NEWS, TEAMS } from '../state/data.js'
import { caseCounts } from '../state/reducer.js'
import { ActivityList, Avatar } from '../components/ui.jsx'

const SCHEDULE = [
  ['Starting time', '8:00', h => h >= 8 && h < 9],
  ['End time', '17:00', () => false],
  ['Meetings from', '9:00 to 10:30', h => h >= 9 && h < 11],
  ['Lunch', '1:00 to 2:00', h => h === 13],
]

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
    <div className="chatpanel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b>#{chat.team}</b>
        <button className="collapse" aria-label="Close chat" onClick={() => dispatch({ type: 'closeTeam' })}><X size={18} /></button>
      </div>
      <div className="chatlog" ref={logRef}>
        {chat.msgs.length
          ? chat.msgs.map(m => <div key={m.id} className={`bubble${m.me ? ' me' : ''}`}>{m.text}</div>)
          : <div className="empty">Ask the {chat.team} team a question.</div>}
      </div>
      <form className="chatform" onSubmit={send}>
        <input id="chatmsg" autoFocus value={text} onChange={e => setText(e.target.value)} placeholder={`Message #${chat.team}`} aria-label="Message" />
        <button className="btn btn-pink" style={{ padding: '0 14px' }} aria-label="Send"><Send size={16} /></button>
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
    <div className="dash">
      <div className="tasksrail panel"><b>Tasks ({myTasks})</b></div>
      <div className="dash-main">
        <section className="schedule" aria-label="Today">
          {SCHEDULE.map(([label, value, isNow]) => (
            <div key={label} className={`sched panel${isNow(hour) ? ' now' : ''}`}><b>{label}</b><span>{value}</span></div>
          ))}
          <div className="sched panel">
            <b>{open} open case{open === 1 ? '' : 's'}</b>
            <button className="btn btn-pink" style={{ width: 118 }} onClick={() => go('cases')}>View</button>
          </div>
        </section>

        <div className="dash-row">
          <section className="news-panel panel">
            <h2 className="h-sec">Latest news</h2>
            <hr className="divider" />
            <div className="news">
              {NEWS.map(([title, bg]) => (
                <button key={title} className="story" onClick={() => notify(`Opened: ${title}`)}>
                  <span className="bg" style={{ background: bg }} />
                  <span>{title}</span>
                </button>
              ))}
            </div>
            <h2 className="h-sec">Activity log</h2>
            <hr className="divider" />
            <ActivityList items={state.activity} />
          </section>

          <div>
            <section className="support panel">
              <h2 className="h-sec">Support chat</h2>
              <div className="teams">
                {TEAMS.map(t => (
                  <button key={t.name} className="team" onClick={() => dispatch({ type: 'openTeam', team: t.name })}>
                    <Avatar initials={t.initials} color={t.color} size="md" />
                    <span><b>{t.name}</b><small>10 members</small></span>
                  </button>
                ))}
              </div>
              {state.chat.team && <SupportChat chat={state.chat} dispatch={dispatch} />}
            </section>

            <section className="metrics panel">
              <h2 className="h-sec">Metrics</h2>
              <div className="metric-grid">
                <div className="metric"><Avatar initials="☎" color="#c4a38e" size="sm" /><span>Total calls: <b>{m.calls}</b></span></div>
                <div className="metric"><Avatar initials="✉" color="#e51b78" size="sm" /><span>Total emails: <b>{m.emails}</b></span></div>
                <div className="metric"><Avatar initials="C" color="#4f762e" size="sm" /><span>Total customer chats: <b>{m.chats}</b></span></div>
                <div className="metric"><Avatar initials="S" color="#4f762e" size="sm" /><span>Total support: <b>{m.support}</b></span></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
