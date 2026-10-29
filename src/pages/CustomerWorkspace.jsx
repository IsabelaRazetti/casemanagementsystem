import { useState } from 'react'
import {
  FileText, Mail, MessageCircle, Phone, PhoneCall, PhoneForwarded, PhoneOff, Send, Settings, StickyNote,
} from 'lucide-react'
import { AGENT, CUSTOMERS, TASK_ORDER, TEAMS } from '../state/data.js'
import { callSeconds, formatDuration } from '../state/reducer.js'
import { ActivityList, Avatar, Field, StatusLabel, Tabs } from '../components/ui.jsx'
import DocModal from '../components/DocModal.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CHANNELS = [['email', Mail, 'Email'], ['chat', MessageCircle, 'Chat'], ['note', StickyNote, 'Note'], ['settings', Settings, 'Preferences']]

function TaskItem({ id, current, onPick }) {
  const c = CUSTOMERS[id]
  return (
    <button className="ctask" aria-current={current} onClick={() => onPick(id)}>
      <Avatar initials={c.initials} color={c.taskColor} />
      <span><b>{c.name}</b><small>{c.note}</small></span>
    </button>
  )
}

function CallCard({ cu, call, now, dispatch, notify }) {
  const [transferOpen, setTransferOpen] = useState(false)
  const status = call.customer === cu.id ? call.state : 'idle'

  let line = 'Not on a call'
  if (status === 'ringing') line = 'Incoming call…'
  else if (status === 'active') line = `On call · ${formatDuration(callSeconds(call, now))}`
  else if (call.customer === cu.id && call.total) line = `Last call ${formatDuration(call.total)}`

  return (
    <div className="callcard">
      <Avatar initials={cu.initials} color={cu.color} size="xl" />
      <div>
        <h2>{cu.direction}: {cu.title} {cu.name}</h2>
        <span className="queue">{cu.queue}</span>
        <span className="ctime">{line}</span>
      </div>

      {status === 'ringing' && (
        <div className="controls">
          <button className="ctl answer" aria-label="Answer call" onClick={() => { dispatch({ type: 'answer' }); notify('Call connected') }}><Phone /></button>
          <button className="ctl end" aria-label="Decline call" onClick={() => { dispatch({ type: 'decline' }); notify('Call declined') }}><PhoneOff /></button>
        </div>
      )}
      {status === 'active' && (
        <>
          <div className="controls">
            <button className="ctl" aria-label="Call details" onClick={() => notify('Call recording is on for quality and training')}><PhoneCall /></button>
            <button className="ctl end" aria-label="End call" onClick={() => {
              dispatch({ type: 'endCall' }); setTransferOpen(false); notify(`Call ended · ${formatDuration(callSeconds(call))}`)
            }}><Phone /></button>
            <button className="ctl" aria-label="Transfer call" aria-expanded={transferOpen} onClick={() => setTransferOpen(o => !o)}><PhoneForwarded /></button>
          </div>
          {transferOpen && (
            <div className="transfer">
              {TEAMS.slice(0, 6).map(t => (
                <button key={t.name} onClick={() => { dispatch({ type: 'transfer', team: t.name }); setTransferOpen(false); notify(`Transferred to ${t.name}`) }}>{t.name}</button>
              ))}
            </div>
          )}
        </>
      )}
      {status === 'idle' && (
        <div className="controls">
          <button
            className="ctl answer" aria-label={`Call ${cu.name}`}
            disabled={call.state === 'active'} title={call.state === 'active' ? 'Finish your current call first' : undefined}
            onClick={() => { dispatch({ type: 'dial' }); notify(`Calling ${cu.name}`) }}
          ><PhoneCall /></button>
        </div>
      )}
    </div>
  )
}

