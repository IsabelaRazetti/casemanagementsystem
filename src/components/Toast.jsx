import { Check } from 'lucide-react'

export default function Toast({ message }) {
  return (
    <div className="toast-wrap">
      <div className="cw-toast" role="status">
        <Check aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  )
}
