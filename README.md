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
| Styling | Plain CSS with design tokens from Figma | Colours, spacing and type match the designs exactly |

```
src/
  state/        data.js (sample data), reducer.js (all state changes), reducer.test.js
  components/   NavRail, UtilityBar, DocModal, Toast, shared ui pieces
  pages/        Dashboard, Cases, CustomerWorkspace
```

## Accessibility

Keyboard reachable controls with visible focus, labelled icon buttons, tabs with `aria-selected`, form errors that explain how to fix the problem, and reduced motion respected.

## What I would do next

- A real backend (cases, customers, audit log) with authentication and role-based access.
- SLA timers on each case and an escalation path when they are breached.
- Telephony integration instead of the simulated call.
- GDPR: data retention rules, redaction of personal data in notes, and an audit trail of who viewed a customer record.
- End-to-end tests (Playwright) for the main demo flow.