function Composer({ cu, channel, dispatch, notify, email, setEmail }) {
  const [errors, setErrors] = useState({})
  const [text, setText] = useState({ chat: '', note: '' })

  function sendEmail(e) {
    e.preventDefault()
    const err = {}
    if (!EMAIL_RE.test(email.to.trim())) err.to = 'Enter a valid email address, like name@company.com.'
    if (!email.subject.trim()) err.subject = 'Add a subject so the customer knows what this is about.'
    if (!email.body.trim()) err.body = 'Write the email before sending.'
    setErrors(err)
    if (Object.keys(err).length) return
    dispatch({ type: 'sendEmail', to: email.to.trim(), subject: email.subject.trim() })
    notify(`Email sent to ${email.to.trim()}`)
    setEmail({ to: cu.email, subject: '', body: '' })
  }

  function applyTemplate() {
    const p = cu.policies[0]
    setEmail(m => ({
      ...m,
      subject: 'Your policy renewal with Simply Business',
      body: `Hi ${cu.name.split(' ')[0]},\n\nThanks for speaking with me today. Your policy ${p.num} renews on ${p.renews}. I've attached your documents so you can check the details.\n\nKind regards,\n${AGENT.name}`,
    }))
    setErrors({})
  }

  function sendText(kind) {
    return e => {
      e.preventDefault()
      const v = text[kind].trim()
      if (!v) { setErrors({ [kind]: kind === 'note' ? 'Write the note before saving.' : 'Write a message before sending.' }); return }
      setErrors({})
      if (kind === 'chat') { dispatch({ type: 'sendChat' }); notify('Message sent') }
      else { dispatch({ type: 'saveNote', text: v }); notify('Note saved') }
      setText(t => ({ ...t, [kind]: '' }))
    }
  }

  const set = key => e => { setEmail(m => ({ ...m, [key]: e.target.value })); if (errors[key]) setErrors(x => ({ ...x, [key]: undefined })) }

  if (channel === 'email') return (
    <>
      <h3>Email</h3>
      <hr className="divider" />
      <form onSubmit={sendEmail} noValidate>
        <Field id="em-to" label="Email address" error={errors.to}>
          <input id="em-to" type="email" value={email.to} onChange={set('to')} placeholder={cu.email} aria-invalid={!!errors.to} />
        </Field>
        <Field id="em-subject" label="Subject" error={errors.subject}>
          <input id="em-subject" value={email.subject} onChange={set('subject')} placeholder="Add subject" aria-invalid={!!errors.subject} />
        </Field>
        <Field id="em-body" label="Write email" error={errors.body}>
          <textarea id="em-body" rows={8} value={email.body} onChange={set('body')} placeholder="Write the email" aria-invalid={!!errors.body} />
        </Field>
        <div className="row">
          <button type="button" className="btn btn-outline" onClick={applyTemplate}>Use renewal template</button>
          <button className="btn btn-pink"><Send size={14} aria-hidden="true" /> Send email</button>
        </div>
      </form>
    </>
  )

  if (channel === 'chat' || channel === 'note') {
    const isNote = channel === 'note'
    return (
      <>
        <h3>{isNote ? 'Internal note' : 'Customer chat'}</h3>
        <hr className="divider" />
        <form onSubmit={sendText(channel)} noValidate>
          <Field id={channel} label={isNote ? 'Only your team can see this' : `Message to ${cu.name}`} error={errors[channel]}>
            <textarea
              id={channel} rows={isNote ? 6 : 5} value={text[channel]}
              placeholder={isNote ? 'e.g. Customer will send accounts by Friday' : 'Write a chat message'}
              onChange={e => { const v = e.target.value; setText(t => ({ ...t, [channel]: v })) }}
            />
          </Field>
          <div className="row">
            <button className="btn btn-pink">
              {isNote ? <StickyNote size={14} aria-hidden="true" /> : <Send size={14} aria-hidden="true" />} {isNote ? 'Save note' : 'Send message'}
            </button>
          </div>
        </form>
      </>
    )
  }

  return (
    <>
      <h3>Contact preferences</h3>
      <hr className="divider" />
      <dl className="kv">
        <dt>Preferred channel</dt><dd>Email</dd>
        <dt>Marketing</dt><dd>Opted out</dd>
        <dt>Best time to call</dt><dd>9:00 to 12:00</dd>
        <dt>Language</dt><dd>English</dd>
      </dl>
    </>
  )
}

