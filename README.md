# SB Case Manager

An interactive prototype of a case management system for Simply Business contact-centre agents. It turns three Figma screens (agent dashboard, case review and customer workspace) into a working React app that can be demoed end to end.

> All customers, policies and people in the app are fictional sample data.

## The problem

Agents who handle referrals, cancellations and renewals jump between a phone system, an email client, the policy admin system and a shared inbox. Context gets lost between tools, and nobody can see at a glance which cases are waiting on them.

This prototype puts the case, the customer and the conversation on one screen:

- **Dashboard**: today's schedule, open cases, team news, support chat with internal teams and the agent's daily metrics.
- **My Cases**: case totals by status, a referral review flow with the underwriting facts, and the two outcomes an agent actually needs: *request more information* or *complete*.
- **Customer workspace**: the live call, an email, chat and note composer, and the customer's policies, quotes, documents and history.

## Demo flow (about 3 minutes)

1. On the dashboard, show the open case count and click **View**.
2. Open the business referral, read the facts, expand **What triggered the referral?**
3. Pick a reason from **Request more information** and send it. The case moves to *In progress* and the totals update.
4. Search `SME012345678` in the top bar to jump to the customer.
5. Answer Marina's incoming call. The call timer runs in the top bar.
6. Apply the renewal template to the email, open the *Policy Schedule* document, attach it and send.
7. End the call. Back on the dashboard, the activity log and metrics show everything you just did.

Use **Reset demo data** in the user menu (top right) to start again.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # unit tests for the state logic
npm run build   # production build in dist/
```

Requires Node 18 or later.

## How it's built

| Area | Choice | Why |
| --- | --- | --- |
| UI | React 18 + Vite | Fast to iterate, simple to deploy as a static site |
| State | One `useReducer` in `src/state/reducer.js` | Every agent action goes through one pure function, so it is easy to test and every action is logged to the activity history in one place |
| Persistence | `localStorage` | The demo survives a page refresh without a backend |
| Routing | URL hash (`#dashboard`, `#cases`, `#customer`) | Shareable links to each screen with no router dependency |
| Icons | `lucide-react` | Same icon set used in the Figma file |
| Styling | Casework design system: CSS custom properties (tokens) + component classes | One source for every colour, size and radius; light and dark themes for free |

```
src/
  state/        data.js (sample data), reducer.js (all state changes), reducer.test.js
  styles/       tokens.css (design tokens), components.css (Casework components), app.css (layout)
  components/   ui.jsx (Casework components in React), NavRail, UtilityBar, DocModal, Toast
  pages/        Dashboard, Cases, CustomerWorkspace
```

## AI: virtual assistant handoff

Before a call or SMS reaches an agent, a virtual assistant (the IVR) verifies the customer, asks what they need and captures the key details. The agent then sees a summary **before answering**: what the customer wants in one sentence, how they were verified, what they already said, their sentiment, the linked case and a suggested next step. The full conversation is one click away.

When the agent answers, the summary goes into the activity log and the linked case opens, so nobody asks the customer to repeat themselves.

Try it with **Simulate contact** in the top bar: a referral call, a cancellation call and an SMS about a renewal price.

**Prototype vs production.** In this prototype the summaries are written in advance (`src/ai/assistant.js`) so the demo always works. To make it real, replace `getHandoffSummary` with a call to a server route (for example a Vercel function) that sends the transcript to Claude and returns the same shape. The API key stays on the server.

**Guardrails built into the design**
- The assistant suggests; the agent decides. Nothing happens automatically.
- Every summary is labelled as AI-generated and shows the conversation it came from.
- Policy details are only discussed once the customer is verified, and the summary says how.

## Design system: Casework

The UI is built on **Casework**, a small design system made for this product.

- **Tokens** (`src/styles/tokens.css`): 23 colour tokens with light and dark values, a 4px spacing scale, four radii and two shadows. Nothing in the app uses a raw colour or size.
- **Type**: Geist for the interface in six steps, and Geist Mono for anything an agent reads out or copies (policy numbers, case IDs, premiums, call timers).
- **Components** (`src/components/ui.jsx` + `src/styles/components.css`): Button, Avatar, StatusBadge, CaseTypeTag, Field, Tabs, Panel, StatTile, ActivityItem, CallControls and Toast.
- **Rules**: one accent colour reserved for the main action; case status always shown with a word and a dot, never colour alone; every text colour meets WCAG AA contrast in both themes; visible keyboard focus everywhere.

The full documentation (tokens, voice and tone, and a live preview of every component) lives in the Casework design system page.

## Accessibility

Keyboard reachable controls with visible focus, labelled icon buttons, tabs with `aria-selected`, form errors that explain how to fix the problem, and reduced motion respected.

## What I would do next

- A real backend (cases, customers, audit log) with authentication and role-based access.
- SLA timers on each case and an escalation path when they are breached.
- Telephony integration instead of the simulated call.
- GDPR: data retention rules, redaction of personal data in notes, and an audit trail of who viewed a customer record.
- End-to-end tests (Playwright) for the main demo flow.
