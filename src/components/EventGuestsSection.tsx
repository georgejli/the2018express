import { useEventCelebrities, useEventSponsors } from "@/hooks/useEventGuests";
import GuestCard from "./GuestCard";
import { Star, Award } from "lucide-react";

interface EventGuestsSectionProps {
  eventId: string;
}

const EventGuestsSection = ({ eventId }: EventGuestsSectionProps) => {
  const { data: celebrities = [], isLoading: loadingCelebrities } = useEventCelebrities(eventId);
  const { data: sponsors = [], isLoading: loadingSponsors } = useEventSponsors(eventId);

  const hasCelebrities = celebrities.length > 0;
  const hasSponsors = sponsors.length > 0;

  if (!hasCelebrities && !hasSponsors && !loadingCelebrities && !loadingSponsors) {
    return null;
  }

  return (
    <>
      {/* Celebrities Section */}
      {(hasCelebrities || loadingCelebrities) && (
        <section className="border-b border-border px-4 py-16">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-10 flex items-center justify-center gap-3">
              <Star className="h-6 w-6 text-accent" />
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Celebrity Guests
              </h2>
              <Star className="h-6 w-6 text-accent" />
            </div>
            
            {loadingCelebrities ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                    <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-secondary" />
                    <div className="mx-auto h-4 w-20 rounded bg-secondary" />
                    <div className="mx-auto mt-2 h-3 w-32 rounded bg-secondary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {celebrities.map((celebrity) => (
                  <GuestCard
                    key={celebrity.id}
                    name={celebrity.name}
                    bio={celebrity.bio}
                    photoUrl={celebrity.photo_url}
                    website={celebrity.website}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sponsors Section */}
      {(hasSponsors || loadingSponsors) && (
        <section className="border-b border-border bg-secondary/30 px-4 py-16">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-10 flex items-center justify-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl text-foreground md:text-4xl">
                Our Sponsors
              </h2>
              <Award className="h-6 w-6 text-primary" />
            </div>
            
            {loadingSponsors ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                    <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-secondary" />
                    <div className="mx-auto h-4 w-20 rounded bg-secondary" />
                    <div className="mx-auto mt-2 h-3 w-32 rounded bg-secondary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {sponsors.map((sponsor) => (
                  <GuestCard
                    key={sponsor.id}
                    name={sponsor.name}
                    bio={sponsor.bio}
                    photoUrl={sponsor.photo_url}
                    website={sponsor.website}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default EventGuestsSection;
