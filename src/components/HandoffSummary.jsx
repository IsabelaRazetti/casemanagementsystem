import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Lightbulb, MessageSquareText, Phone, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react'
import { getHandoffSummary } from '../ai/assistant.js'
import { CaseTypeTag, Data } from './ui.jsx'

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * While the customer is with the virtual assistant the agent sees nothing of the
 * conversation. When the assistant hands over, the full summary arrives at once.
 * Calls onHandoff(summary) when the contact is ready for an agent.
 */
function useAssistantHandoff(scenario, active, onHandoff) {
  const handoffRef = useRef(onHandoff)
  handoffRef.current = onHandoff

  useEffect(() => {
    if (!active) return
    let cancelled = false
    // Simulated time the customer spends with the assistant before the handoff.
    getHandoffSummary(scenario.id, { delay: reducedMotion() ? 0 : 3000 })
      .then(summary => { if (!cancelled) handoffRef.current(summary) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [scenario, active])
}

function Transcript({ messages }) {
  return (
    <div className="cw-ivr-log">
      {messages.map((m, i) => (
        <div key={i} className={`cw-ivr-msg cw-ivr-msg--${m.from}`}>
          <span className="cw-ivr-msg__who">{m.from === 'bot' ? 'Assistant' : 'Customer'}</span>
          <p>{m.text}</p>
        </div>
      ))}
    </div>
  )
}

export default function HandoffSummary({ scenario, stage, summary, onHandoff }) {
  const inIvr = stage === 'ivr'
  useAssistantHandoff(scenario, inIvr, onHandoff)
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const ChannelIcon = scenario.channel === 'sms' ? MessageSquareText : Phone
  if (inIvr || !summary) return null

  return (
    <section className="cw-handoff" aria-label="Virtual assistant summary">
      <header className="cw-handoff__head">
        <span className="cw-handoff__title"><Sparkles aria-hidden="true" />Virtual assistant</span>
        <span className="cw-tag"><ChannelIcon size={12} aria-hidden="true" style={{ marginRight: 4 }} />{scenario.channel === 'sms' ? 'SMS' : 'Phone'}</span>
      </header>

      <p className="cw-handoff__headline">{summary.headline}</p>
      <div className="cw-handoff__chips">
        <CaseTypeTag type={summary.intent} />
        <span className={`cw-tag cw-handoff__sentiment cw-handoff__sentiment--${summary.sentiment.toLowerCase()}`}>{summary.sentiment}</span>
        {summary.caseId && <span className="cw-tag">Case <Data>{summary.caseId}</Data></span>}
      </div>
      <p className={`cw-handoff__verified${summary.verified ? '' : ' cw-handoff__verified--no'}`}>
        {summary.verified ? <ShieldCheck aria-hidden="true" /> : <ShieldAlert aria-hidden="true" />}
        {summary.verified ? `Verified · ${summary.verifiedBy}` : 'Not verified. Check identity before sharing policy details.'}
      </p>
      <dl className="cw-handoff__facts">
        {summary.captured.map(([k, v]) => [<dt key={k}>{k}</dt>, <dd key={k + 'v'}>{v}</dd>])}
      </dl>
      <div className="cw-handoff__next">
        <Lightbulb aria-hidden="true" />
        <div><b>Suggested next step</b><p>{summary.nextStep}</p></div>
      </div>
      <button type="button" className="cw-handoff__toggle" aria-expanded={transcriptOpen} onClick={() => setTranscriptOpen(o => !o)}>
        {transcriptOpen ? 'Hide' : 'Show'} conversation ({scenario.transcript.length} messages)
        <ChevronDown aria-hidden="true" />
      </button>
      {transcriptOpen && <Transcript messages={scenario.transcript} />}
      <p className="cw-handoff__note">AI-generated from the customer’s conversation with the assistant. Check it before you act.</p>
    </section>
  )
}
