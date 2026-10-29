import { BriefcaseBusiness, ContactRound, LayoutDashboard } from 'lucide-react'

const LINKS = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['cases', 'My cases', BriefcaseBusiness],
  ['customer', 'Customer workspace', ContactRound],
]

export default function NavRail({ route }) {
  return (
    <aside className="rail" aria-label="Main">
      <div className="rail__mark" aria-label="Simply Business">SB</div>
      <nav>
        {LINKS.map(([key, label, Icon]) => (
          <a key={key} href={`#${key}`} aria-label={label} aria-current={route === key ? 'page' : undefined}>
            <Icon aria-hidden="true" />
            <span className="tip" aria-hidden="true">{label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
