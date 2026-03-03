import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import EventPoster from "./EventPoster";

interface EventCardProps {
  id: string;
  date: string;
  month: string;
  year: string;
  dayOfWeek: string;
  time: string;
  earlyBirdTime?: string;
  venue: string;
  poster?: string;
  isFeatured?: boolean;
  isSingleEvent?: boolean;
}

const EventCard = ({
  id,
  date,
  month,
  year,
  dayOfWeek,
  time,
  earlyBirdTime,
  venue,
  poster,
  isFeatured = false,
  isSingleEvent = false,
}: EventCardProps) => {
  if (isSingleEvent) {
    return (
      <Link
        to={`/event/${id}`}
        className="group relative block w-full overflow-hidden rounded-lg border-2 border-accent/40 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60"
      >
        {/* Poster */}
        {poster && (
          <div 
            className="relative aspect-[16/9] w-full overflow-hidden"
            onClick={(e) => e.preventDefault()}
          >
            <img
              src={poster}
              alt={`${month} ${date} ${year} Card Show`}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
        )}

        <div className="relative p-4 md:p-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              {/* Date Block */}
              <div className="flex-shrink-0 rounded-md border border-accent/30 bg-background px-5 py-3 text-center">
                <span className="jersey-number block text-5xl text-foreground leading-none">{date}</span>
                <span className="block text-sm font-bold uppercase tracking-wide text-accent mt-1">{month}</span>
                <span className="block text-xs text-muted-foreground">{year}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-accent" />
                  <span className="text-base">{dayOfWeek}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0 text-accent" />
                  <span className="text-base">{time}</span>
                </div>
                {earlyBirdTime && (
                  <div className="flex items-center gap-2 text-accent">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="text-base font-semibold">Early Bird: {earlyBirdTime}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-accent" />
                  <span className="text-base">{venue}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:scale-105">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-base text-foreground">Get Tickets</p>
                <p className="text-xs text-muted-foreground">Click for details</p>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="rounded-md border border-accent/30 bg-background px-4 py-3">
              <div className="flex items-center justify-center gap-3">
                <span className="jersey-number text-4xl text-foreground leading-none">{date}</span>
                <div className="text-left">
                  <span className="block text-sm font-bold uppercase tracking-wide text-accent">{month}</span>
                  <span className="block text-xs text-muted-foreground">{year}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-sm">{dayOfWeek}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-sm">{time}</span>
              </div>
              {earlyBirdTime && (
                <div className="flex items-center gap-2 text-accent">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-semibold">Early Bird: {earlyBirdTime}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-sm">{venue}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 rounded-md bg-accent/10 py-2.5 border border-accent/20">
              <Ticket className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Get Tickets Now</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default event card
  return (
    <Link
      to={`/event/${id}`}
      className={`group relative block w-full overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-0.5 ${
        isFeatured ? "border-accent/40 bg-card" : "border-border bg-card"
      }`}
    >
      <div className="p-4 md:p-5">
        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:gap-5">
          {poster && (
            <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
              <EventPoster
                poster={poster}
                eventName={`${month} ${date} ${year} Card Show`}
                className="h-28 w-20"
              />
            </div>
          )}
          
          <div className={`flex-shrink-0 rounded-md border px-4 py-2.5 text-center ${
            isFeatured ? "border-accent/30 bg-background" : "border-border bg-background"
          }`}>
            <span className="jersey-number block text-4xl text-foreground leading-none">{date}</span>
            <span className="block text-xs font-bold uppercase tracking-wide text-accent mt-1">{month}</span>
            <span className="block text-xs text-muted-foreground">{year}</span>
          </div>
          
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{dayOfWeek}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{time}</span>
            </div>
            {earlyBirdTime && (
              <div className="flex items-center gap-2 text-accent">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-semibold">Early Bird: {earlyBirdTime}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{venue}</span>
            </div>
          </div>
          
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${
            isFeatured ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
          }`}>
            <Ticket className="h-4 w-4" />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 md:hidden">
          {poster && (
            <div onClick={(e) => e.preventDefault()}>
              <EventPoster
                poster={poster}
                eventName={`${month} ${date} ${year} Card Show`}
                className="h-32 w-full object-cover rounded-md"
              />
            </div>
          )}
          
          <div className={`rounded-md border px-4 py-2.5 ${
            isFeatured ? "border-accent/30 bg-background" : "border-border bg-background"
          }`}>
            <div className="flex items-center justify-center gap-3">
              <span className="jersey-number text-3xl text-foreground leading-none">{date}</span>
              <div className="text-left">
                <span className="block text-sm font-bold uppercase tracking-wide text-accent">{month}</span>
                <span className="block text-xs text-muted-foreground">{year}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{dayOfWeek}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{time}</span>
            </div>
            {earlyBirdTime && (
              <div className="flex items-center gap-2 text-accent">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-semibold">Early Bird: {earlyBirdTime}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{venue}</span>
            </div>
          </div>
          
          <div className={`flex items-center justify-center gap-2 rounded-md py-2 border ${
            isFeatured ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"
          }`}>
            <Ticket className="h-4 w-4" />
            <span className={`text-sm font-semibold ${isFeatured ? "text-accent" : "text-primary"}`}>
              Get Tickets Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
