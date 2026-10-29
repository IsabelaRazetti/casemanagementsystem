// Demo contacts that go through the virtual assistant (IVR) before reaching an agent.
// All people and details are fictional. Each scenario holds the conversation the
// customer has with the assistant; the handoff summary is produced by src/ai/assistant.js.

export const SCENARIOS = {
  'mm-referral': {
    id: 'mm-referral',
    label: 'Call · referral on hold',
    channel: 'call',
    customer: 'mm',
    caseId: 'C-1042',
    transcript: [
      { from: 'bot', text: 'Hi, you’re through to Simply Business. I’m the virtual assistant. Can I take your policy number or postcode?' },
      { from: 'customer', text: 'It’s SME012345678.' },
      { from: 'bot', text: 'Thanks. For security, can you confirm the first line of your business address?' },
      { from: 'customer', text: '99 Greshall Street.' },
      { from: 'bot', text: 'Thank you, you’re verified. How can I help today?' },
      { from: 'customer', text: 'I added dry cleaning to my business and now my quote says it’s been referred. I need cover to start on Monday.' },
      { from: 'bot', text: 'I can see that referral. Do you store any cleaning chemicals on site?' },
      { from: 'customer', text: 'Yes, a small amount of solvent in a locked cabinet.' },
      { from: 'bot', text: 'Thanks. I’m passing you to an agent who can finish the review with you.' },
    ],
  },
  'pc-cancel': {
    id: 'pc-cancel',
    label: 'Call · policy cancellation',
    channel: 'call',
    customer: 'pc',
    caseId: 'C-1043',
    transcript: [
      { from: 'bot', text: 'Hi, you’re through to Simply Business. I’m the virtual assistant. Can I take your policy number or postcode?' },
      { from: 'customer', text: 'LS6 2BD.' },
      { from: 'bot', text: 'Thanks. Can you confirm your date of birth?' },
      { from: 'customer', text: '14th of May 1961.' },
      { from: 'bot', text: 'Thank you, you’re verified, Mr Coll. What would you like to do today?' },
      { from: 'customer', text: 'I want to cancel my public liability. I’ve sold the van and I’m retiring at the end of November.' },
      { from: 'bot', text: 'Sorry to hear you’re closing the business. From which date would you like the cancellation?' },
      { from: 'customer', text: 'The 30th of November. Will I get anything back?' },
      { from: 'bot', text: 'An agent will confirm your refund and the next steps. Connecting you now.' },
    ],
  },
  'jg-renewal': {
    id: 'jg-renewal',
    label: 'SMS · renewal price',
    channel: 'sms',
    customer: 'jg',
    caseId: 'C-1039',
    transcript: [
      { from: 'customer', text: 'Hi my renewal went up again?? Why is it more this year' },
      { from: 'bot', text: 'Hi, this is the Simply Business virtual assistant. I can help with that. Can you reply with your policy number?' },
      { from: 'customer', text: 'SME015550912' },
      { from: 'bot', text: 'Thanks. To confirm it’s you, what’s the postcode of your café?' },
      { from: 'customer', text: 'BS1 1LN' },
      { from: 'bot', text: 'Thanks, you’re verified. Your renewal is due on 14/11/2026. Has anything changed in the business this year?' },
      { from: 'customer', text: 'We added 10 more seats outside. Still don’t see why it’s 4% more. Might shop around' },
      { from: 'bot', text: 'Thanks for telling me. I’m passing this to an agent who can go through your price with you.' },
    ],
  },
}

export const SCENARIO_ORDER = ['mm-referral', 'pc-cancel', 'jg-renewal']
