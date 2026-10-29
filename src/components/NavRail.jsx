import { BriefcaseBusiness, ContactRound, MessageCircle } from 'lucide-react'

const LINKS = [
  ['dashboard', 'Dashboard', MessageCircle],
  ['cases', 'My cases', BriefcaseBusiness],
  ['customer', 'Customer workspace', ContactRound],
]

export default function NavRail({ route }) {
  return (
    <aside className="rail" aria-label="Main">
      <div className="mark" aria-label="Simply Business">SB</div>
      <nav>
        {LINKS.map(([key, label, Icon]) => (
          <a key={key} href={`#${key}`} aria-current={route === key ? 'page' : undefined}>
            <Icon aria-hidden="true" />
            <span className="tip">{label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
