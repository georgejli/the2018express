import { Event } from "@/data/events";

const MONTHS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

/**
 * Convert an event to a Date object
 */
export function getEventDate(event: Event): Date {
  const monthIndex = MONTHS[event.month.toUpperCase()] ?? 0;
  return new Date(parseInt(event.year), monthIndex, parseInt(event.date));
}

/**
 * Get the current time in Eastern Time
 */
export function getEasternTime(): Date {
  const now = new Date();
  // Convert to Eastern Time
  const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  return easternTime;
}

/**
 * Check if an event is in the past (24 hours after event date in Eastern Time)
 */
export function isEventPast(event: Event): boolean {
  const eventDate = getEventDate(event);
  const easternNow = getEasternTime();
  
  // Set event date to end of day + 24 hours (archive 24 hours after event)
  const archiveDate = new Date(eventDate);
  archiveDate.setDate(archiveDate.getDate() + 1); // Add 24 hours
  archiveDate.setHours(23, 59, 59, 999);
  
  return easternNow > archiveDate;
}

/**
 * Get upcoming events sorted by date (soonest first)
 */
export function getUpcomingEvents(events: Event[]): Event[] {
  return events
    .filter(event => !isEventPast(event))
    .sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());
}

/**
 * Get past events sorted by date (most recent first)
 */
export function getPastEvents(events: Event[]): Event[] {
  return events
    .filter(event => isEventPast(event))
    .sort((a, b) => getEventDate(b).getTime() - getEventDate(a).getTime());
}
