import { useEffect } from 'react'
import { Paperclip, X } from 'lucide-react'

export default function DocModal({ doc, customer, onClose, onAttach }) {
  const policy = customer.policies[0]
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={doc} onClick={e => e.stopPropagation()}>
        <header>
          <h2>{doc}</h2>
          <button className="collapse" aria-label="Close" onClick={onClose} autoFocus><X size={18} /></button>
        </header>
        <div className="paper">
          <div className="sbh"><span>Simply Business · sample document</span><span>{policy.num}</span></div>
          <b>{doc}</b>
          <span>Policyholder: {customer.company}</span>
          <span>Contact: {customer.title} {customer.name}</span>
          <span>Cover: {policy.product}</span>
          <span>Renewal date: {policy.renews}</span>
          <span style={{ color: 'var(--muted)' }}>This is placeholder content for the prototype.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button className="btn btn-pink" onClick={onAttach}><Paperclip size={14} aria-hidden="true" /> Attach to email</button>
        </div>
      </div>
    </div>
  )
}
