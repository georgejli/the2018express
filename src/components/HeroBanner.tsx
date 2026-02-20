import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { getUpcomingEvents } from "@/lib/eventUtils";
import heroBackdrop from "@/assets/nyc-skyline.png";
import heroSignsFallback from "@/assets/hero-signs.png";

const STORAGE_SIGN_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/site-assets/hero-sign.png`;

const HeroBanner = () => {
  const { events } = useEvents();
  const upcomingEvents = getUpcomingEvents(events);
  const nextEvent = upcomingEvents[0];
  const [heroSigns, setHeroSigns] = useState(heroSignsFallback);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setHeroSigns(STORAGE_SIGN_URL);
    img.src = STORAGE_SIGN_URL;
  }, []);

  return (
    <section className="relative min-h-[70vh] md:min-h-[75vh] bg-background overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
        style={{ backgroundImage: `url(${heroBackdrop})` }}
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-[70vh] md:min-h-[75vh] flex-col items-center justify-center px-4 pt-20 md:pt-28 pb-10 text-center">
        <div className="max-w-4xl">
          {/* Hero Sign Image */}
          <img
            src={heroSigns}
            alt="The 34th St. Card Show - Street Signs"
            className="mx-auto mb-4 md:mb-6 w-48 sm:w-64 md:w-80 lg:w-96 h-auto opacity-0 animate-fade-in drop-shadow-2xl"
            style={{ animationDelay: "0s", animationFillMode: "forwards" }}
          />

          {/* Main Heading - Brutalist Style */}
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ lineHeight: "0.9", letterSpacing: "-0.05em" }}
          >
            <span
              className="text-foreground opacity-0 animate-fade-in block"
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              NEW YORK CITY'S
            </span>
            <span
              className="text-accent opacity-0 animate-fade-in block"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              ULTIMATE
            </span>
            <span
              className="text-foreground opacity-0 animate-fade-in block"
              style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
            >
              CARD SHOW
            </span>
          </h1>

          {/* Description */}
          <p
            className="mt-6 md:mt-8 max-w-xl mx-auto text-sm md:text-base font-semibold text-foreground opacity-0 animate-fade-in"
            style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
          >
            The premier destination in Midtown NYC for collectors to buy, sell, and discover rare finds.
          </p>

          {/* CTA Button */}
          {nextEvent && (
            <Link
              to={`/event/${nextEvent.id}`}
              className="mt-6 md:mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-accent px-8 py-3 md:px-10 md:py-4 text-base md:text-lg font-display tracking-tight text-accent-foreground transition-all duration-300 hover:scale-105 hover:glow-gold opacity-0 animate-fade-in"
              style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
            >
              <Ticket className="h-5 w-5 md:h-6 md:w-6" />
              GET TICKETS NOW
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
