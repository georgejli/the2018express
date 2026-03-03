import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TicketOption from "@/components/TicketOption";
import TicketCheckoutForm from "@/components/TicketCheckoutForm";
import EventPoster from "@/components/EventPoster";
import EventGuestsSection from "@/components/EventGuestsSection";
import ArenaDivider from "@/components/ArenaDivider";
import { useEvent } from "@/hooks/useEvents";

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

  useEffect(() => {
    if (event) {
      document.title = `${event.month} ${event.date}, ${event.year} Show - 34th St Card Show`;
    } else {
      document.title = "Event - 34th St Card Show";
    }
    return () => { document.title = "34th St Card Show"; };
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
            <h1 className="font-display text-3xl text-foreground">Event Not Found</h1>
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
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-card px-4 pb-8 pt-20 md:pb-14 md:pt-24">
          <div className="container mx-auto max-w-4xl">
            <Link 
              to="/" 
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Events
            </Link>
            
            <div className="animate-fade-in">
              <div className="mb-3 inline-block rounded-md bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
                {event.dayOfWeek}, {event.month} {event.date}, {event.year}
              </div>
              
              <h1 className="font-display text-3xl tracking-wide text-foreground md:text-5xl">
                <span className="text-accent">34TH ST</span> CARD SHOW
              </h1>
              
              <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-start md:gap-7">
                {event.poster && (
                  <EventPoster
                    poster={event.poster}
                    eventName={`${event.month} ${event.date} ${event.year} Card Show`}
                    className="h-48 w-36 shrink-0 rounded-md md:h-64 md:w-48"
                  />
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  
                  {event.earlyBirdTime && (
                    <div className="flex items-center gap-3 text-accent">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-semibold">Early Bird: {event.earlyBirdTime}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <span className="block text-sm font-medium text-foreground">{VENUE_NAME}</span>
                      <a 
                        href={GOOGLE_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-accent hover:underline"
                      >
                        {VENUE_ADDRESS}
                      </a>
                    </div>
                  </div>

                  {event.description && (
                    <p className="pt-2 text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ArenaDivider variant="lightbar" />

        {/* Tickets Section */}
        <section className="px-4 py-14 md:py-20">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-2 font-display text-3xl text-foreground">
              <span className="text-accent">Get Your</span> Tickets
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Choose your experience and secure your spot at the show.
            </p>
            
            <div className="grid gap-5 md:grid-cols-2">
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

        <ArenaDivider variant="lightbar" />

        <EventGuestsSection eventId={event.id} />

        <ArenaDivider variant="lightbar" />

        {/* Merchandise Categories */}
        <section className="bg-card px-4 py-14">
          <div className="container mx-auto max-w-4xl">
            <h2 className="mb-10 text-center font-display text-2xl text-foreground md:text-3xl">
              What You'll <span className="text-accent">Find</span>
            </h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
              {merchandiseCategories.map((category) => (
                <div key={category.title} className="group flex flex-col items-center text-center">
                  <h3 className="mb-3 font-display text-lg text-foreground transition-colors group-hover:text-accent md:text-xl">
                    {category.title}
                  </h3>
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-auto w-full max-w-[180px] object-contain transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <ArenaDivider variant="lightbar" />
        
        {/* Vendor Section */}
        <section className="px-4 py-14 md:py-20">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="mb-3 font-display text-3xl text-foreground">
                Interested in <span className="text-accent">Vending?</span>
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-sm text-muted-foreground">
                Showcase your collection to hundreds of passionate collectors. 
                Limited tables available—reserve yours today.
              </p>
            </div>
            
            <div className="mb-8">
              <h3 className="mb-5 text-center font-display text-xl text-foreground">6ft Vendor Tables</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Link
                  to={`/vendor-application?tier=main_ballroom&event=${event.id}`}
                  className="group rounded-lg border border-accent/30 bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-accent/50"
                >
                  <h4 className="font-display text-base text-accent">Main Ballroom</h4>
                  <p className="mt-1 text-xs text-muted-foreground">1st Floor</p>
                  <p className="mt-3 font-display text-3xl text-foreground">$250</p>
                  <p className="mt-2 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Click to Apply →
                  </p>
                </Link>
                
                <Link
                  to={`/vendor-application?tier=crystal_room&event=${event.id}`}
                  className="group rounded-lg border border-primary/30 bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <h4 className="font-display text-base text-primary">Crystal Room</h4>
                  <p className="mt-1 text-xs text-muted-foreground">1st Floor</p>
                  <p className="mt-3 font-display text-3xl text-foreground">$200</p>
                  <p className="mt-2 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Click to Apply →
                  </p>
                </Link>
                
                <Link
                  to={`/vendor-application?tier=2nd_floor&event=${event.id}`}
                  className="group rounded-lg border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-muted-foreground/50"
                >
                  <h4 className="font-display text-base text-foreground">2nd Floor</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Every Room</p>
                  <p className="mt-3 font-display text-3xl text-foreground">$150</p>
                  <p className="mt-2 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Click to Apply →
                  </p>
                </Link>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                to={`/vendor-application?event=${event.id}`}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-7 py-3 font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
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
