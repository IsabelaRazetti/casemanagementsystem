import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Play, RotateCcw, Search, Video } from 'lucide-react'
import { SCENARIOS, SCENARIO_ORDER } from '../state/scenarios.js'
import { AGENT, CUSTOMERS } from '../state/data.js'
import { callSeconds, formatDuration } from '../state/reducer.js'
import { Avatar, Button, Data } from './ui.jsx'

const PRESENCES = ['Available', 'Busy', 'Offline']

function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onOutside() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

function searchAll(query, cases) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits = []
  Object.values(CUSTOMERS).forEach(c => {
    const base = { kind: 'customer', id: c.id, initials: c.initials }
    if (`${c.name} ${c.company}`.toLowerCase().includes(q)) hits.push({ ...base, title: c.name, sub: c.company })
    c.policies.forEach(p => p.num.toLowerCase().includes(q) && hits.push({ ...base, title: p.num, sub: `${p.product} · ${c.name}`, isRef: true }))
    c.rfqs.forEach(r => r.num.toLowerCase().includes(q) && hits.push({ ...base, title: r.num, sub: `${r.product} · ${c.name}`, isRef: true }))
  })
  cases.forEach(cs => {
    if (`${cs.id} ${cs.title}`.toLowerCase().includes(q)) {
      hits.push({ kind: 'case', id: cs.id, initials: '#', title: cs.id, sub: cs.title, isRef: true })
    }
  })
  return hits.slice(0, 6)
}

export default function UtilityBar({ state, dispatch, notify, go, now }) {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const searchRef = useRef()
  const demoRef = useRef()
  const inputRef = useRef()
  const menuRef = useRef()
  useOutsideClick(searchRef, () => setQuery(''))
  useOutsideClick(menuRef, () => setMenuOpen(false))
  useOutsideClick(demoRef, () => setDemoOpen(false))

  // "/" focuses search, like most work tools.
  useEffect(() => {
    const onKey = e => {
      if (e.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => searchAll(query, state.cases), [query, state.cases])
  const { call, presence } = state
  const live = call.state === 'active'

  function openHit(hit) {
    setQuery('')
    if (hit.kind === 'case') {
      dispatch({ type: 'openCase', id: hit.id })
      go('cases')
    } else {
      dispatch({ type: 'pickCustomer', id: hit.id })
      go('customer')
    }
  }

  const who = call.customer ? CUSTOMERS[call.customer].name : ''
  const sms = call.channel === 'sms'
  const callLabel = live
    ? <span className="cw-live">{who} · <span className="cw-timer">{formatDuration(callSeconds(call, now))}</span></span>
    : call.state === 'ringing' ? `${sms ? 'Incoming SMS' : 'Incoming call'} · ${who}`
    : call.state === 'ivr' ? `Virtual assistant · ${who}`
    : presence === 'Offline' ? 'Offline' : 'No active contact'
  const contactWaiting = ['ringing', 'ivr', 'active'].includes(call.state)

  function simulate(id) {
    setDemoOpen(false)
    dispatch({ type: 'simulateContact', id })
    go('customer')
  }

  return (
    <header className="utility">
      <div className="search" ref={searchRef}>
        <Search className="lead" aria-hidden="true" />
        <input
          ref={inputRef} id="search" type="search" autoComplete="off" value={query} className="cw-input"
          placeholder="Search policy, RFQ or name" aria-label="Search by policy, RFQ or last name"
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && results[0]) openHit(results[0])
            if (e.key === 'Escape') { setQuery(''); e.currentTarget.blur() }
          }}
        />
        {!query && <kbd aria-hidden="true">/</kbd>}
        {query.trim() && (
          <div className="popover results" role="listbox">
            {results.length ? results.map(h => (
              <button key={h.kind + h.title} role="option" aria-selected="false" onClick={() => openHit(h)}>
                <Avatar initials={h.initials} size="sm" />
                <span>{h.isRef ? <Data>{h.title}</Data> : <b style={{ fontWeight: 500 }}>{h.title}</b>}<small>{h.sub}</small></span>
              </button>
            )) : (
              <div className="none">No policy, RFQ or customer matches “{query}”. Try SME012345678 or Madrigal.</div>
            )}
          </div>
        )}
      </div>

      {contactWaiting ? (
        <button className="callstat callstat--link" onClick={() => go('customer')} title="Open customer workspace">
          <Video aria-hidden="true" />
          <span>{callLabel}</span>
        </button>
      ) : (
        <div className="callstat">
          <Video aria-hidden="true" />
          <span>{callLabel}</span>
        </div>
      )}

      <div className="demo" ref={demoRef}>
        <Button
          variant="ghost" size="sm" icon={Play} aria-haspopup="true" aria-expanded={demoOpen}
          disabled={live} title={live ? 'Finish the current contact first' : 'Send a demo contact through the virtual assistant'}
          onClick={() => setDemoOpen(o => !o)}
        >Simulate contact</Button>
        {demoOpen && (
          <div className="popover demo__menu" role="menu">
            <span className="demo__label">Demo · contact goes through the virtual assistant</span>
            {SCENARIO_ORDER.map(id => {
              const sc = SCENARIOS[id]
              return (
                <button key={id} role="menuitem" onClick={() => simulate(id)}>
                  <Avatar initials={CUSTOMERS[sc.customer].initials} size="sm" />
                  <span><b style={{ fontWeight: 500 }}>{CUSTOMERS[sc.customer].name}</b><small>{sc.label}</small></span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="usermenu" ref={menuRef}>
        <button className="userbtn" aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
          <Avatar initials={AGENT.initials} size="lg" tone="agent" />
          <span className="who">
            <b>{AGENT.name}</b>
            <span><i className={`presence presence--${presence}`} />{presence}</span>
          </span>
          <ChevronDown aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className="popover menu" role="menu">
            {PRESENCES.map(p => (
              <button key={p} role="menuitemradio" aria-checked={presence === p} onClick={() => {
                dispatch({ type: 'presence', value: p }); setMenuOpen(false); notify(`Status set to ${p}`)
              }}>
                <i className={`presence presence--${p}`} />{p}{presence === p ? ' ✓' : ''}
              </button>
            ))}
            <hr />
            <button role="menuitem" onClick={() => {
              dispatch({ type: 'reset' }); setMenuOpen(false); notify('Demo data reset'); go('dashboard')
            }}>
              <RotateCcw size={16} aria-hidden="true" /> Reset demo data
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
