import { events } from "@/data/events";

const NextShowTicker = () => {
  const nextEvent = events[0];
  
  const monthNames: Record<string, string> = {
    JAN: "JANUARY",
    FEB: "FEBRUARY",
    MAR: "MARCH",
    APR: "APRIL",
    MAY: "MAY",
    JUN: "JUNE",
    JUL: "JULY",
    AUG: "AUGUST",
    SEP: "SEPTEMBER",
    OCT: "OCTOBER",
    NOV: "NOVEMBER",
    DEC: "DECEMBER",
  };

  const dayAbbreviations: Record<string, string> = {
    Sunday: "SUN",
    Monday: "MON",
    Tuesday: "TUE",
    Wednesday: "WED",
    Thursday: "THU",
    Friday: "FRI",
    Saturday: "SAT",
  };

  const formattedDate = `${dayAbbreviations[nextEvent.dayOfWeek]}, ${monthNames[nextEvent.month]} ${nextEvent.date} ${nextEvent.year}`;
  
  const tickerContent = `NEXT SHOW: ${formattedDate}`;
  
  return (
    <div className="overflow-hidden bg-primary py-3">
      <div className="animate-scroll flex whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="mx-8 font-display text-lg tracking-tight text-primary-foreground md:text-xl"
          >
            {tickerContent}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NextShowTicker;
