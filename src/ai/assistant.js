// The virtual assistant's handoff summary.
//
// In this prototype the summaries are written in advance so the demo always works.
// To make it real, replace `getHandoffSummary` with a call to your own API route,
// e.g. a Vercel function that sends the transcript to Claude and returns the same shape:
//
//   const res = await fetch('/api/handoff-summary', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ transcript, customerId }),
//   })
//   return res.json()
//
// Keep the API key on the server: never call the model directly from the browser.

/**
 * @typedef {Object} HandoffSummary
 * @property {string} intent        Case type the assistant detected (Referral, Cancellation, Renewal, Claim)
 * @property {string} headline      One sentence the agent can read before answering
 * @property {boolean} verified     Whether the customer passed identity checks
 * @property {string} verifiedBy    How they were verified
 * @property {Array<[string,string]>} captured  Facts the customer already gave
 * @property {'Calm'|'Frustrated'|'Urgent'} sentiment
 * @property {string} nextStep      Suggested next step for the agent (a suggestion, never a decision)
 * @property {string} [caseId]      Existing case the contact relates to
 */

const SUMMARIES = {
  'mm-referral': {
    intent: 'Referral',
    headline: 'Wants her referred quote approved so cover can start on Monday.',
    verified: true,
    verifiedBy: 'Policy number and business address',
    captured: [
      ['New activity', 'Dry cleaning'],
      ['Chemicals on site', 'Small amount of solvent, locked cabinet'],
      ['Needs cover from', 'Monday'],
    ],
    sentiment: 'Urgent',
    nextStep: 'Confirm the solvent type and quantity, then complete the referral review on C-1042.',
    caseId: 'C-1042',
  },
  'pc-cancel': {
    intent: 'Cancellation',
    headline: 'Wants to cancel his public liability from 30/11/2026 because he is retiring.',
    verified: true,
    verifiedBy: 'Postcode and date of birth',
    captured: [
      ['Reason', 'Retiring, van sold'],
      ['Cancel from', '30/11/2026'],
      ['Asked about', 'Refund'],
    ],
    sentiment: 'Calm',
    nextStep: 'Refund estimate is £103.15. Policy rules ask you to offer a retention option before cancelling.',
    caseId: 'C-1043',
  },
  'jg-renewal': {
    intent: 'Renewal',
    headline: 'Unhappy with a 4.1% renewal increase and thinking of shopping around.',
    verified: true,
    verifiedBy: 'Policy number and postcode',
    captured: [
      ['Change this year', '10 extra outdoor seats'],
      ['Renewal date', '14/11/2026'],
      ['Risk', 'May not renew'],
    ],
    sentiment: 'Frustrated',
    nextStep: 'Explain the increase comes from the added seating, then re-quote with the updated capacity on C-1039.',
    caseId: 'C-1039',
  },
}

/** Returns the summary the assistant hands to the agent. Simulated latency included. */
export function getHandoffSummary(scenarioId, { delay = 1200 } = {}) {
  return new Promise((resolve, reject) => {
    const summary = SUMMARIES[scenarioId]
    if (!summary) return reject(new Error(`No summary for ${scenarioId}`))
    setTimeout(() => resolve(summary), delay)
  })
}

/** Synchronous access for state that is restored after a page reload. */
export const cachedSummary = id => SUMMARIES[id] ?? null
