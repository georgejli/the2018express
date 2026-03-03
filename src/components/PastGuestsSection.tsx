import { useCelebrities } from "@/hooks/useCelebrities";
import GuestCard from "@/components/GuestCard";
import { Star } from "lucide-react";

const PastGuestsSection = () => {
  const { data: celebrities = [], isLoading } = useCelebrities(true);

  if (!isLoading && celebrities.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-background px-4 py-14 md:py-20" id="guests">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            <h2 className="font-display text-3xl tracking-wide text-foreground md:text-4xl">
              <span className="text-accent">CELEBRITY GUESTS</span>
            </h2>
            <Star className="h-5 w-5 text-accent" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-4">
                <div className="mx-auto mb-3 h-24 w-24 rounded-full bg-secondary" />
                <div className="mx-auto h-4 w-24 rounded bg-secondary" />
                <div className="mx-auto mt-2 h-3 w-32 rounded bg-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5">
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
