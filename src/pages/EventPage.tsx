import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TicketOption from "@/components/TicketOption";
import { events } from "@/data/events";
import { toast } from "sonner";

const EventPage = () => {
  const { eventId } = useParams();
  const event = events.find((e) => e.id === eventId);
  
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
    toast.success(`${type} ticket selection coming soon!`, {
      description: "Ticket purchasing will be available shortly.",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-b from-card to-background px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <Link 
              to="/" 
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Events
            </Link>
            
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="animate-fade-in">
                <div className="mb-4 inline-block rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
                  {event.dayOfWeek}, {event.month} {event.date}, {event.year}
                </div>
                
                <h1 className="font-display text-5xl tracking-wider text-foreground md:text-6xl">
                  <span className="text-gradient-gold">34TH ST</span> CARD SHOW
                </h1>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <span className="block font-medium text-foreground">{event.venue}</span>
                      <span className="text-sm">{event.address}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Date Block */}
              <div className="flex-shrink-0 rounded-xl bg-card p-6 text-center shadow-lg md:p-8">
                <span className="block font-display text-6xl text-foreground md:text-7xl">{event.date}</span>
                <span className="block text-xl font-bold uppercase tracking-wide text-accent">{event.month}</span>
                <span className="block text-muted-foreground">{event.year}</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tickets Section */}
        <section className="px-4 py-16 md:py-24">
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
        
        {/* Vendor Section */}
        <section className="border-t border-border bg-card px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="mb-4 font-display text-4xl text-foreground">Interested in Vending?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Showcase your collection to hundreds of passionate collectors. 
              Limited tables available—reserve yours today.
            </p>
            
            <a
              href="https://forms.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-gold-light px-8 py-4 font-semibold text-accent-foreground transition-all hover:opacity-90 hover:glow-gold"
            >
              Apply for a Vendor Table
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventPage;
