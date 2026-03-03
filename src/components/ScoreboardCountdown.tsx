import { useState, useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { getUpcomingEvents, getEventDate } from "@/lib/eventUtils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ScoreboardDigit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="flex gap-1">
      {value.split("").map((digit, idx) => (
        <div
          key={idx}
          className="flex h-12 w-9 items-center justify-center rounded-sm border border-primary/40 bg-background sm:h-16 sm:w-12 md:h-20 md:w-14"
        >
          <span className="font-display text-3xl text-primary sm:text-4xl md:text-5xl">
            {digit}
          </span>
        </div>
      ))}
    </div>
    <span className="mt-2 font-display text-[10px] tracking-widest text-muted-foreground sm:text-xs">
      {label}
    </span>
  </div>
);

const ScoreboardCountdown = () => {
  const { events } = useEvents();
  const upcomingEvents = getUpcomingEvents(events);
  const nextEvent = upcomingEvents[0];

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!nextEvent) return;

    const calculateTimeLeft = () => {
      const eventDate = getEventDate(nextEvent);
      eventDate.setHours(10, 0, 0, 0);
      
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  if (!nextEvent) return null;

  const formatValue = (value: number, digits: number = 2) => {
    return value.toString().padStart(digits, "0");
  };

  return (
    <section className="bg-card py-8 md:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="rounded-lg border-2 border-primary/30 bg-background p-4 sm:p-6 md:p-8">
          {/* Corner dots */}
          <div className="relative">
            <div className="absolute -top-2 -left-2 h-2.5 w-2.5 rounded-full bg-primary/50" />
            <div className="absolute -top-2 -right-2 h-2.5 w-2.5 rounded-full bg-primary/50" />
          </div>

          {/* Header */}
          <div className="mb-4 text-center md:mb-6">
            <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 font-display text-xs tracking-widest text-accent sm:text-sm">
              NEXT EVENT
            </span>
          </div>

          {/* Countdown Display */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
            <ScoreboardDigit value={formatValue(timeLeft.days)} label="DAYS" />
            
            <div className="flex flex-col gap-2 pb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            
            <ScoreboardDigit value={formatValue(timeLeft.hours)} label="HOURS" />
            
            <div className="flex flex-col gap-2 pb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            
            <ScoreboardDigit value={formatValue(timeLeft.minutes)} label="MINS" />
            
            <div className="flex flex-col gap-2 pb-6">
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
              <div className="h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            
            <ScoreboardDigit value={formatValue(timeLeft.seconds)} label="SECS" />
          </div>

          {/* Event Info */}
          <div className="mt-4 text-center md:mt-6">
            <p className="font-display text-sm tracking-wide text-muted-foreground sm:text-base">
              {nextEvent.dayOfWeek.toUpperCase()}, {nextEvent.month} {nextEvent.date}, {nextEvent.year}
            </p>
          </div>

          {/* Bottom corner dots */}
          <div className="relative">
            <div className="absolute -bottom-2 -left-2 h-2.5 w-2.5 rounded-full bg-primary/50" />
            <div className="absolute -bottom-2 -right-2 h-2.5 w-2.5 rounded-full bg-primary/50" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoreboardCountdown;
