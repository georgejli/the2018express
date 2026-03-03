import { useEventCelebrities } from "@/hooks/useCelebrities";
import { useEventSponsors } from "@/hooks/useEventGuests";
import GuestCard from "./GuestCard";
import { Star, Award } from "lucide-react";

interface EventGuestsSectionProps {
  eventId: string;
}

const EventGuestsSection = ({ eventId }: EventGuestsSectionProps) => {
  const { data: celebrityLinks = [], isLoading: loadingCelebrities } = useEventCelebrities(eventId);
  const { data: sponsors = [], isLoading: loadingSponsors } = useEventSponsors(eventId);

  const hasCelebrities = celebrityLinks.length > 0;
  const hasSponsors = sponsors.length > 0;

  if (!hasCelebrities && !hasSponsors && !loadingCelebrities && !loadingSponsors) {
    return null;
  }

  return (
    <>
      {(hasCelebrities || loadingCelebrities) && (
        <section className="border-b border-border px-4 py-14">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              <h2 className="font-display text-2xl text-foreground md:text-3xl">
                Celebrity Guests
              </h2>
              <Star className="h-5 w-5 text-accent" />
            </div>
            
            {loadingCelebrities ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-4">
                    <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-secondary" />
                    <div className="mx-auto h-4 w-20 rounded bg-secondary" />
                    <div className="mx-auto mt-2 h-3 w-32 rounded bg-secondary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {celebrityLinks.map((link) => {
                  const celebrity = link.celebrity;
                  if (!celebrity) return null;
                  return (
                    <GuestCard
                      key={link.id}
                      name={celebrity.name}
                      bio={celebrity.bio}
                      photoUrl={celebrity.photo_url}
                      website={celebrity.website}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {(hasSponsors || loadingSponsors) && (
        <section className="border-b border-border bg-card px-4 py-14">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl text-foreground md:text-3xl">
                Our Sponsors
              </h2>
              <Award className="h-5 w-5 text-primary" />
            </div>
            
            {loadingSponsors ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-border bg-background p-4">
                    <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-secondary" />
                    <div className="mx-auto h-4 w-20 rounded bg-secondary" />
                    <div className="mx-auto mt-2 h-3 w-32 rounded bg-secondary" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
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
