import { useState } from "react";
import { ExternalLink, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuestCardProps {
  name: string;
  bio: string;
  photoUrl: string | null;
  website?: string | null;
}

const GuestCard = ({ name, bio, photoUrl, website }: GuestCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group flex w-full flex-col items-center rounded-lg border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        <div className="mb-3 h-24 w-24 overflow-hidden rounded-full border border-border bg-secondary transition-colors group-hover:border-accent/50">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <h3 className="font-display text-lg text-foreground transition-colors group-hover:text-accent">
          {name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {bio}
        </p>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">{name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 h-32 w-32 overflow-hidden rounded-full border border-accent bg-secondary">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-14 w-14 text-muted-foreground" />
                </div>
              )}
            </div>
            <h2 className="font-display text-2xl text-foreground">{name}</h2>
            <p className="mt-4 text-muted-foreground">{bio}</p>
            {website && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => window.open(website, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Website
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GuestCard;
