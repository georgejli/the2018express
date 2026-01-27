import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { getUpcomingEvents } from "@/lib/eventUtils";

const HeroBanner = () => {
  const { events } = useEvents();
  const upcomingEvents = getUpcomingEvents(events);
  const nextEvent = upcomingEvents[0];

  return (
    <section className="relative min-h-[85vh] bg-background overflow-hidden">
      {/* Content */}
      <div className="relative z-10 flex h-full min-h-[85vh] flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <div className="max-w-4xl">
          {/* Main Heading - Brutalist Style */}
          <h1 className="font-display brutalist-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="text-foreground opacity-0 animate-fade-in block" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
              NEW YORK CITY'S
            </span>
            <span className="text-accent opacity-0 animate-fade-in block" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
              ULTIMATE
            </span>
            <span className="text-foreground opacity-0 animate-fade-in block" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
              CARD SHOW
            </span>
          </h1>
          
          {/* Description */}
          <p className="mt-10 md:mt-12 max-w-xl mx-auto text-base md:text-lg font-semibold text-foreground opacity-0 animate-fade-in" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            The premier destination in Midtown NYC for collectors to buy, sell, and discover rare finds.
          </p>
          
          {/* Presented By */}
          <div className="mt-10 md:mt-12 opacity-0 animate-fade-in" style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}>
            <p className="text-sm tracking-widest text-muted-foreground uppercase mb-2">
              Presented By
            </p>
            <div className="font-display text-lg md:text-xl tracking-tight text-foreground leading-tight">
              <span className="block">LAZ NYC</span>
              <span className="block">MIKE CARBONARO</span>
              <span className="block">CORY ZILLA</span>
            </div>
          </div>
          
          {/* CTA Button */}
          {nextEvent && (
            <Link
              to={`/event/${nextEvent.id}`}
              className="mt-10 md:mt-12 inline-flex items-center justify-center rounded-full bg-accent px-10 py-4 md:px-12 md:py-5 text-lg md:text-xl font-display tracking-tight text-accent-foreground transition-all duration-300 hover:scale-105 hover:glow-gold opacity-0 animate-fade-in"
              style={{ animationDelay: "1.1s", animationFillMode: "forwards" }}
            >
              GET TICKETS NOW
            </Link>
          )}
        </div>
        
        {/* Scroll Indicator - Hidden on mobile */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="h-14 w-8 rounded-full border-2 border-muted-foreground/40 p-1">
            <div className="h-3 w-1 mx-auto rounded-full bg-accent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
