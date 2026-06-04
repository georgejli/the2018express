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
  // Single event: large hero-style card with ticket stub aesthetic
  if (isSingleEvent) {
    return (
      <Link
        to={`/event/${id}`}
        className="group relative block w-full overflow-hidden rounded-2xl border-2 border-accent/50 bg-card transition-all duration-300 hover:-translate-y-1 card-shine"
      >
        {/* Ticket Header Strip */}
        <div className="relative w-full bg-gradient-to-r from-accent via-gold-light to-accent py-2 px-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-foreground/80">34th St Card Show</span>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-foreground">★ ADMIT ONE ★</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-foreground/80">VIP Access</span>
          </div>
        </div>

        {/* Large Poster */}
        {poster && (
          <div 
            className="relative aspect-[16/9] w-full overflow-hidden bg-card"
            onClick={(e) => e.preventDefault()}
          >
            <img
              src={poster}
              alt={`${month} ${date} ${year} Card Show`}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          </div>
        )}

        {/* Event Details Below Poster */}
        <div className="relative w-full bg-gradient-to-br from-card via-card to-accent/10 p-4 md:p-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex items-start gap-6">
              {/* Jersey Number Date Block */}
              <div className="flex-shrink-0 rounded-xl border-2 border-accent/30 bg-gradient-to-b from-accent/20 to-accent/5 px-6 py-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <span className="jersey-number relative block text-7xl text-foreground leading-none">{date}</span>
                <span className="relative block text-lg font-bold uppercase tracking-wide text-accent mt-1">
                  {month}
                </span>
                <span className="relative block text-sm text-muted-foreground">{year}</span>
              </div>

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

            <div className="flex items-center gap-4">
              {id === "may-2026" ? (
                <a
                  href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1967386767"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-300 hover:scale-110 hover:glow-gold">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">Get Tickets</p>
                    <p className="text-sm text-muted-foreground">Opens in new tab</p>
                  </div>
                </a>
              ) : id === "aug-2026" ? (
                <a
                  href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1903672423"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-4"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-300 hover:scale-110 hover:glow-gold">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">Get Tickets</p>
                    <p className="text-sm text-muted-foreground">Opens in new tab</p>
                  </div>
                </a>
              ) : (
                <>
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-all duration-300 group-hover:scale-110 group-hover:glow-gold">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">Get Tickets</p>
                    <p className="text-sm text-muted-foreground">Click for details</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Layout - Stacked Rows */}
          <div className="flex flex-col gap-4 md:hidden">
            {/* Row 1: Jersey Number Date Block */}
            <div className="rounded-xl border-2 border-accent/30 bg-gradient-to-b from-accent/20 to-accent/5 px-4 py-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <div className="flex items-center justify-center gap-4 relative">
                <span className="jersey-number text-5xl text-foreground leading-none">{date}</span>
                <div className="text-left">
                  <span className="block text-base font-bold uppercase tracking-wide text-accent">
                    {month}
                  </span>
                  <span className="block text-sm text-muted-foreground">{year}</span>
                </div>
              </div>
            </div>

            {/* Row 2: Event Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-foreground">
                <Calendar className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-base">{dayOfWeek}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Clock className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-base">{time}</span>
              </div>
              {earlyBirdTime && (
                <div className="flex items-center gap-3 text-accent">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-base font-semibold">Early Bird: {earlyBirdTime}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 text-accent" />
                <span className="text-base">{venue}</span>
              </div>
            </div>

            {/* Row 3: CTA */}
            {id === "may-2026" ? (
              <a
                href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1967386767"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-3 rounded-xl bg-accent/10 py-3 border border-accent/20"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Ticket className="h-5 w-5" />
                </div>
                <span className="text-base font-semibold text-accent">Get Tickets Now</span>
              </a>
            ) : id === "aug-2026" ? (
              <a
                href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1903672423"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-3 rounded-xl bg-accent/10 py-3 border border-accent/20"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Ticket className="h-5 w-5" />
                </div>
                <span className="text-base font-semibold text-accent">Get Tickets Now</span>
              </a>
            ) : (
              <div className="flex items-center justify-center gap-3 rounded-xl bg-accent/10 py-3 border border-accent/20">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Ticket className="h-5 w-5" />
                </div>
                <span className="text-base font-semibold text-accent">Get Tickets Now</span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Footer Strip */}
        <div className="w-full bg-gradient-to-r from-muted/50 via-muted to-muted/50 py-2 px-6">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>NO. {date}{month.substring(0, 3).toUpperCase()}{year}</span>
            <span className="ticket-perforation w-8 h-4" />
            <span>SECTION: GA</span>
            <span className="ticket-perforation w-8 h-4" />
            <span>ROW: VIP</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default: regular event card with ticket stub aesthetic
  return (
    <Link
      to={`/event/${id}`}
      className={`group relative block w-full overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
        isFeatured 
          ? "border-accent/50 bg-card" 
          : "border-border bg-card"
      } card-shine`}
    >
      {/* Ticket Top Strip */}
      <div className={`py-1.5 px-4 ${
        isFeatured 
          ? "bg-gradient-to-r from-accent via-gold-light to-accent" 
          : "bg-gradient-to-r from-primary via-primary to-primary"
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground/80">34th St</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground">★ ADMIT ONE ★</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-foreground/80">Card Show</span>
        </div>
      </div>
      
      <div className="p-4 md:p-6">
        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {poster && (
            <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
              <EventPoster
                poster={poster}
                eventName={`${month} ${date} ${year} Card Show`}
                className="h-32 w-24"
              />
            </div>
          )}
          
          {/* Jersey Number Date Block */}
          <div className={`flex-shrink-0 rounded-lg border px-4 py-3 text-center relative overflow-hidden ${
            isFeatured ? "border-accent/30 bg-gradient-to-b from-accent/20 to-accent/5" : "border-border bg-secondary"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <span className="jersey-number relative block text-5xl text-foreground leading-none">{date}</span>
            <span className="relative block text-xs font-bold uppercase tracking-wide text-accent mt-1">{month}</span>
            <span className="relative block text-xs text-muted-foreground">{year}</span>
          </div>
          
          <div className="flex-1 space-y-2">
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
          
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${
            isFeatured 
              ? "bg-accent text-accent-foreground group-hover:glow-gold" 
              : "bg-primary text-primary-foreground group-hover:glow-blue"
          }`}>
            {id === "may-2026" ? (
              <a
                href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1967386767"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Ticket className="h-5 w-5" />
              </a>
            ) : id === "aug-2026" ? (
              <a
                href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1903672423"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Ticket className="h-5 w-5" />
              </a>
            ) : (
              <Ticket className="h-5 w-5" />
            )}
          </div>
        </div>

        {/* Mobile Layout - Stacked Rows */}
        <div className="flex flex-col gap-3 md:hidden">
          {/* Row 1: Poster */}
          {poster && (
            <div onClick={(e) => e.preventDefault()}>
              <EventPoster
                poster={poster}
                eventName={`${month} ${date} ${year} Card Show`}
                className="h-32 w-full object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Row 2: Jersey Number Date Block */}
          <div className={`rounded-lg border px-4 py-3 relative overflow-hidden ${
            isFeatured ? "border-accent/30 bg-gradient-to-b from-accent/20 to-accent/5" : "border-border bg-secondary"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="flex items-center justify-center gap-3 relative">
              <span className="jersey-number text-4xl text-foreground leading-none">{date}</span>
              <div className="text-left">
                <span className="block text-sm font-bold uppercase tracking-wide text-accent">
                  {month}
                </span>
                <span className="block text-xs text-muted-foreground">{year}</span>
              </div>
            </div>
          </div>
          
          {/* Row 3: Event Details */}
          <div className="space-y-1.5">
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
          
          {/* Row 4: CTA */}
          {id === "may-2026" ? (
            <a
              href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1967386767"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center justify-center gap-3 rounded-lg py-2 border ${
                isFeatured ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"
              }`}
            >
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                isFeatured 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}>
                <Ticket className="h-4 w-4" />
              </div>
              <span className={`text-sm font-semibold ${
                isFeatured ? "text-accent" : "text-primary"
              }`}>Get Tickets Now</span>
            </a>
          ) : id === "aug-2026" ? (
            <a
              href="https://events.ticketleap.com/tickets/garden-state-trading-card-show25/the-34th-st-card-show-1903672423"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center justify-center gap-3 rounded-lg py-2 border ${
                isFeatured ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"
              }`}
            >
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                isFeatured 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}>
                <Ticket className="h-4 w-4" />
              </div>
              <span className={`text-sm font-semibold ${
                isFeatured ? "text-accent" : "text-primary"
              }`}>Get Tickets Now</span>
            </a>
          ) : (
            <div className={`flex items-center justify-center gap-3 rounded-lg py-2 border ${
              isFeatured ? "bg-accent/10 border-accent/20" : "bg-primary/10 border-primary/20"
            }`}>
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                isFeatured 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-primary text-primary-foreground"
              }`}>
                <Ticket className="h-4 w-4" />
              </div>
              <span className={`text-sm font-semibold ${
                isFeatured ? "text-accent" : "text-primary"
              }`}>Get Tickets Now</span>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Bottom Strip */}
      <div className="bg-muted/30 py-1.5 px-4">
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span>NO. {date}{month.substring(0, 3).toUpperCase()}</span>
          <span>•</span>
          <span>{isFeatured ? "NEXT SHOW" : "UPCOMING"}</span>
          <span>•</span>
          <span>NYC</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
