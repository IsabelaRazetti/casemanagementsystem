import { STATUS, TYPE_COLOR } from '../state/data.js'

export function Avatar({ initials, color, size = '' }) {
  return (
    <span className={`avatar ${size}`} style={{ background: color }} aria-hidden="true">
      {initials}
    </span>
  )
}

export function StatusLabel({ status }) {
  const s = STATUS[status]
  return (
    <span className="status">
      <i style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

export function TypePill({ type }) {
  return <span className="pill" style={{ background: TYPE_COLOR[type] }}>{type}</span>
}

export function ActivityList({ items, limit = 5, empty }) {
  if (!items.length) return <div className="empty">{empty}</div>
  return (
    <div className="activity">
      {items.slice(0, limit).map(a => (
        <div key={a.id} className={`act${a.fresh ? ' fresh' : ''}`}>
          <Avatar initials={a.initials} color="#243252" />
          <div>
            <p>{a.who} {a.text}</p>
            <time>{a.when}</time>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Tabs({ tabs, value, onChange, spread = false }) {
  return (
    <div className={`tabs${spread ? ' spread' : ''}`} role="tablist">
      {tabs.map(([key, label]) => (
        <button key={key} role="tab" aria-selected={value === key} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function Field({ id, label, error, children }) {
  return (
    <div className={`field${error ? ' invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="err" id={`${id}-err`}>{error}</span>}
    </div>
  )
}
