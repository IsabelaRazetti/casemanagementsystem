// All people, companies and policies below are fictional sample data for the prototype.

export const AGENT = { name: 'Anna Montoya', initials: 'AM', color: '#63759a' }

export const CUSTOMERS = {
  mm: {
    id: 'mm', name: 'Marina Madrigal', title: 'Ms', initials: 'MM', color: '#5e7098', taskColor: '#243252',
    queue: 'Sales', direction: 'IB', note: '00:30',
    email: 'hi@marinamadrigal.com', company: 'Marinamadrigal ltd',
    address: '99 Greshall st, London, W1K3B', phone: '(44) 1987 657 792',
    policies: [{ num: 'SME012345678', product: 'Tradesman liability', status: 'Active', renews: '08/08/2027' }],
    rfqs: [
      { num: 'RFQ-88310', product: 'Professional indemnity', when: 'Quoted 2 days ago' },
      { num: 'RFQ-88291', product: 'Portable equipment', when: 'Quoted last week' },
    ],
    docs: ['Certificate of insurance', 'Policy Schedule', 'Invoice', 'Terms of business'],
  },
  pc: {
    id: 'pc', name: 'Peter Coll', title: 'Mr', initials: 'PC', color: '#b82977', taskColor: '#e51b78',
    queue: 'Retention', direction: 'OB', note: 'Policy cancellation',
    email: 'peter@collplumbing.co.uk', company: 'Coll Plumbing & Heating',
    address: '14 Ashby Rd, Leeds, LS6 2BD', phone: '(44) 113 496 0128',
    policies: [{ num: 'SME019876543', product: 'Public liability', status: 'Cancellation requested', renews: '02/03/2027' }],
    rfqs: [{ num: 'RFQ-87102', product: 'Van insurance', when: 'Quoted 3 weeks ago' }],
    docs: ['Certificate of insurance', 'Policy Schedule', 'Cancellation request'],
  },
  jg: {
    id: 'jg', name: 'Joe Gamble', title: 'Mr', initials: 'JG', color: '#46682d', taskColor: '#4f762e',
    queue: 'Renewals', direction: 'OB', note: '00:30',
    email: 'joe@gamblecafe.co.uk', company: "Gamble's Café",
    address: '3 Market Row, Bristol, BS1 1LN', phone: '(44) 117 496 0743',
    policies: [{ num: 'SME015550912', product: 'Shop & café cover', status: 'Renewal due', renews: '14/11/2026' }],
    rfqs: [],
    docs: ['Certificate of insurance', 'Renewal invitation', 'Terms of business'],
  },
}

export const TASK_ORDER = ['mm', 'pc', 'jg']

export const TEAMS = [
  ['tech', 'TC', '#dc1674'], ['team-manager', 'TM', '#243252'], ['bizops', 'BO', '#477329'],
  ['compliance', 'CO', '#c6ad36'], ['peopleops', 'PO', '#a3add2'], ['connect-support', 'CS', '#b82977'],
  ['my-team', 'MT', '#46682d'],
].map(([name, initials, color]) => ({ name, initials, color }))

export const TYPE_COLOR = { Referral: '#4f762e', Cancellation: '#e51b78', Renewal: '#23a4aa', Claim: '#c6ad36' }

export const STATUS = {
  new: { label: 'New', color: '#e91c5e' },
  progress: { label: 'In progress', color: '#4b752c' },
  done: { label: 'Done', color: '#3975b0' },
}

export const REASONS = [
  'Details of dry cleaning activities and chemicals stored',
  'Claims history for the last 5 years',
  'Proof of annual turnover (latest accounts)',
  'Portable appliance testing certificate',
]

export const NEWS = [
  ['Simply Business named a Best Workplace for the fifth year', 'linear-gradient(135deg,#7b3fa0,#e51b78)'],
  ['Continuous Cover now live for all tradesman policies', 'linear-gradient(135deg,#2c3e78,#b82977)'],
  ['Bristol hub opens new quiet booths for calls', 'linear-gradient(135deg,#9a2f7c,#e86aa7)'],
  ['Customer satisfaction up 6 points this quarter', 'linear-gradient(135deg,#4a3a8c,#c74d9b)'],
]

export const STATE_VERSION = 1

let uid = 0
export const nextId = () => `a${Date.now().toString(36)}${(uid++).toString(36)}`

