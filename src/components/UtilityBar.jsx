import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, RotateCcw, UsersRound, Video } from 'lucide-react'
import { AGENT, CUSTOMERS, TYPE_COLOR } from '../state/data.js'
import { callSeconds, formatDuration } from '../state/reducer.js'
import { Avatar } from './ui.jsx'

const PRESENCE_COLOR = { Available: '#4f762e', Busy: '#c6ad36', Offline: '#8a93a6' }

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
    const base = { kind: 'customer', id: c.id, initials: c.initials, color: c.taskColor }
    if (`${c.name} ${c.company}`.toLowerCase().includes(q)) hits.push({ ...base, title: c.name, sub: c.company })
    c.policies.forEach(p => p.num.toLowerCase().includes(q) && hits.push({ ...base, title: p.num, sub: `${p.product} · ${c.name}` }))
    c.rfqs.forEach(r => r.num.toLowerCase().includes(q) && hits.push({ ...base, title: r.num, sub: `${r.product} · ${c.name}` }))
  })
  cases.forEach(cs => {
    if (`${cs.id} ${cs.title}`.toLowerCase().includes(q)) {
      hits.push({ kind: 'case', id: cs.id, initials: '#', color: TYPE_COLOR[cs.type], title: cs.id, sub: cs.title })
    }
  })
  return hits.slice(0, 6)
}

export default function UtilityBar({ state, dispatch, notify, go, now }) {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const searchRef = useRef()
  const menuRef = useRef()
  useOutsideClick(searchRef, () => setQuery(''))
  useOutsideClick(menuRef, () => setMenuOpen(false))

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

  const callLabel = live
    ? `On call · ${CUSTOMERS[call.customer].name}`
    : call.state === 'ringing' ? 'Incoming call' : presence === 'Offline' ? 'Offline' : 'No call'

  return (
    <header className="utility">
      <div className="search" ref={searchRef}>
        <input
          id="search" type="search" autoComplete="off" value={query}
          placeholder="Search by policy, RFQ or last name" aria-label="Search by policy, RFQ or last name"
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && results[0]) openHit(results[0])
            if (e.key === 'Escape') setQuery('')
          }}
        />
        {query.trim() && (
          <div className="results" role="listbox">
            {results.length ? results.map(h => (
              <button key={h.kind + h.title} role="option" aria-selected="false" onClick={() => openHit(h)}>
                <Avatar initials={h.initials} color={h.color} size="sm" />
                <span><b>{h.title}</b><small>{h.sub}</small></span>
              </button>
            )) : (
              <div className="none">No policy, RFQ or customer matches “{query}”. Try SME012345678 or Madrigal.</div>
            )}
          </div>
        )}
      </div>

      <button onClick={() => go('customer')} title="Customer workspace" aria-label="Customer workspace">
        <UsersRound aria-hidden="true" />
      </button>

      <div className={`callstat${live ? ' live' : ''}`}>
        <Video size={19} aria-hidden="true" />
        <span>{callLabel}</span>
      </div>
      <span className="calltime">Call time: {formatDuration(callSeconds(call, now))}</span>

      <div className="usermenu" ref={menuRef}>
        <button className="userbtn" aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)}>
          <Avatar initials={AGENT.initials} color={AGENT.color} size="lg" />
          <span className="who">
            <b>{AGENT.name}</b>
            <span><i className="presence" style={{ background: PRESENCE_COLOR[presence] }} />{presence}</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div className="menu" role="menu">
            {Object.keys(PRESENCE_COLOR).map(p => (
              <button key={p} role="menuitem" onClick={() => {
                dispatch({ type: 'presence', value: p }); setMenuOpen(false); notify(`Status set to ${p}`)
              }}>
                <i className="presence" style={{ background: PRESENCE_COLOR[p] }} />{p}{presence === p ? ' ✓' : ''}
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
