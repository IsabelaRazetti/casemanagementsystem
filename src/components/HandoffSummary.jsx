import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Lightbulb, MessageSquareText, Phone, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react'
import { getHandoffSummary } from '../ai/assistant.js'
import { CaseTypeTag, Data } from './ui.jsx'

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Plays the customer's conversation with the virtual assistant, then asks for the
 * handoff summary. Calls onHandoff(summary) when the contact is ready for an agent.
 */
function useIvrConversation(scenario, active, onHandoff) {
  const [shown, setShown] = useState(active ? 0 : scenario.transcript.length)
  const [writing, setWriting] = useState(false)
  const handoffRef = useRef(onHandoff)
  handoffRef.current = onHandoff

  useEffect(() => {
    if (!active) { setShown(scenario.transcript.length); return }
    let cancelled = false
    const total = scenario.transcript.length
    const step = reducedMotion() ? 0 : 850
    let i = 0
    setShown(0)
    setWriting(false)
    const tick = () => {
      if (cancelled) return
      i += 1
      setShown(i)
      if (i < total) { timer = setTimeout(tick, step); return }
      setWriting(true)
      getHandoffSummary(scenario.id, { delay: step ? 1400 : 0 })
        .then(summary => { if (!cancelled) handoffRef.current(summary) })
        .catch(() => { if (!cancelled) setWriting(false) })
    }
    let timer = setTimeout(tick, step ? 500 : 0)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [scenario, active])

  return { shown, writing }
}

function Transcript({ messages, live }) {
  const ref = useRef()
  useEffect(() => { if (live) ref.current?.scrollTo({ top: ref.current.scrollHeight }) }, [messages.length, live])
  return (
    <div className="cw-ivr-log" ref={ref} aria-live={live ? 'polite' : undefined}>
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
  const { shown, writing } = useIvrConversation(scenario, inIvr, onHandoff)
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const ChannelIcon = scenario.channel === 'sms' ? MessageSquareText : Phone

  return (
    <section className="cw-handoff" aria-label="Virtual assistant summary">
      <header className="cw-handoff__head">
        <span className="cw-handoff__title"><Sparkles aria-hidden="true" />Virtual assistant</span>
        <span className="cw-tag"><ChannelIcon size={12} aria-hidden="true" style={{ marginRight: 4 }} />{scenario.channel === 'sms' ? 'SMS' : 'Phone'}</span>
      </header>

      {inIvr && (
        <>
          <p className="cw-handoff__status">
            <span className="cw-live" />
            {writing ? 'Writing a summary for you…' : 'The customer is talking to the virtual assistant.'}
          </p>
          <Transcript messages={scenario.transcript.slice(0, shown)} live />
          {writing && (
            <div className="cw-handoff__skeleton" aria-hidden="true"><span /><span /><span /></div>
          )}
        </>
      )}

      {!inIvr && summary && (
        <>
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
        </>
      )}
    </section>
  )
}
