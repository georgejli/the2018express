import { useFeaturedCelebrities } from "@/hooks/useFeaturedCelebrities";
import GuestCard from "@/components/GuestCard";
import { Star } from "lucide-react";

const PastGuestsSection = () => {
  const { data: celebrities = [], isLoading } = useFeaturedCelebrities(true);

  // Don't render the section if there are no celebrities
  if (!isLoading && celebrities.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-background px-4 py-16 md:py-24" id="guests">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-accent" />
            <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
              PAST <span className="text-gradient-gold">CELEBRITY GUESTS</span>
            </h2>
            <Star className="h-6 w-6 text-accent" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-secondary" />
                <div className="mx-auto h-4 w-24 rounded bg-secondary" />
                <div className="mx-auto mt-2 h-3 w-32 rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
  );
};

export default PastGuestsSection;
