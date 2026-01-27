import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import nycSkyline from "@/assets/nyc-skyline.avif";
import { useEvents } from "@/hooks/useEvents";
import { getUpcomingEvents } from "@/lib/eventUtils";

const HeroBanner = () => {
  const { events } = useEvents();
  const upcomingEvents = getUpcomingEvents(events);
  const nextEvent = upcomingEvents[0];
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Image with Blur and Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px] scale-110"
        style={{ 
          backgroundImage: `url(${nycSkyline})`,
          transform: `scale(1.1) translateY(${scrollY * 0.3}px)`
        }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div>
          <p className="mb-4 text-lg font-medium uppercase tracking-tight text-accent opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            New York City's Premier
          </p>
          <h1 className="font-display text-6xl tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="text-gradient-gold opacity-0 animate-fade-in inline-block" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>34TH ST</span>
            <br />
            <span className="text-foreground opacity-0 animate-fade-in inline-block" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>CARD SHOW</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl opacity-0 animate-fade-in" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            The ultimate destination for collectors, traders, and sports card enthusiasts. 
            Buy, sell, and discover rare finds.
          </p>
          
          {/* CTA Button */}
          {nextEvent && (
            <Link
              to={`/event/${nextEvent.id}`}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-lg font-semibold text-accent-foreground transition-all duration-300 hover:scale-105 hover:glow-gold opacity-0 animate-fade-in"
              style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
            >
              <Ticket className="h-5 w-5" />
              Get Tickets Now
            </Link>
          )}
          
          <p className="mt-8 text-sm text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: "1.1s", animationFillMode: "forwards" }}>
            Presented by <span className="text-foreground font-medium">Laz NYC</span> & <span className="text-foreground font-medium">Mike Carbonaro</span> & <span className="text-foreground font-medium">Cory Zilla</span>
          </p>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-14 w-8 rounded-full border-2 border-muted-foreground/40 p-1">
            <div className="h-3 w-1 mx-auto rounded-full bg-accent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
