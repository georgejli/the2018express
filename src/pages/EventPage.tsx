import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TicketOption from "@/components/TicketOption";
import TicketCheckoutForm from "@/components/TicketCheckoutForm";
import EventPoster from "@/components/EventPoster";
import EventGuestsSection from "@/components/EventGuestsSection";
import { useEvent } from "@/hooks/useEvents";

// Category images
import sportsCardsImg from "@/assets/categories/sports-cards.png";
import pokemonTcgImg from "@/assets/categories/pokemon-tcg.png";
import memorabiliaImg from "@/assets/categories/memorabilia.png";
import autographsImg from "@/assets/categories/autographs.png";

const VENUE_NAME = "The New Yorker Hotel";
const VENUE_ADDRESS = "481 8th Ave, New York, NY";
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=481+8th+Ave+New+York+NY";

const merchandiseCategories = [
  { title: "Sports Cards", image: sportsCardsImg },
  { title: "Pokemon & TCG", image: pokemonTcgImg },
  { title: "Memorabilia", image: memorabiliaImg },
  { title: "Autographs", image: autographsImg },
];
const EventPage = () => {
  const { eventId } = useParams();
  const { event, loading } = useEvent(eventId);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<"GA" | "VIP">("GA");

  // Set page title based on event
  useEffect(() => {
    if (event) {
      document.title = `${event.month} ${event.date}, ${event.year} Show - 34th St Card Show`;
    } else {
      document.title = "Event - 34th St Card Show";
    }
    return () => {
      document.title = "34th St Card Show";
    };
  }, [event]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading event...</div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl text-foreground">Event Not Found</h1>
            <Link to="/" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleTicketSelect = (type: "GA" | "VIP") => {
    setSelectedTicketType(type);
    setCheckoutOpen(true);
  };

  const eventDate = `${event.dayOfWeek}, ${event.month} ${event.date}, ${event.year}`;
  const eventName = `34th St Card Show - ${event.month} ${event.year}`;
  const selectedPrice = selectedTicketType === "VIP" ? event.vipPrice : event.gaPrice;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-[72px]">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-card to-background px-4 py-12 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <Link 
              to="/" 
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Events
            </Link>
            
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="animate-fade-in flex-1">
                <div className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
                  {event.dayOfWeek}, {event.month} {event.date}, {event.year}
                </div>
                
                <h1 className="font-display text-5xl tracking-tight text-foreground md:text-6xl">
                  <span className="text-gradient-gold">34TH ST</span> CARD SHOW
                </h1>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  
                  {event.earlyBirdTime && (
                    <div className="flex items-center gap-3 text-accent">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">Early Bird: {event.earlyBirdTime}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <span className="block font-medium text-foreground">{VENUE_NAME}</span>
                      <a 
                        href={GOOGLE_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground hover:underline"
                      >
                        {VENUE_ADDRESS}
                      </a>
                    </div>
                  </div>

                  {/* Event Description */}
                  {event.description && (
                    <p className="mt-6 text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Event Poster */}
              {event.poster && (
                <div className="flex-shrink-0">
                  <EventPoster
                    poster={event.poster}
                    eventName={`${event.month} ${event.date} ${event.year} Card Show`}
                    className="h-64 w-48 md:h-80 md:w-56"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tickets Section */}
        <section className="border-b border-border px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-2 font-display text-4xl text-foreground">Get Your Tickets</h2>
            <p className="mb-10 text-muted-foreground">
              Choose your experience and secure your spot at the show.
            </p>
            
            <div className="grid gap-6 md:grid-cols-2">
              <TicketOption
                type="GA"
                price={event.gaPrice}
                features={event.gaFeatures}
                onSelect={() => handleTicketSelect("GA")}
              />
              <TicketOption
                type="VIP"
                price={event.vipPrice}
                features={event.vipFeatures}
                onSelect={() => handleTicketSelect("VIP")}
              />
            </div>
          </div>
        </section>

        {/* Celebrities & Sponsors */}
        <EventGuestsSection eventId={event.id} />

        {/* Merchandise Categories Section */}
        <section className="border-b border-border bg-secondary/30 px-4 py-16">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-12 text-center font-display text-3xl text-foreground md:text-4xl">
              What You'll Find
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {merchandiseCategories.map((category) => (
                <div key={category.title} className="flex flex-col items-center text-center">
                  <h3 className="mb-4 font-display text-xl text-foreground md:text-2xl">
                    {category.title}
                  </h3>
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-auto w-full max-w-[208px] object-contain transition-transform hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Vendor Section */}
        <section className="border-t border-border bg-card px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="mb-4 font-display text-4xl text-foreground">Interested in Vending?</h2>
              <p className="mx-auto mb-10 max-w-2xl text-muted-foreground">
                Showcase your collection to hundreds of passionate collectors. 
                Limited tables available—reserve yours today.
              </p>
            </div>
            
            {/* Vendor Table Pricing */}
            <div className="mb-10">
              <h3 className="mb-6 text-center font-display text-2xl text-foreground">6ft Vendor Tables</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Link
to={`/vendor-application?tier=main_ballroom&event=${event.id}`}
                  className="group rounded-xl border border-accent/30 bg-gradient-to-br from-card to-accent/5 p-6 text-center transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
                >
                  <h4 className="font-display text-lg text-accent">Main Ballroom</h4>
                  <p className="mt-1 text-sm text-muted-foreground">1st Floor</p>
                  <p className="mt-4 font-display text-4xl text-foreground">$250</p>
                  <p className="mt-3 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Click to Apply →
                  </p>
                </Link>
                
                <Link
                  to={`/vendor-application?tier=crystal_room&event=${event.id}`}
                  className="group rounded-xl border border-primary/30 bg-gradient-to-br from-card to-primary/5 p-6 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                >
                  <h4 className="font-display text-lg text-primary">Crystal Room</h4>
                  <p className="mt-1 text-sm text-muted-foreground">1st Floor</p>
                  <p className="mt-4 font-display text-4xl text-foreground">$200</p>
                  <p className="mt-3 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Click to Apply →
                  </p>
                </Link>
                
                <Link
                  to={`/vendor-application?tier=2nd_floor&event=${event.id}`}
                  className="group rounded-xl border border-border bg-secondary/50 p-6 text-center transition-all hover:-translate-y-1 hover:border-muted-foreground/50 hover:shadow-lg"
                >
                  <h4 className="font-display text-lg text-foreground">2nd Floor</h4>
                  <p className="mt-1 text-sm text-muted-foreground">Every Room</p>
                  <p className="mt-4 font-display text-4xl text-foreground">$150</p>
                  <p className="mt-3 text-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Click to Apply →
                  </p>
                </Link>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to={`/vendor-application?event=${event.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-gold-light px-8 py-4 font-semibold text-accent-foreground transition-all hover:opacity-90 hover:glow-gold"
              >
                Apply for a Vendor Table
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />

      <TicketCheckoutForm
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        ticketType={selectedTicketType}
        price={selectedPrice}
        eventId={event.id}
        eventDate={eventDate}
        eventName={eventName}
      />
    </div>
  );
};

export default EventPage;
