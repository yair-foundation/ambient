/**
 * ClientOps fictional data. Every name, company and number here is invented.
 * Both lead-triage directions read this module; neither carries its own copy.
 */

/** The fixed "now" of the prototype, so SLA clocks are stable across reviews. */
export const NOW = Date.parse("2026-10-15T09:00:00Z")
const h = (hoursAgo: number) => new Date(NOW - hoursAgo * 3_600_000).toISOString()

export const CURRENT_USER = { id: "u-sam", name: "Sam Rivera", role: "Account manager" }

export type LeadSource =
  | "Demo request"
  | "Webinar"
  | "Partner referral"
  | "Outbound reply"
  | "Trade show"

export type Budget = "<$10k" | "$10–50k" | "$50k+"
export type Timeline = "This quarter" | "Next quarter" | "Exploring"

/** Where a lead stands in triage. `new` means nobody has decided anything yet. */
export type LeadStatus =
  | "new"
  | "info_requested"
  | "qualified"
  | "nurture"
  | "disqualified"

export interface ExistingAccountRef {
  accountId: string
  name: string
  owner: string
}

export interface Lead {
  id: string
  company: string
  industry: string
  region: string
  contact: { name: string; role: string; email: string }
  source: LeadSource
  receivedAt: string
  message: string
  estValue: number
  teamSize?: number
  budget?: Budget
  timeline?: Timeline
  decisionMakerConfirmed?: boolean
  /** A possible duplicate of an account ClientOps already holds. */
  duplicateOf?: ExistingAccountRef
  /** The account manager confirmed how the duplicate is handled. */
  duplicateResolved?: boolean
  status: LeadStatus
  owner?: string
  /** Set when status is `nurture`. */
  revisitOn?: string
  /** Set when status is `disqualified`. */
  reason?: string
}

export const REGIONS_SUPPORTED_PREFIXES = ["US", "Canada", "UK", "EU"]

