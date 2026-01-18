import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

interface EventCardProps {
  id: string;
  date: string;
  month: string;
  year: string;
  dayOfWeek: string;
  time: string;
  venue: string;
  isFeatured?: boolean;
}

const EventCard = ({
  id,
  date,
  month,
  year,
  dayOfWeek,
  time,
  venue,
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
      
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-6">
          {/* Date Block */}
          <div className={`flex-shrink-0 rounded-lg p-4 text-center ${
            isFeatured ? "bg-accent/20" : "bg-secondary"
          }`}>
            <span className="block font-display text-4xl text-foreground">{date}</span>
            <span className={`block text-sm font-semibold uppercase tracking-wide ${
              isFeatured ? "text-accent" : "text-primary"
            }`}>
              {month}
            </span>
            <span className="block text-xs text-muted-foreground">{year}</span>
          </div>
          
          {/* Event Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{dayOfWeek}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{venue}</span>
            </div>
          </div>
          
          {/* Arrow */}
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${
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
