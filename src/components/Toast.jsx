import { Check } from 'lucide-react'

export default function Toast({ message }) {
  return (
    <div className="toast" role="status">
      <Check size={18} aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