export const SEED_LEADS: Lead[] = [
  {
    id: "L-2041",
    company: "Northwind Freight",
    industry: "Logistics",
    region: "US-East",
    contact: { name: "Maya Okafor", role: "Director of Operations", email: "maya.okafor@northwindfreight.example" },
    source: "Demo request",
    receivedAt: h(1.5),
    message: "We run 45 dispatchers across three depots and lose track of renewals in spreadsheets. Can we see a demo this week?",
    estValue: 62000,
    teamSize: 45,
    budget: "$50k+",
    timeline: "This quarter",
    decisionMakerConfirmed: true,
    status: "new",
  },
  {
    id: "L-2042",
    company: "Lumen Dental Group",
    industry: "Healthcare",
    region: "US-West",
    contact: { name: "Priya Raman", role: "Practice Manager", email: "priya@lumendental.example" },
    source: "Webinar",
    receivedAt: h(7),
    message: "Attended your webinar on patient follow-ups. We have 18 staff across 4 clinics.",
    estValue: 28000,
    teamSize: 18,
    timeline: "Next quarter",
    status: "new",
  },
  {
    id: "L-2043",
    company: "Orchard & Vale",
    industry: "Retail",
    region: "UK",
    contact: { name: "Tom Ellery", role: "Head of Customer Success", email: "tom.ellery@orchardvale.example" },
    source: "Partner referral",
    receivedAt: h(20),
    message: "Referred by Brightpath Partners. We want a single place for account notes across 120 staff.",
    estValue: 41000,
    teamSize: 120,
    budget: "$10–50k",
    timeline: "This quarter",
    duplicateOf: { accountId: "A-104", name: "Orchard Vale Ltd", owner: "Jules Park" },
    status: "new",
  },
  {
    id: "L-2044",
    company: "Kestrel Robotics",
    industry: "Manufacturing",
    region: "APAC (Singapore)",
    contact: { name: "Wei Lim", role: "VP Sales", email: "wei.lim@kestrelrobotics.example" },
    source: "Outbound reply",
    receivedAt: h(30),
    message: "Replied to your outreach. Our APAC sales team needs a CRM with local data residency.",
    estValue: 90000,
    teamSize: 60,
    budget: "$50k+",
    timeline: "This quarter",
    status: "new",
  },
  {
    id: "L-2045",
    company: "Bluebird Learning",
    industry: "Education",
    region: "US-East",
    contact: { name: "Jordan Hayes", role: "Founder", email: "jordan.hayes.learning@gmail.example" },
    source: "Trade show",
    receivedAt: h(52),
    message: "Met at EdTech Expo. Small team, curious about pricing.",
    estValue: 6000,
    teamSize: 8,
    budget: "<$10k",
    timeline: "Exploring",
    status: "new",
  },
  {
    id: "L-2046",
    company: "Fernhill Capital",
    industry: "Finance",
    region: "US-East",
    contact: { name: "Aaron Whitfield", role: "Managing Director", email: "a.whitfield@fernhillcapital.example" },
    source: "Demo request",
    receivedAt: h(9),
    message: "Requesting a demo. Please call me before Friday.",
    estValue: 120000,
    status: "new",
  },
  {
    id: "L-2047",
    company: "Saltmarsh Brewing",
    industry: "Food & beverage",
    region: "Canada",
    contact: { name: "Elise Tremblay", role: "Operations Lead", email: "elise@saltmarshbrewing.example" },
    source: "Webinar",
    receivedAt: h(26),
    message: "We want to track distributor accounts better. 30 staff, two sites.",
    estValue: 24000,
    teamSize: 30,
    budget: "$10–50k",
    timeline: "Next quarter",
    status: "new",
  },
  {
    id: "L-2048",
    company: "Polaris Telehealth",
    industry: "Healthcare",
    region: "US-West",
    contact: { name: "Dev Anand", role: "Director of Partnerships", email: "dev.anand@polaristelehealth.example" },
    source: "Partner referral",
    receivedAt: h(12),
    message: "Our partner team of 75 needs to coordinate referrals. Evaluating two vendors.",
    estValue: 88000,
    teamSize: 75,
    budget: "$50k+",
    timeline: "This quarter",
    status: "new",
  },
  {
    id: "L-2049",
    company: "Meridian Architects",
    industry: "Construction",
    region: "UK",
    contact: { name: "Grace Whitlow", role: "Studio Manager", email: "grace@meridianarchitects.example" },
    source: "Demo request",
    receivedAt: h(3),
    message: "Looking for a simple way to track client enquiries from first contact to proposal.",
    estValue: 19000,
    budget: "$10–50k",
    timeline: "This quarter",
    status: "new",
  },
  {
    id: "L-2050",
    company: "Quillbox Media",
    industry: "Media",
    region: "LATAM (Brazil)",
    contact: { name: "Rafael Souza", role: "Commercial Director", email: "rafael@quillboxmedia.example" },
    source: "Webinar",
    receivedAt: h(70),
    message: "Interested in your sponsorship tracking features.",
    estValue: 15000,
    teamSize: 22,
    budget: "$10–50k",
    timeline: "Next quarter",
    status: "new",
  },
  {
    id: "L-2051",
    company: "Tidewater Credit Union",
    industry: "Finance",
    region: "US-East",
    contact: { name: "Dana Pruitt", role: "VP Member Services", email: "dana.pruitt@tidewatercu.example" },
    source: "Demo request",
    receivedAt: h(2.5),
    message: "We have 210 staff handling member relationships. Security review needed before any trial.",
    estValue: 150000,
    teamSize: 210,
    budget: "$50k+",
    timeline: "This quarter",
    decisionMakerConfirmed: false,
    status: "new",
  },
  {
    id: "L-2052",
    company: "Ashgrove Veterinary",
    industry: "Healthcare",
    region: "US-Midwest",
    contact: { name: "Noel Brandt", role: "Clinic Owner", email: "noel@ashgrovevet.example" },
    source: "Outbound reply",
    receivedAt: h(44),
    message: "Replied to your email. We are 12 people and want something light.",
    estValue: 7000,
    teamSize: 12,
    budget: "<$10k",
    timeline: "This quarter",
    status: "new",
  },
]
