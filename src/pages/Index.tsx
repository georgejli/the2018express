import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import NextShowTicker from "@/components/NextShowTicker";
import EventCard from "@/components/EventCard";
import PastGuestsSection from "@/components/PastGuestsSection";
import NewsletterSignup from "@/components/NewsletterSignup";
import Footer from "@/components/Footer";
import { useEvents } from "@/hooks/useEvents";
import { getUpcomingEvents, getPastEvents } from "@/lib/eventUtils";
import { ChevronDown, History } from "lucide-react";

const INITIAL_EVENTS_COUNT = 3;

const Index = () => {
  const { events } = useEvents();
  const upcomingEvents = getUpcomingEvents(events);
  const pastEvents = getPastEvents(events);
  const [showAllEvents, setShowAllEvents] = useState(false);
  
  const displayedEvents = showAllEvents 
    ? upcomingEvents 
    : upcomingEvents.slice(0, INITIAL_EVENTS_COUNT);
  
  const hasMoreEvents = upcomingEvents.length > INITIAL_EVENTS_COUNT;
  const hasPastEvents = pastEvents.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <HeroBanner />
        <NextShowTicker />
        
        {/* Events Section */}
        <section className="px-4 py-16 md:py-24" id="events">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
                UPCOMING <span className="text-gradient-blue">EVENTS</span>
              </h2>
              <div className="mt-6 space-y-1">
                <p className="font-display text-xl tracking-wide text-foreground">THE NEW YORKER HOTEL</p>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=481+8th+Ave+New+York+NY" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
                >
                  481 8TH AVE, NEW YORK, NY
                </a>
                <p className="text-sm text-muted-foreground">ACROSS FROM MSG</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {displayedEvents.map((event, index) => (
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
                  isFeatured={index === 0}
                  isSingleEvent={upcomingEvents.length === 1}
                />
              ))}
            </div>
            
            {/* More Events / Past Events Section */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {hasMoreEvents && !showAllEvents && (
                <button
                  onClick={() => setShowAllEvents(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:bg-primary/10"
                >
                  <ChevronDown className="h-4 w-4" />
                  More Events ({upcomingEvents.length - INITIAL_EVENTS_COUNT} more)
                </button>
              )}
              
              {hasPastEvents && (
                <Link
                  to="/past-events"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-muted-foreground transition-all hover:border-accent hover:bg-accent/10 hover:text-accent"
                >
                  <History className="h-4 w-4" />
                  Past Events
                </Link>
              )}
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section className="border-t border-border bg-card px-4 py-16 md:py-24" id="about">
          <div className="container mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
                  ABOUT <span className="text-gradient-gold">THE SHOW</span>
                </h2>
                <p className="mt-6 leading-relaxed text-muted-foreground">
                  The 34th St Card Show brings together the best vendors, collectors, 
                  and enthusiasts from across the tri-state area. Whether you're hunting 
                  for vintage gems, modern hits, or looking to sell part of your collection, 
                  our shows offer something for everyone.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  With dozens of vendor tables featuring sports cards, trading cards, 
                  memorabilia, and more—you'll find the cards you've been searching for 
                  at prices you won't find anywhere else.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-secondary/50 p-6">
                  <div className="font-display text-4xl text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Vendors Each Show</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/50 p-6">
                  <div className="font-display text-4xl text-accent">1000+</div>
                  <div className="text-sm text-muted-foreground">Collectors Attending</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/50 p-6">
                  <div className="font-display text-4xl text-foreground">∞</div>
                  <div className="text-sm text-muted-foreground">Cards To Discover</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PastGuestsSection />

        <NewsletterSignup />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
