import { useState } from 'react'
import {
  FileText, Mail, MessageCircle, Phone, PhoneCall, PhoneForwarded, PhoneOff, Send, Settings, StickyNote,
} from 'lucide-react'
import { AGENT, CUSTOMERS, TASK_ORDER, TEAMS } from '../state/data.js'
import { callSeconds, formatDuration } from '../state/reducer.js'
import { ActivityList, Avatar, Button, Data, Field, Panel, StatusBadge, Tabs } from '../components/ui.jsx'
import DocModal from '../components/DocModal.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CHANNELS = [['email', Mail, 'Email'], ['chat', MessageCircle, 'Chat'], ['note', StickyNote, 'Note'], ['settings', Settings, 'Preferences']]

function TaskItem({ id, current, onPick }) {
  const c = CUSTOMERS[id]
  return (
    <button className="ctask" aria-current={current} onClick={() => onPick(id)}>
      <Avatar initials={c.initials} />
      <span><b>{c.name}</b><small>{c.note}</small></span>
    </button>
  )
}

function CallCard({ cu, call, now, dispatch, notify }) {
  const [transferOpen, setTransferOpen] = useState(false)
  const status = call.customer === cu.id ? call.state : 'idle'

  let line = 'Not on a call'
  if (status === 'ringing') line = 'Incoming call'
  else if (status === 'active') line = `On call · ${formatDuration(callSeconds(call, now))}`
  else if (call.customer === cu.id && call.total) line = `Last call ${formatDuration(call.total)}`

  return (
    <div className="callcard">
      <Avatar initials={cu.initials} size="xl" />
      <div>
        <h2 className="callcard__name">{cu.title} {cu.name}</h2>
        <div className="callcard__queue">
          <span className="cw-tag">{cu.direction === 'IB' ? 'Inbound' : 'Outbound'} · {cu.queue}</span>
        </div>
        <p className={`cw-timer${status === 'active' ? ' cw-live' : ''}`} style={{ marginTop: 'var(--space-2)' }}>{line}</p>
      </div>

      {status === 'ringing' && (
        <div className="cw-call">
          <button className="cw-call__btn cw-call__btn--answer" aria-label="Answer call" title="Answer call" onClick={() => { dispatch({ type: 'answer' }); notify('Call connected') }}><Phone /></button>
          <button className="cw-call__btn cw-call__btn--end" aria-label="Decline call" title="Decline call" onClick={() => { dispatch({ type: 'decline' }); notify('Call declined') }}><PhoneOff /></button>
        </div>
      )}
      {status === 'active' && (
        <>
          <div className="cw-call">
            <button className="cw-call__btn" aria-label="Call details" title="Call details" onClick={() => notify('Call recording is on for quality and training')}><PhoneCall /></button>
            <button className="cw-call__btn cw-call__btn--end" aria-label="End call" title="End call" onClick={() => {
              dispatch({ type: 'endCall' }); setTransferOpen(false); notify(`Call ended · ${formatDuration(callSeconds(call))}`)
            }}><PhoneOff /></button>
            <button className="cw-call__btn" aria-label="Transfer call" title="Transfer call" aria-expanded={transferOpen} onClick={() => setTransferOpen(o => !o)}><PhoneForwarded /></button>
          </div>
          {transferOpen && (
            <div className="transfer">
              {TEAMS.slice(0, 6).map(t => (
                <Button key={t.name} variant="secondary" size="sm" onClick={() => { dispatch({ type: 'transfer', team: t.name }); setTransferOpen(false); notify(`Transferred to ${t.name}`) }}>{t.name}</Button>
              ))}
            </div>
          )}
        </>
      )}
      {status === 'idle' && (
        <div className="cw-call">
          <button
            className="cw-call__btn cw-call__btn--answer" aria-label={`Call ${cu.name}`}
            disabled={call.state === 'active'} title={call.state === 'active' ? 'Finish your current call first' : `Call ${cu.name}`}
            style={call.state === 'active' ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
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
  const described = key => (errors[key] ? `${key === 'to' ? 'em-to' : key === 'subject' ? 'em-subject' : 'em-body'}-err` : undefined)

  if (channel === 'email') return (
    <form onSubmit={sendEmail} noValidate>
      <Field id="em-to" label="To" error={errors.to}>
        <input id="em-to" className="cw-input" type="email" value={email.to} onChange={set('to')} placeholder={cu.email} aria-invalid={!!errors.to} aria-describedby={described('to')} />
      </Field>
      <Field id="em-subject" label="Subject" error={errors.subject}>
        <input id="em-subject" className="cw-input" value={email.subject} onChange={set('subject')} placeholder="Add a subject" aria-invalid={!!errors.subject} aria-describedby={described('subject')} />
      </Field>
      <Field id="em-body" label="Message" error={errors.body}>
        <textarea id="em-body" className="cw-input" rows={8} value={email.body} onChange={set('body')} placeholder="Write the email" aria-invalid={!!errors.body} aria-describedby={described('body')} />
      </Field>
      <div className="row">
        <Button variant="secondary" icon={FileText} onClick={applyTemplate}>Use renewal template</Button>
        <Button type="submit" variant="primary" icon={Send}>Send email</Button>
      </div>
    </form>
  )

  if (channel === 'chat' || channel === 'note') {
    const isNote = channel === 'note'
    return (
      <form onSubmit={sendText(channel)} noValidate>
        <Field
          id={channel} label={isNote ? 'Internal note' : `Message to ${cu.name}`} error={errors[channel]}
          hint={isNote ? 'Only your team can see notes.' : 'The customer sees this in their chat window.'}
        >
          <textarea
            id={channel} className="cw-input" rows={isNote ? 6 : 5} value={text[channel]}
            placeholder={isNote ? 'For example: customer will send accounts by Friday' : 'Write a chat message'}
            onChange={e => { const v = e.target.value; setText(t => ({ ...t, [channel]: v })) }}
          />
        </Field>
        <div className="row">
          <Button type="submit" variant="primary" icon={isNote ? StickyNote : Send}>{isNote ? 'Save note' : 'Send message'}</Button>
        </div>
      </form>
    )
  }

  return (
    <dl className="kv">
      <dt>Preferred channel</dt><dd>Email</dd>
      <dt>Marketing</dt><dd>Opted out</dd>
      <dt>Best time to call</dt><dd><Data>09:00–12:00</Data></dd>
      <dt>Language</dt><dd>English</dd>
    </dl>
  )
}

function Records({ cu, state, dispatch, go, onOpenDoc }) {
  const cases = state.cases.filter(c => c.customer === cu.id)
  const activity = state.activity.filter(a => a.customer === cu.id)
  const tab = state.recordTab

  return (
    <Panel className="records">
      <Tabs
        label="Customer record" value={tab} onChange={v => dispatch({ type: 'recordTab', value: v })}
        tabs={[['info', 'Overview'], ['cases', 'Cases', cases.length], ['policies', 'Policies', cu.policies.length], ['rfqs', 'Quotes', cu.rfqs.length]]}
      />

      {tab === 'info' && (
        <>
          <h3>{cu.company}</h3>
          <dl className="kv">
            <dt>Address</dt><dd>{cu.address}</dd>
            <dt>Phone</dt><dd><Data>{cu.phone}</Data></dd>
            <dt>Email</dt><dd>{cu.email}</dd>
            <dt>Policy</dt><dd><Data>{cu.policies[0].num}</Data></dd>
          </dl>
          <hr className="cw-divider" />
          <h3>Documents</h3>
          <div className="docs">
            {cu.docs.map(d => (
              <button key={d} className="doc" onClick={() => onOpenDoc(d)}><FileText aria-hidden="true" /><span>{d}</span></button>
            ))}
          </div>
          <hr className="cw-divider" />
          <h3>Activity log</h3>
          <ActivityList items={activity} empty="No activity yet. Emails, calls and notes appear here." />
        </>
      )}

      {tab === 'cases' && (
        <div className="rlist">
          {cases.length ? cases.map(cs => (
            <div key={cs.id}>
              <span><b>{cs.title}</b><small><Data>{cs.id}</Data> · <Data>{cs.policy}</Data></small></span>
              <span style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <StatusBadge status={cs.status} />
                <Button variant="ghost" size="sm" onClick={() => { dispatch({ type: 'openCase', id: cs.id }); go('cases') }}>Open</Button>
              </span>
            </div>
          )) : <div className="empty">No cases for this customer.</div>}
        </div>
      )}

      {tab === 'policies' && (
        <div className="rlist">
          {cu.policies.map(p => (
            <div key={p.num}><span><Data>{p.num}</Data><small>{p.product} · renews {p.renews}</small></span><span className="cw-tag">{p.status}</span></div>
          ))}
        </div>
      )}

      {tab === 'rfqs' && (
        <div className="rlist">
          {cu.rfqs.length ? cu.rfqs.map(r => (
            <div key={r.num}><span><Data>{r.num}</Data><small>{r.product}</small></span><span className="cw-muted">{r.when}</span></div>
          )) : <div className="empty">No open quotes for this customer.</div>}
        </div>
      )}
    </Panel>
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
      <Panel as="aside" className="tasklist">
        <h2>Now</h2>
        <TaskItem id={current} current={state.currentCustomer === current} onPick={pick} />
        <h2>Up next · {upcoming.length}</h2>
        {upcoming.map(id => <TaskItem key={id} id={id} current={state.currentCustomer === id} onPick={pick} />)}
      </Panel>

      <Panel className="contact">
        <CallCard cu={cu} call={state.call} now={now} dispatch={dispatch} notify={notify} />
        <div className="composer">
          <div className="cw-tabs" role="tablist" aria-label="Contact channel">
            {CHANNELS.map(([key, Icon, label]) => (
              <button key={key} type="button" role="tab" className="cw-tab" aria-selected={state.channel === key}
                onClick={() => dispatch({ type: 'channel', value: key })}>
                <Icon size={16} aria-hidden="true" />{label}
              </button>
            ))}
          </div>
          <Composer cu={cu} channel={state.channel} dispatch={dispatch} notify={notify} email={email} setEmail={setEmail} />
        </div>
      </Panel>

      <Records cu={cu} state={state} dispatch={dispatch} go={go} onOpenDoc={setDoc} />

      {doc && <DocModal doc={doc} customer={cu} onClose={() => setDoc(null)} onAttach={attach} />}
    </div>
  )
}
