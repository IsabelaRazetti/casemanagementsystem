// React versions of the Casework design system components.
// The markup and class names match the design system's previews, so both stay in sync.
import { CircleAlert } from 'lucide-react'
import { AGENT, STATUS } from '../state/data.js'

export function Button({ variant = 'secondary', size, icon: Icon, iconOnly = false, className = '', children, ...props }) {
  const cls = ['cw-btn', `cw-btn--${variant}`, size === 'sm' && 'cw-btn--sm', iconOnly && 'cw-btn--icon', className]
    .filter(Boolean).join(' ')
  return (
    <button className={cls} type={props.type ?? 'button'} {...props}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </button>
  )
}

export function Avatar({ initials, size, tone }) {
  const isAgent = tone === 'agent' || initials === AGENT.initials
  const cls = ['cw-avatar', size && `cw-avatar--${size}`, isAgent && 'cw-avatar--accent', tone === 'team' && 'cw-avatar--nav']
    .filter(Boolean).join(' ')
  return <span className={cls} aria-hidden="true">{initials}</span>
}

export function StatusBadge({ status }) {
  return <span className={`cw-badge cw-badge--${status}`}>{STATUS[status].label}</span>
}

export function CaseTypeTag({ type }) {
  return <span className="cw-tag">{type}</span>
}

export function Data({ children }) {
  return <span className="cw-data">{children}</span>
}

export function Panel({ title, actions, className = '', children, as: Tag = 'section', ...props }) {
  return (
    <Tag className={`cw-panel ${className}`} {...props}>
      {(title || actions) && (
        <div className="cw-panel__head">
          {title && <h2 className="cw-panel__title">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </Tag>
  )
}

export function StatTile({ value, label, status, pressed, onClick }) {
  return (
    <button
      type="button" className="cw-stat" aria-pressed={pressed} onClick={onClick}
      style={status ? { '--dot': `var(--status-${status})` } : undefined}
    >
      <span className="cw-stat__value">{value}</span>
      <span className="cw-stat__label">{label}</span>
    </button>
  )
}

export function ActivityList({ items, limit = 5, empty }) {
  if (!items.length) return <div className="empty">{empty}</div>
  return (
    <div className="cw-activity">
      {items.slice(0, limit).map(a => (
        <div key={a.id} className={`cw-activity__item${a.fresh ? ' fresh' : ''}`}>
          <Avatar initials={a.initials} tone={a.who === AGENT.name ? 'agent' : a.ai ? 'team' : undefined} />
          <div>
            <p className="cw-activity__text"><b>{a.who}</b> {a.text}</p>
            <span className="cw-activity__time">{a.when}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/** tabs: [key, label, count?][] */
export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="cw-tabs" role="tablist" aria-label={label}>
      {tabs.map(([key, text, count]) => (
        <button key={key} type="button" role="tab" className="cw-tab" aria-selected={value === key} onClick={() => onChange(key)}>
          {text}
          {count !== undefined && <span className="cw-count">{count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Field({ id, label, error, hint, children }) {
  return (
    <div className={`cw-field${error ? ' cw-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="cw-hint">{hint}</span>}
      {error && (
        <span className="cw-error" id={`${id}-err`}>
          <CircleAlert size={14} aria-hidden="true" />{error}
        </span>
      )}
    </div>
  )
}
