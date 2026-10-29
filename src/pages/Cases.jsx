import { useState } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, CircleCheck, Send } from 'lucide-react'
import { CUSTOMERS, REASONS, STATUS } from '../state/data.js'
import { caseCounts } from '../state/reducer.js'
import { Avatar, Button, CaseTypeTag, Data, Field, Panel, StatTile, StatusBadge, Tabs } from '../components/ui.jsx'

function CaseRow({ cs, onOpen }) {
  return (
    <button className="caserow" onClick={onOpen}>
      <CaseTypeTag type={cs.type} />
      <span className="caserow__main">
        <span className="caserow__title">{cs.title}</span>
        <span className="caserow__meta"><Data>{cs.id}</Data><span>·</span><span>{CUSTOMERS[cs.customer].name}</span><span>·</span><Data>{cs.policy}</Data></span>
      </span>
      <StatusBadge status={cs.status} />
      <ChevronRight aria-hidden="true" />
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
    return <div className="done-note"><CircleCheck size={18} aria-hidden="true" /> {t.title} completed. There are no open tasks on this case.</div>
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
      <div className="task-info">
        <div className="task-head">
          <Avatar initials={t.assignee.split(' ').map(w => w[0]).slice(0, 2).join('')} />
          <div><h3>{t.title}</h3><span className="cw-muted" style={{ fontSize: 12, lineHeight: '16px' }}>Assigned to {t.assignee}</span></div>
        </div>
        <p style={{ maxWidth: '65ch' }}>{t.lead} {t.body}</p>
        <dl className="facts">
          {t.facts.map(([k, v]) => [<dt key={k}>{k}</dt>, <dd key={k + 'v'}>{v}</dd>])}
        </dl>
        <details className="trigger">
          <summary>What triggered this case? <ChevronDown aria-hidden="true" /></summary>
          <p>{t.trigger}</p>
        </details>
      </div>

      <div className="task-side">
        <div className="actions">
          <Button variant="secondary" aria-expanded={reasonsOpen} onClick={() => setReasonsOpen(o => !o)}>
            Add a reason <ChevronDown size={16} aria-hidden="true" />
          </Button>
          <Button variant="secondary" icon={CircleCheck} onClick={() => setConfirming(true)}>Complete task</Button>
          {reasonsOpen && (
            <div className="popover dropdown" role="menu">
              {REASONS.map(r => <button key={r} role="menuitem" onClick={() => addReason(r)}>{r}</button>)}
            </div>
          )}
        </div>

        {confirming && (
          <div className="confirm">
            <b style={{ fontWeight: 500 }}>Complete “{t.title}”?</b>
            <p>The case moves to Done and the customer record is updated.</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="primary" onClick={() => { dispatch({ type: 'completeCase', id: cs.id }); notify(`${cs.id} moved to Done`) }}>Complete task</Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} noValidate>
          <Field id={`req-${cs.id}`} label="Request more information" error={error} hint="The customer receives this by email.">
            <textarea
              id={`req-${cs.id}`} className="cw-input" rows={7} value={draft} placeholder="Write what you need from the customer"
              aria-invalid={!!error} aria-describedby={error ? `req-${cs.id}-err` : undefined}
              onChange={e => { setDraft(e.target.value); if (error) setError('') }}
            />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" icon={Send}>Send request</Button>
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
    <Panel as="article" className="casecard">
      <div className="case-title">
        <CaseTypeTag type={cs.type} />
        <h2>{cs.title}</h2>
        <StatusBadge status={cs.status} />
        <Button variant="ghost" iconOnly icon={ChevronUp} aria-label="Collapse case" title="Collapse case" onClick={() => dispatch({ type: 'collapseCase' })} />
      </div>
      <dl className="overview">
        <div className="meta"><dt>Submitted by</dt><dd className="submitted"><Avatar initials={cs.byInitials} size="sm" />{cs.by}</dd></div>
        <div className="meta"><dt>Channel</dt><dd>{cs.channel}</dd></div>
        <div className="meta"><dt>Policy expiry</dt><dd><Data>{cs.expiry}</Data></dd></div>
        <div className="meta"><dt>Policy number</dt><dd><a href="#customer" onClick={openCustomer} style={{ color: 'var(--accent)' }}><Data>{cs.policy}</Data></a></dd></div>
      </dl>
      <Tabs
        label="Case" value={tab} onChange={v => dispatch({ type: 'caseTab', value: v })}
        tabs={[['tasks', 'Tasks', cs.status === 'done' ? 0 : 1], ['info', 'Case information'], ['customer', 'Customer information']]}
      />
      {tab === 'tasks' && <TaskPanel key={cs.id} cs={cs} dispatch={dispatch} notify={notify} />}
      {tab === 'info' && (
        <dl className="kv">
          <dt>Case ID</dt><dd><Data>{cs.id}</Data></dd>
          <dt>Type</dt><dd>{cs.type}</dd>
          <dt>Status</dt><dd><StatusBadge status={cs.status} /></dd>
          <dt>Channel</dt><dd>{cs.channel}</dd>
          <dt>Owner</dt><dd>{t.assignee}</dd>
          <dt>Policy or RFQ</dt><dd><Data>{cs.policy}</Data></dd>
          <dt>Trigger</dt><dd style={{ maxWidth: '65ch' }}>{t.trigger}</dd>
        </dl>
      )}
      {tab === 'customer' && (
        <dl className="kv">
          <dt>Customer</dt><dd>{cu.title} {cu.name}</dd>
          <dt>Company</dt><dd>{cu.company}</dd>
          <dt>Email</dt><dd>{cu.email}</dd>
          <dt>Phone</dt><dd><Data>{cu.phone}</Data></dd>
          <dt>Address</dt><dd>{cu.address}</dd>
          <dt /><dd><button className="linkbtn" onClick={openCustomer}>Open customer workspace</button></dd>
        </dl>
      )}
    </Panel>
  )
}

export default function Cases({ state, dispatch, notify, go }) {
  const counts = caseCounts(state.cases)
  const { filter } = state
  const list = state.cases.filter(c => !filter || c.status === filter)
  const toggle = value => dispatch({ type: 'filter', value })

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1 className="page__title">My cases</h1>
          <p className="page__sub">{filter ? `Showing ${STATUS[filter].label.toLowerCase()} cases.` : 'All cases assigned to you and your team.'}</p>
        </div>
        {filter && <Button variant="ghost" size="sm" onClick={() => toggle(filter)}>Show all cases</Button>}
      </div>
      <div className="totals">
        <StatTile value={counts.new} label="New" status="new" pressed={filter === 'new'} onClick={() => toggle('new')} />
        <StatTile value={counts.progress} label="In progress" status="progress" pressed={filter === 'progress'} onClick={() => toggle('progress')} />
        <StatTile value={counts.done} label="Done" status="done" pressed={filter === 'done'} onClick={() => toggle('done')} />
      </div>
      <div className="caselist">
        {list.length ? list.map(cs => cs.id === state.openCase
          ? <CaseCard key={cs.id} cs={cs} tab={state.caseTab} dispatch={dispatch} notify={notify} go={go} />
          : <CaseRow key={cs.id} cs={cs} onOpen={() => dispatch({ type: 'openCase', id: cs.id })} />
        ) : (
          <Panel><p className="cw-muted">No {filter ? STATUS[filter].label.toLowerCase() : ''} cases yet. Complete a task and it will appear here.</p></Panel>
        )}
      </div>
    </div>
  )
}
