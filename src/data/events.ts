export interface Event {
  id: string;
  date: string;
  month: string;
  year: string;
  dayOfWeek: string;
  time: string;
  earlyBirdTime?: string;
  venue: string;
  address: string;
  gaPrice: number;
  vipPrice: number;
  gaFeatures: string[];
  vipFeatures: string[];
}

export const events: Event[] = [
  {
    id: "feb-2026",
    date: "15",
    month: "FEB",
    year: "2026",
    dayOfWeek: "Saturday",
    time: "10:00 AM - 6:00 PM",
    earlyBirdTime: "9:00 AM",
    venue: "The New Yorker Hotel",
    address: "481 8th Ave, New York, NY",
    gaPrice: 15,
    vipPrice: 45,
    gaFeatures: [
      "Access to all vendor tables",
      "Browse thousands of sports cards",
      "Meet fellow collectors",
      "Entry after 11:00 AM",
    ],
    vipFeatures: [
      "Early entry at 10:00 AM",
      "Exclusive VIP lounge access",
      "Complimentary refreshments",
      "Priority access to all vendors",
      "VIP-only deals and exclusives",
      "Commemorative event lanyard",
    ],
  },
  {
    id: "mar-2026",
    date: "22",
    month: "MAR",
    year: "2026",
    dayOfWeek: "Sunday",
    time: "10:00 AM - 5:00 PM",
    venue: "The Manhattan Center",
    address: "311 W 34th Street, New York, NY 10001",
    gaPrice: 15,
    vipPrice: 45,
    gaFeatures: [
      "Access to all vendor tables",
      "Browse thousands of sports cards",
      "Meet fellow collectors",
      "Entry after 11:00 AM",
    ],
    vipFeatures: [
      "Early entry at 10:00 AM",
      "Exclusive VIP lounge access",
      "Complimentary refreshments",
      "Priority access to all vendors",
      "VIP-only deals and exclusives",
      "Commemorative event lanyard",
    ],
  },
  {
    id: "apr-2026",
    date: "19",
    month: "APR",
    year: "2026",
    dayOfWeek: "Sunday",
    time: "10:00 AM - 5:00 PM",
    venue: "The Manhattan Center",
    address: "311 W 34th Street, New York, NY 10001",
    gaPrice: 15,
    vipPrice: 45,
    gaFeatures: [
      "Access to all vendor tables",
      "Browse thousands of sports cards",
      "Meet fellow collectors",
      "Entry after 11:00 AM",
    ],
    vipFeatures: [
      "Early entry at 10:00 AM",
      "Exclusive VIP lounge access",
      "Complimentary refreshments",
      "Priority access to all vendors",
      "VIP-only deals and exclusives",
      "Commemorative event lanyard",
    ],
  },
];
