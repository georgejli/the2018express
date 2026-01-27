import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Ticket } from "lucide-react";
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
  // Single event: large hero-style card
  if (isSingleEvent) {
    return (
      <Link
        to={`/event/${id}`}
        className="group relative block overflow-hidden rounded-2xl border-2 border-accent/50 bg-gradient-to-br from-card via-card to-accent/10 transition-all duration-300 hover:-translate-y-1 card-shine"
      >
        <div className="absolute right-0 top-0 z-10 bg-gradient-to-r from-accent to-gold-light px-6 py-2 text-sm font-bold uppercase tracking-wider text-accent-foreground">
          Next Show
        </div>

        {/* Large Poster */}
        {poster && (
          <div 
            className="relative aspect-[16/9] w-full overflow-hidden bg-secondary"
            onClick={(e) => e.preventDefault()}
          >
            <img
              src={poster}
              alt={`${month} ${date} ${year} Card Show`}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          </div>
        )}

        {/* Event Details Below Poster */}
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Date Block + Details */}
            <div className="flex items-start gap-6">
              {/* Large Date Block */}
              <div className="flex-shrink-0 rounded-xl bg-accent/20 px-6 py-4 text-center">
                <span className="block font-display text-5xl md:text-6xl text-foreground">{date}</span>
                <span className="block text-lg font-semibold uppercase tracking-wide text-accent">
                  {month}
                </span>
                <span className="block text-sm text-muted-foreground">{year}</span>
              </div>

              {/* Event Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 text-foreground">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-accent" />
                  <span className="text-lg font-medium">{dayOfWeek}</span>
                </div>

                <div className="flex items-center gap-3 text-foreground">
                  <Clock className="h-5 w-5 flex-shrink-0 text-accent" />
                  <span className="text-lg">{time}</span>
                </div>

                {earlyBirdTime && (
                  <div className="flex items-center gap-3 text-accent">
                    <Clock className="h-5 w-5 flex-shrink-0" />
                    <span className="text-lg font-semibold">Early Bird: {earlyBirdTime}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-foreground">
                  <MapPin className="h-5 w-5 flex-shrink-0 text-accent" />
                  <span className="text-lg">{venue}</span>
                </div>
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-300 group-hover:scale-110 group-hover:glow-gold">
                <Ticket className="h-6 w-6" />
              </div>
              <div className="hidden md:block">
                <p className="font-display text-lg text-foreground">Get Tickets</p>
                <p className="text-sm text-muted-foreground">Click for details</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default: regular event card
  return (
    <Link
      to={`/event/${id}`}
      className={`group relative block overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
        isFeatured 
          ? "border-accent/50 bg-gradient-to-br from-card via-card to-accent/10" 
          : "border-border bg-card"
      } card-shine`}
    >
      {isFeatured && (
        <div className="absolute right-0 top-0 bg-gradient-to-r from-accent to-gold-light px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
          Next Show
        </div>
      )}
      
      <div className="p-4 md:p-6">
        {/* Mobile Layout: Poster left, Date+Arrow right, details below */}
        {/* Desktop Layout: All in a row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          {/* Top row on mobile: Poster | Date + Arrow */}
          <div className="flex items-center gap-3">
            {/* Poster Thumbnail - smaller on mobile */}
            {poster && (
              <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
                <EventPoster
                  poster={poster}
                  eventName={`${month} ${date} ${year} Card Show`}
                  className="h-16 w-12 md:h-32 md:w-24"
                />
              </div>
            )}
            
            {/* Date Block + Arrow container */}
            <div className="flex flex-1 items-center justify-between md:flex-initial md:justify-start">
              <div className={`flex-shrink-0 rounded-lg px-3 py-2 text-center md:px-4 md:py-3 ${
                isFeatured ? "bg-accent/20" : "bg-secondary"
              }`}>
                <span className="block font-display text-2xl md:text-4xl text-foreground">{date}</span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-accent">
                  {month}
                </span>
                <span className="block text-[10px] md:text-xs text-muted-foreground">{year}</span>
              </div>

              {/* Arrow - visible on mobile only */}
              <div className={`flex h-9 w-9 md:hidden flex-shrink-0 items-center justify-center rounded-full ${
                isFeatured 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Event Details - stacked */}
          <div className="flex-1 space-y-0.5 md:space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm">{dayOfWeek}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm">{time}</span>
            </div>
            
            {earlyBirdTime && (
              <div className="flex items-center gap-2 text-accent">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-semibold">Early Bird: {earlyBirdTime}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm">{venue}</span>
            </div>
          </div>
          
          {/* Arrow - desktop only */}
          <div className={`hidden md:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${
            isFeatured 
              ? "bg-accent text-accent-foreground group-hover:glow-gold" 
              : "bg-primary text-primary-foreground group-hover:glow-blue"
          }`}>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
