import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { getUpcomingEvents } from "@/lib/eventUtils";
import heroBackdrop from "@/assets/nyc-skyline-night.jpg";
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
    <section className="relative bg-background px-4 pt-20 pb-8 md:pt-24 md:pb-12">
      {/* Framed Hero Image */}
      <div className="container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-lg border-2 border-[hsl(var(--frame))]">
          {/* Background Image */}
          <div
            className="relative min-h-[50vh] md:min-h-[60vh] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackdrop})` }}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

            {/* Content */}
            <div className="relative z-10 flex h-full min-h-[50vh] md:min-h-[60vh] flex-col items-center justify-center px-4 py-10 text-center">
              <div className="max-w-3xl">
                {/* Hero Sign Image */}
                <img
                  src={heroSigns}
                  alt="The 34th St. Card Show - Street Signs"
                  className="mx-auto mb-4 md:mb-6 w-44 sm:w-56 md:w-72 lg:w-80 h-auto opacity-0 animate-fade-in drop-shadow-lg"
                  style={{ animationDelay: "0s", animationFillMode: "forwards" }}
                />

                {/* Main Heading */}
                <h1
                  className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95]"
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
                  className="mt-4 md:mt-6 max-w-md mx-auto text-sm md:text-base text-foreground/80 opacity-0 animate-fade-in"
                  style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}
                >
                  The premier destination in Midtown NYC for collectors to buy, sell, and discover rare finds.
                </p>

                {/* CTA Button */}
                {nextEvent && (
                  <Link
                    to={`/event/${nextEvent.id}`}
                    className="mt-5 md:mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-accent px-7 py-3 text-sm md:text-base font-semibold text-accent-foreground transition-all duration-200 hover:bg-accent/90 opacity-0 animate-fade-in"
                    style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
                  >
                    <Ticket className="h-4 w-4 md:h-5 md:w-5" />
                    GET TICKETS NOW
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
