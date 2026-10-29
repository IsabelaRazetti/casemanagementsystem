import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { STATE_VERSION, seed } from './state/data.js'
import { reducer } from './state/reducer.js'
import NavRail from './components/NavRail.jsx'
import UtilityBar from './components/UtilityBar.jsx'
import Toast from './components/Toast.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Cases from './pages/Cases.jsx'
import CustomerWorkspace from './pages/CustomerWorkspace.jsx'

const STORAGE_KEY = 'sb-case-manager'
const ROUTES = ['dashboard', 'cases', 'customer']

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.version === STATE_VERSION) return saved
  } catch {
    // Storage blocked or corrupted: start from the sample data.
  }
  return seed()
}

function routeFromHash() {
  const h = window.location.hash.slice(1)
  return ROUTES.includes(h) ? h : 'dashboard'
}

/** Re-renders once a second while a call is live so timers tick. */
function useNow(active) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [active])
  return now
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [route, setRoute] = useState(routeFromHash)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef()
  const viewRef = useRef()
  const now = useNow(state.call.state === 'active')

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash())
      viewRef.current?.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback(r => { window.location.hash = r }, [])

  const notify = useCallback(message => {
    setToast({ message, id: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  const props = { state, dispatch, notify, go, now }

  return (
    <div className="app">
      <NavRail route={route} />
      <div className="workspace">
        <UtilityBar {...props} />
        <main className="view" ref={viewRef} tabIndex={-1}>
          {route === 'cases' && <Cases {...props} />}
          {route === 'customer' && <CustomerWorkspace key={state.currentCustomer} {...props} />}
          {route === 'dashboard' && <Dashboard {...props} />}
        </main>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} />}
    </div>
  )
}
