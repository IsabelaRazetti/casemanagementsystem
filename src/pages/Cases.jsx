import { useState } from 'react'
import { ChevronDown, ChevronUp, CircleCheck, Send } from 'lucide-react'
import { CUSTOMERS, REASONS, STATUS } from '../state/data.js'
import { caseCounts } from '../state/reducer.js'
import { Avatar, Field, StatusLabel, Tabs, TypePill } from '../components/ui.jsx'

function Total({ k, label, count, active, onClick }) {
  return (
    <button className="total panel" aria-pressed={active} onClick={onClick}>
      <span className="bar" style={{ background: k === 'new' ? '#e91c5e' : '#4b752c' }} />
      <span className="v"><b>{count}</b><span>{label}</span></span>
    </button>
  )
}

function CaseRow({ cs, onOpen }) {
  return (
    <button className="caserow panel" onClick={onOpen}>
      <TypePill type={cs.type} />
      <span className="t">{cs.title}<small>{cs.id} · {CUSTOMERS[cs.customer].name} · {cs.policy}</small></span>
      <StatusLabel status={cs.status} />
      <ChevronDown aria-hidden="true" />
    </button>
  )
}

function TaskPanel({ cs, dispatch, notify }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [reasonsOpen, setReasonsOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const t = cs.task

  if (cs.status === 'done') {
    return <div className="task"><div className="done-note"><CircleCheck aria-hidden="true" /> {t.title} completed. No open tasks on this case.</div></div>
  }

  function addReason(r) {
    setDraft(d => (d.trim() ? d.trim() + '\n' : '') + `Please send: ${r}.`)
    setReasonsOpen(false)
    setError('')
  }

  function submit(e) {
    e.preventDefault()
    if (draft.trim().length < 10) {
      setError('Write what you need from the customer (at least 10 characters), or pick a reason from the menu.')
      return
    }
    dispatch({ type: 'requestInfo', id: cs.id, message: draft })
    notify(`Request sent · ${cs.id} is now in progress`)
    setDraft('')
  }

  return (
    <div className="task">
      <div className="task-left">
        <Avatar initials="R" color="#23a4aa" />
        <div className="task-info">
          <div><h3>{t.title}</h3><small>{t.assignee}</small></div>
          <p>{t.lead}<br />{t.body}</p>
          <dl className="facts">
            {t.facts.map(([k, v]) => [<dt key={k}>{k}:</dt>, <dd key={k + 'v'}>{v}</dd>])}
          </dl>
          <details className="trigger">
            <summary>What triggered the referral? <ChevronDown size={16} aria-hidden="true" /></summary>
            <p>{t.trigger}</p>
          </details>
        </div>
      </div>

      <div className="task-right">
        <div className="actions">
          <button className="btn btn-outline" aria-expanded={reasonsOpen} onClick={() => setReasonsOpen(o => !o)}>
            Request more information <ChevronDown size={14} aria-hidden="true" />
          </button>
          <button className="btn btn-green" onClick={() => setConfirming(true)}>Complete</button>
          {reasonsOpen && (
            <div className="dropdown">
              {REASONS.map(r => <button key={r} onClick={() => addReason(r)}>{r}</button>)}
            </div>
          )}
        </div>

        {confirming && (
          <div className="confirm">
            <b>Complete “{t.title}”?</b>
            <span>The case moves to Done and the customer record is updated.</span>
            <div>
              <button className="btn btn-green" onClick={() => { dispatch({ type: 'completeCase', id: cs.id }); notify(`${cs.id} moved to Done`) }}>Yes, complete</button>
              <button className="btn btn-outline" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
          <Field id={`req-${cs.id}`} label="Request more information" error={error}>
            <textarea
              id={`req-${cs.id}`} rows={8} value={draft} placeholder="Write the reason for the request"
              aria-invalid={!!error} aria-describedby={error ? `req-${cs.id}-err` : undefined}
              onChange={e => { setDraft(e.target.value); if (error) setError('') }}
            />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-pink"><Send size={14} aria-hidden="true" /> Send request</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CaseCard({ cs, tab, dispatch, notify, go }) {
  const cu = CUSTOMERS[cs.customer]
  const t = cs.task
  const openCustomer = e => { e.preventDefault(); dispatch({ type: 'pickCustomer', id: cu.id }); go('customer') }

  return (
    <article className="casecard panel">
      <div className="case-title">
        <TypePill type={cs.type} />
        <h2>{cs.title}</h2>
        <StatusLabel status={cs.status} />
        <button className="collapse" aria-label="Collapse case" onClick={() => dispatch({ type: 'collapseCase' })}><ChevronUp /></button>
      </div>
      <hr className="divider" />
      <div className="overview">
        <div className="submitted">
          <Avatar initials={cs.byInitials} color="#5c7297" />
          <div className="meta"><b>Submitted by:</b><span>{cs.by}</span></div>
        </div>
        <div className="meta"><b>Channel:</b><span>{cs.channel}</span></div>
        <div className="meta"><b>Policy Expire Date:</b><span>{cs.expiry}</span></div>
        <div className="meta"><b>Policy number:</b><a href="#customer" onClick={openCustomer}>{cs.policy}</a></div>
      </div>
      <hr className="divider" />
      <Tabs
        value={tab}
        onChange={v => dispatch({ type: 'caseTab', value: v })}
        tabs={[['tasks', `Tasks (${cs.status === 'done' ? 0 : 1})`], ['info', 'Case information'], ['customer', 'Customer information']]}
      />
      {tab === 'tasks' && <TaskPanel key={cs.id} cs={cs} dispatch={dispatch} notify={notify} />}
      {tab === 'info' && (
        <div className="task">
          <dl className="kv">
            <dt>Case ID</dt><dd>{cs.id}</dd>
            <dt>Type</dt><dd>{cs.type}</dd>
            <dt>Status</dt><dd><StatusLabel status={cs.status} /></dd>
            <dt>Channel</dt><dd>{cs.channel}</dd>
            <dt>Owner</dt><dd>{t.assignee}</dd>
            <dt>Policy / RFQ</dt><dd>{cs.policy}</dd>
            <dt>Trigger</dt><dd>{t.trigger}</dd>
          </dl>
        </div>
      )}
      {tab === 'customer' && (
        <div className="task">
          <dl className="kv">
            <dt>Customer</dt><dd>{cu.title} {cu.name}</dd>
            <dt>Company</dt><dd>{cu.company}</dd>
            <dt>Email</dt><dd>{cu.email}</dd>
            <dt>Phone</dt><dd>{cu.phone}</dd>
            <dt>Address</dt><dd>{cu.address}</dd>
            <dt /><dd><button className="linkbtn" onClick={openCustomer}>Open customer workspace</button></dd>
          </dl>
        </div>
      )}
    </article>
  )
}

export default function Cases({ state, dispatch, notify, go }) {
  const counts = caseCounts(state.cases)
  const { filter } = state
  const list = state.cases.filter(c => !filter || c.status === filter)
  const toggle = value => dispatch({ type: 'filter', value })

  return (
    <div className="cases">
      <div className="totals">
        <Total k="new" label="New cases" count={counts.new} active={filter === 'new'} onClick={() => toggle('new')} />
        <Total k="progress" label="In progress" count={counts.progress} active={filter === 'progress'} onClick={() => toggle('progress')} />
        <Total k="done" label="Done" count={counts.done} active={filter === 'done'} onClick={() => toggle('done')} />
      </div>
      <div className="cases-head">
        <h1>My Cases</h1>
        {filter && <button className="clearf" onClick={() => toggle(filter)}>Showing {STATUS[filter].label.toLowerCase()} · show all</button>}
      </div>
      <div className="caselist">
        {list.length ? list.map(cs => cs.id === state.openCase
          ? <CaseCard key={cs.id} cs={cs} tab={state.caseTab} dispatch={dispatch} notify={notify} go={go} />
          : <CaseRow key={cs.id} cs={cs} onOpen={() => dispatch({ type: 'openCase', id: cs.id })} />
        ) : (
          <div className="panel empty" style={{ padding: 28 }}>
            No {filter ? STATUS[filter].label.toLowerCase() : ''} cases yet. Complete a task to see it here.
          </div>
        )}
      </div>
    </div>
  )
}
