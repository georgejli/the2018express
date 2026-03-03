import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import NextShowTicker from "@/components/NextShowTicker";
import ScoreboardCountdown from "@/components/ScoreboardCountdown";
import EventCard from "@/components/EventCard";
import PastGuestsSection from "@/components/PastGuestsSection";
import NewsletterSignup from "@/components/NewsletterSignup";
import ArenaDivider from "@/components/ArenaDivider";
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
        
        <ScoreboardCountdown />
        
        <ArenaDivider variant="lightbar" />

        {/* Events Section */}
        <section className="px-4 py-10 md:py-16" id="events">
          <div className="container mx-auto max-w-4xl">
            
            <div className="space-y-5">
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
            
            {/* More Events / Past Events */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {hasMoreEvents && !showAllEvents && (
                <button
                  onClick={() => setShowAllEvents(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ChevronDown className="h-4 w-4" />
                  More Events ({upcomingEvents.length - INITIAL_EVENTS_COUNT} more)
                </button>
              )}
              
              {hasPastEvents && (
                <Link
                  to="/past-events"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  <History className="h-4 w-4" />
                  Past Events
                </Link>
              )}
            </div>

            {/* Presented By */}
            <div className="mt-10 flex justify-center">
              <div className="inline-block rounded-md border border-border bg-card px-6 py-5">
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3 text-center">
                  Presented By
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  <span className="font-display text-base md:text-lg text-foreground">LAZ NYC</span>
                  <span className="text-accent">×</span>
                  <span className="font-display text-base md:text-lg text-foreground">MIKE CARBONARO</span>
                  <span className="text-accent">×</span>
                  <span className="font-display text-base md:text-lg text-foreground">CORY ZILLA</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <ArenaDivider variant="lightbar" />

        {/* About Section */}
        <section className="bg-card px-4 py-14 md:py-20" id="about">
          <div className="container mx-auto max-w-4xl">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="font-display text-3xl tracking-wide text-foreground md:text-4xl">
                  ABOUT <span className="text-accent">THE SHOW</span>
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  The 34th St Card Show brings together the best vendors, collectors, 
                  and enthusiasts from across the tri-state area. Whether you're hunting 
                  for vintage gems, modern hits, or looking to sell part of your collection, 
                  our shows offer something for everyone.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  With dozens of vendor tables featuring sports cards, trading cards, 
                  memorabilia, and more—you'll find the cards you've been searching for 
                  at prices you won't find anywhere else.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-background p-5">
                  <div className="font-display text-3xl text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Vendors Each Show</div>
                </div>
                <div className="rounded-md border border-border bg-background p-5">
                  <div className="font-display text-3xl text-accent">1000+</div>
                  <div className="text-sm text-muted-foreground">Collectors Attending</div>
                </div>
                <div className="rounded-md border border-border bg-background p-5">
                  <div className="font-display text-3xl text-foreground">∞</div>
                  <div className="text-sm text-muted-foreground">Cards To Discover</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ArenaDivider variant="lightbar" />

        <PastGuestsSection />

        <ArenaDivider variant="lightbar" />

        <NewsletterSignup />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
