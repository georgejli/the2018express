import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface EventPosterProps {
  poster: string;
  eventName: string;
  className?: string;
}

const EventPoster = ({ poster, eventName, className = "" }: EventPosterProps) => {
  const [imageError, setImageError] = useState(false);

  if (imageError || !poster) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={`group relative overflow-hidden rounded-lg transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
        >
          <img
            src={poster}
            alt={`${eventName} poster`}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground">
              View Poster
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-border bg-background p-2">
        <img
          src={poster}
          alt={`${eventName} poster`}
          className="h-full w-full rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventPoster;
