import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
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
}: EventCardProps) => {
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
        {/* Mobile Layout: Poster + Date side by side, details below */}
        {/* Desktop Layout: All in a row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          {/* Top row on mobile: Poster + Date Block */}
          <div className="flex items-start gap-4">
            {/* Poster Thumbnail */}
            {poster && (
              <div className="flex-shrink-0" onClick={(e) => e.preventDefault()}>
                <EventPoster
                  poster={poster}
                  eventName={`${month} ${date} ${year} Card Show`}
                  className="h-24 w-18 md:h-32 md:w-24"
                />
              </div>
            )}
            
            {/* Date Block */}
            <div className={`flex-shrink-0 rounded-lg px-4 py-3 text-center ${
              isFeatured ? "bg-accent/20" : "bg-secondary"
            }`}>
              <span className="block font-display text-3xl md:text-4xl text-foreground">{date}</span>
              <span className="block text-xs md:text-sm font-semibold uppercase tracking-wide text-accent">
                {month}
              </span>
              <span className="block text-xs text-muted-foreground">{year}</span>
            </div>

            {/* Arrow - visible on mobile only, positioned here */}
            <div className={`ml-auto flex h-10 w-10 md:hidden flex-shrink-0 items-center justify-center rounded-full ${
              isFeatured 
                ? "bg-accent text-accent-foreground" 
                : "bg-primary text-primary-foreground"
            }`}>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          
          {/* Event Details - stacked on mobile, inline on desktop */}
          <div className="flex-1 space-y-1 md:space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm whitespace-nowrap">{dayOfWeek}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm whitespace-nowrap">{time}</span>
            </div>
            
            {earlyBirdTime && (
              <div className="flex items-center gap-2 text-accent">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Early Bird: {earlyBirdTime}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
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
