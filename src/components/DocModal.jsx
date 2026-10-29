import { useEffect } from 'react'
import { Paperclip, X } from 'lucide-react'
import { Button, Data, Panel } from './ui.jsx'

export default function DocModal({ doc, customer, onClose, onAttach }) {
  const policy = customer.policies[0]
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="scrim" onClick={onClose}>
      <Panel
        as="div" className="modal" role="dialog" aria-modal="true" aria-label={doc} title={doc}
        onClick={e => e.stopPropagation()}
        actions={<Button variant="ghost" iconOnly icon={X} aria-label="Close" title="Close" onClick={onClose} autoFocus />}
      >
        <div className="paper">
          <div className="paper__head"><span>Sample document</span><Data>{policy.num}</Data></div>
          <b style={{ fontWeight: 600 }}>{doc}</b>
          <span>Policyholder: {customer.company}</span>
          <span>Contact: {customer.title} {customer.name}</span>
          <span>Cover: {policy.product}</span>
          <span>Renewal date: <Data>{policy.renews}</Data></span>
          <span className="cw-muted">Placeholder content for the prototype.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary" icon={Paperclip} onClick={onAttach}>Attach to email</Button>
        </div>
      </Panel>
    </div>
  )
}