export function seed() {
  return {
    version: STATE_VERSION,
    presence: 'Available',
    call: { state: 'ringing', customer: 'mm', start: 0, total: 0 },
    metrics: { calls: 0, emails: 0, chats: 0, support: 0 },
    currentCustomer: 'mm',
    filter: null,
    openCase: 'C-1042',
    caseTab: 'tasks',
    recordTab: 'info',
    channel: 'email',
    chat: { team: null, msgs: [] },
    cases: [
      {
        id: 'C-1042', type: 'Referral', title: 'New Business · Business referral', status: 'new', customer: 'mm',
        by: 'Martin Colleman Perez', byInitials: 'MP', channel: 'Inbound', expiry: '08/08/2027', policy: 'SME012345678',
        task: {
          title: 'Review referral case', assignee: 'Martin Perez Diazgranados', lead: 'Tradesmen & dry cleaners.',
          body: 'This is a referral for AB010564381, Martin Colleman Perez, Risk management and Portable appliance testing.',
          facts: [['Years trading', '1-2 years'], ['Business type', 'Sole trader'], ['Annual turnover', '£250,000'],
            ['Public liability', '£2,000,000'], ['Professional indemnity', '£1,000,000'], ['Reasons for referral', 'Business activities']],
          trigger: 'Dry cleaning is outside the automatic acceptance list for tradesman policies, so an underwriter must confirm which chemicals are stored on site before cover starts.',
        },
      },
      {
        id: 'C-1043', type: 'Cancellation', title: 'Mid-term adjustment · Policy cancellation', status: 'new', customer: 'pc',
        by: 'Peter Coll', byInitials: 'PC', channel: 'Phone', expiry: '02/03/2027', policy: 'SME019876543',
        task: {
          title: 'Process cancellation request', assignee: 'Anna Montoya', lead: 'Plumbing & heating.',
          body: 'The customer has sold his van and is retiring at the end of the year. He asked to cancel his public liability policy from 30/11/2026.',
          facts: [['Years trading', '12 years'], ['Business type', 'Sole trader'], ['Premium paid', '£412.60 annual'],
            ['Refund estimate', '£103.15 pro rata'], ['Reasons for case', 'Business closing']],
          trigger: 'Cancellations with a refund over £100 need an agent to offer a retention option before processing.',
        },
      },
      {
        id: 'C-1044', type: 'Referral', title: 'New Business · Professional indemnity referral', status: 'new', customer: 'mm',
        by: 'Marina Madrigal', byInitials: 'MM', channel: 'Web', expiry: '—', policy: 'RFQ-88310',
        task: {
          title: 'Review PI limit', assignee: 'Anna Montoya', lead: 'Consultancy add-on.',
          body: 'Quote requested with a £5,000,000 professional indemnity limit, above the online maximum.',
          facts: [['Requested limit', '£5,000,000'], ['Online maximum', '£2,000,000'], ['Reasons for referral', 'Limit above appetite']],
          trigger: 'Limits above £2m are referred to the underwriting team automatically.',
        },
      },
      {
        id: 'C-1039', type: 'Renewal', title: 'Renewal · Continuous Cover conversion', status: 'progress', customer: 'jg',
        by: 'Dan Colleman', byInitials: 'DC', channel: 'Outbound', expiry: '14/11/2026', policy: 'SME015550912',
        task: {
          title: 'Confirm renewal terms', assignee: 'Dan Colleman', lead: 'Shop & café cover.',
          body: 'Customer agreed in principle to move to Continuous Cover. Waiting for updated seating capacity before re-quoting.',
          facts: [['Renewal premium', '£689.00'], ['Change', '+4.1% on last year'], ['Outstanding', 'Seating capacity']],
          trigger: 'A premium change above 3% triggers a renewal call.',
        },
      },
      {
        id: 'C-1031', type: 'Claim', title: 'Claims · Water damage notification', status: 'progress', customer: 'pc',
        by: 'Marina Madrigal', byInitials: 'MM', channel: 'Email', expiry: '02/03/2027', policy: 'SME019876543',
        task: {
          title: 'Pass notification to claims partner', assignee: 'Marina Madrigal', lead: 'Third-party property.',
          body: "Customer reported a leak at a client's kitchen after a boiler install. Photos received, insurer reference pending.",
          facts: [['Date of incident', '21/10/2026'], ['Estimated cost', '£2,400'], ['Insurer ref', 'Pending']],
          trigger: 'All claim notifications are logged as cases for tracking.',
        },
      },
    ],
    activity: [
      { id: 's1', who: 'Dan Colleman', initials: 'DC', text: 'added a new note “Continuous Cover policy conversion successful”', when: '1h ago', customer: 'jg' },
      { id: 's2', who: 'Marina Madrigal', initials: 'MM', text: 'sent a new email to the customer', when: '1h ago', customer: 'pc' },
      { id: 's3', who: 'Milton Miller', initials: 'MM', text: 'closed the Coco opt out case', when: '1h ago', customer: null },
      { id: 's4', who: 'Dan Colleman', initials: 'DC', text: 'emailed the Policy schedule and Invoice documents', when: 'Yesterday', customer: 'mm' },
      { id: 's5', who: 'Dan Colleman', initials: 'DC', text: 'updated the customer information details', when: '5 March 10:00', customer: 'mm' },
      { id: 's6', who: 'Dan Colleman', initials: 'DC', text: 'confirmed the customer renewal', when: '5 March 09:00', customer: 'mm' },
    ],
  }
}