function Records({ cu, state, dispatch, go, onOpenDoc }) {
  const cases = state.cases.filter(c => c.customer === cu.id)
  const activity = state.activity.filter(a => a.customer === cu.id)
  const tab = state.recordTab

  return (
    <section className="records panel">
      <Tabs
        spread value={tab} onChange={v => dispatch({ type: 'recordTab', value: v })}
        tabs={[['info', 'Customer information'], ['cases', `Cases (${cases.length})`], ['policies', `Policies (${cu.policies.length})`], ['rfqs', `RFQs (${cu.rfqs.length})`]]}
      />

      {tab === 'info' && (
        <>
          <h3>Personal information</h3>
          <hr className="divider" />
          <div className="pdetails">
            <p><strong>Company:</strong> {cu.company}</p>
            <p><strong>Address:</strong> {cu.address}</p>
            <p><strong>Phone number:</strong> {cu.phone}</p>
          </div>
          <h3>Documents</h3>
          <hr className="divider" />
          <div className="docs">
            {cu.docs.map(d => (
              <button key={d} className="doc" onClick={() => onOpenDoc(d)}><FileText aria-hidden="true" /><span>{d}</span></button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 14 }}>
            <h3>Activity log</h3>
            <hr className="divider" />
            <ActivityList items={activity} empty="No activity yet. Emails and notes you send appear here." />
          </div>
        </>
      )}

      {tab === 'cases' && (
        <div className="rlist">
          {cases.length ? cases.map(cs => (
            <div key={cs.id}>
              <span><b>{cs.title}</b><small>{cs.id} · {cs.policy}</small></span>
              <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <StatusLabel status={cs.status} />
                <button className="linkbtn" onClick={() => { dispatch({ type: 'openCase', id: cs.id }); go('cases') }}>Open</button>
              </span>
            </div>
          )) : <div className="empty">No cases for this customer.</div>}
        </div>
      )}

      {tab === 'policies' && (
        <div className="rlist">
          {cu.policies.map(p => (
            <div key={p.num}><span><b>{p.num}</b><small>{p.product} · renews {p.renews}</small></span><span className="status">{p.status}</span></div>
          ))}
        </div>
      )}

      {tab === 'rfqs' && (
        <div className="rlist">
          {cu.rfqs.length ? cu.rfqs.map(r => (
            <div key={r.num}><span><b>{r.num}</b><small>{r.product}</small></span><span className="status">{r.when}</span></div>
          )) : <div className="empty">No open quotes.</div>}
        </div>
      )}
    </section>
  )
}

export default function CustomerWorkspace({ state, dispatch, notify, go, now }) {
  const cu = CUSTOMERS[state.currentCustomer]
  const [email, setEmail] = useState({ to: cu.email, subject: '', body: '' })
  const [doc, setDoc] = useState(null)
  const [current, ...upcoming] = TASK_ORDER
  const pick = id => dispatch({ type: 'pickCustomer', id })

  function attach() {
    setEmail(m => ({ ...m, body: (m.body ? m.body + '\n\n' : '') + `Attached: ${doc}` }))
    dispatch({ type: 'channel', value: 'email' })
    notify(`${doc} attached`)
    setDoc(null)
  }

  return (
    <div className="cust">
      <aside className="tasklist panel">
        <h2>Tasks (1)</h2>
        <TaskItem id={current} current={state.currentCustomer === current} onPick={pick} />
        <hr className="divider" />
        <h2>Upcoming tasks ({upcoming.length})</h2>
        {upcoming.map((id, i) => (
          <div key={id} style={{ display: 'contents' }}>
            <TaskItem id={id} current={state.currentCustomer === id} onPick={pick} />
            {i < upcoming.length - 1 && <hr className="divider" />}
          </div>
        ))}
      </aside>

      <section className="contact panel">
        <CallCard cu={cu} call={state.call} now={now} dispatch={dispatch} notify={notify} />
        <div className="composer">
          <div className="channels" role="tablist">
            {CHANNELS.map(([key, Icon, label]) => (
              <button key={key} role="tab" aria-label={label} title={label} aria-selected={state.channel === key}
                onClick={() => dispatch({ type: 'channel', value: key })}>
                <Icon aria-hidden="true" />
              </button>
            ))}
          </div>
          <Composer cu={cu} channel={state.channel} dispatch={dispatch} notify={notify} email={email} setEmail={setEmail} />
        </div>
      </section>

      <Records cu={cu} state={state} dispatch={dispatch} go={go} onOpenDoc={setDoc} />

      {doc && <DocModal doc={doc} customer={cu} onClose={() => setDoc(null)} onAttach={attach} />}
    </div>
  )
}
