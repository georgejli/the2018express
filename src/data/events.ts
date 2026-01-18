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
  poster?: string;
}

export const events: Event[] = [
  {
    id: "feb-2026",
    date: "15",
    month: "FEB",
    year: "2026",
    dayOfWeek: "Sunday",
    time: "10:00 AM - 6:00 PM",
    earlyBirdTime: "9:00 AM",
    venue: "The New Yorker Hotel",
    address: "481 8th Ave, New York, NY",
    gaPrice: 10,
    vipPrice: 15,
    gaFeatures: [
      "Access to all vendor tables",
      "Browse thousands of sports cards",
      "Meet fellow collectors",
      "Entry after 10:00 AM",
      "Meet special guests",
    ],
    vipFeatures: [
      "Early entry at 9:00 AM",
      "Exclusive VIP access to merchandise",
      "First access to guest meet and greets",
      "Priority access to all vendors",
    ],
    poster: "/posters/feb-15-2025.jpg",
  },
  {
    id: "mar-2026",
    date: "22",
    month: "MAR",
    year: "2026",
    dayOfWeek: "Sunday",
    time: "10:00 AM - 6:00 PM",
    venue: "The New Yorker Hotel",
    address: "481 8th Ave, New York, NY",
    gaPrice: 10,
    vipPrice: 15,
    gaFeatures: [
      "Access to all vendor tables",
      "Browse thousands of sports cards",
      "Meet fellow collectors",
      "Entry after 10:00 AM",
      "Meet special guests",
    ],
    vipFeatures: [
      "Early entry at 9:00 AM",
      "Exclusive VIP access to merchandise",
      "First access to guest meet and greets",
      "Priority access to all vendors",
    ],
  },
  {
    id: "apr-2026",
    date: "19",
    month: "APR",
    year: "2026",
    dayOfWeek: "Sunday",
    time: "10:00 AM - 6:00 PM",
    venue: "The New Yorker Hotel",
    address: "481 8th Ave, New York, NY",
    gaPrice: 10,
    vipPrice: 15,
    gaFeatures: [
      "Access to all vendor tables",
      "Browse thousands of sports cards",
      "Meet fellow collectors",
      "Entry after 10:00 AM",
      "Meet special guests",
    ],
    vipFeatures: [
      "Early entry at 9:00 AM",
      "Exclusive VIP access to merchandise",
      "First access to guest meet and greets",
      "Priority access to all vendors",
    ],
  },
];
