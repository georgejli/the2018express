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
    <div className="relative">
      {/* LED Display Container */}
      <div className="scoreboard-digit-container flex gap-0.5 sm:gap-1">
        {value.split("").map((digit, idx) => (
          <div
            key={idx}
            className="scoreboard-digit relative flex h-12 w-8 items-center justify-center overflow-hidden rounded-sm border border-primary/30 bg-background/90 sm:h-16 sm:w-11 md:h-20 md:w-14"
          >
            {/* LED Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5" />
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
            
            {/* Center Divider Line */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-black/20" />
            
            {/* Digit */}
            <span className="font-display text-3xl text-primary drop-shadow-[0_0_10px_hsl(var(--primary))] sm:text-4xl md:text-5xl">
              {digit}
            </span>
          </div>
        ))}
      </div>
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
      // Set event time to 10 AM (typical show start)
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
    <section className="relative overflow-hidden bg-card py-8 md:py-12">
      {/* Scoreboard Frame */}
      <div className="container mx-auto max-w-4xl px-4">
        <div className="scoreboard-frame relative rounded-lg border-2 border-primary/40 bg-gradient-to-b from-secondary via-background to-secondary p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.5),0_0_20px_hsl(var(--primary)/0.2)] sm:p-6 md:p-8">
          {/* Corner Rivets */}
          <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_6px_hsl(var(--primary))]" />
          <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_6px_hsl(var(--primary))]" />
          <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_6px_hsl(var(--primary))]" />
          <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_6px_hsl(var(--primary))]" />

          {/* Header */}
          <div className="mb-4 text-center md:mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 sm:px-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))]" />
              <span className="font-display text-xs tracking-widest text-accent sm:text-sm">
                NEXT EVENT
              </span>
            </div>
          </div>

          {/* Countdown Display */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
            <ScoreboardDigit value={formatValue(timeLeft.days)} label="DAYS" />
            
            <div className="flex flex-col gap-2 pb-6">
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] animate-pulse" />
            </div>
            
            <ScoreboardDigit value={formatValue(timeLeft.hours)} label="HOURS" />
            
            <div className="flex flex-col gap-2 pb-6">
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] animate-pulse" />
            </div>
            
            <ScoreboardDigit value={formatValue(timeLeft.minutes)} label="MINS" />
            
            <div className="flex flex-col gap-2 pb-6">
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))] animate-pulse" />
            </div>
            
            <ScoreboardDigit value={formatValue(timeLeft.seconds)} label="SECS" />
          </div>

          {/* Event Info */}
          <div className="mt-4 text-center md:mt-6">
            <p className="font-display text-sm tracking-wide text-muted-foreground sm:text-base">
              {nextEvent.dayOfWeek.toUpperCase()}, {nextEvent.month} {nextEvent.date}, {nextEvent.year}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoreboardCountdown;
