import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { events } from "@/data/events";
import { getPastEvents } from "@/lib/eventUtils";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";

const PastEvents = () => {
  const pastEvents = getPastEvents(events);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-16">
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <Link 
              to="/#events" 
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Upcoming Events
            </Link>
            
            <div className="mb-10 text-center">
              <h1 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
                PAST <span className="text-gradient-gold">EVENTS</span>
              </h1>
              <p className="mt-4 text-muted-foreground">
                Browse our previous card shows and events
              </p>
            </div>
            
            {pastEvents.length > 0 ? (
              <div className="space-y-6">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    date={event.date}
                    month={event.month}
                    year={event.year}
                    dayOfWeek={event.dayOfWeek}
                    time={event.time}
                    earlyBirdTime={event.earlyBirdTime}
                    venue={event.venue}
                    poster={event.poster}
                    isFeatured={false}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="font-display text-xl text-foreground">No Past Events Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check back after our upcoming shows have concluded
                </p>
                <Link 
                  to="/#events"
                  className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  View Upcoming Events
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default PastEvents;
