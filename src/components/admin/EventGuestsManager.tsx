import { useState } from "react";
import { Plus, Pencil, Trash2, Star, Award, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useEventCelebrities,
  useEventSponsors,
  useAddCelebrity,
  useUpdateCelebrity,
  useDeleteCelebrity,
  useAddSponsor,
  useUpdateSponsor,
  useDeleteSponsor,
  EventCelebrity,
  EventSponsor,
} from "@/hooks/useEventGuests";
import GuestFormDialog from "./GuestFormDialog";

interface EventGuestsManagerProps {
  eventId: string;
}

const EventGuestsManager = ({ eventId }: EventGuestsManagerProps) => {
  const { data: celebrities = [], isLoading: loadingCelebrities } = useEventCelebrities(eventId);
  const { data: sponsors = [], isLoading: loadingSponsors } = useEventSponsors(eventId);

  const addCelebrity = useAddCelebrity();
  const updateCelebrity = useUpdateCelebrity();
  const deleteCelebrity = useDeleteCelebrity();
  const addSponsor = useAddSponsor();
  const updateSponsor = useUpdateSponsor();
  const deleteSponsor = useDeleteSponsor();

  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<"celebrity" | "sponsor">("celebrity");
  const [editingGuest, setEditingGuest] = useState<EventCelebrity | EventSponsor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "celebrity" | "sponsor" } | null>(null);

  const openAddForm = (type: "celebrity" | "sponsor") => {
    setFormType(type);
    setEditingGuest(null);
    setFormOpen(true);
  };

  const openEditForm = (guest: EventCelebrity | EventSponsor, type: "celebrity" | "sponsor") => {
    setFormType(type);
    setEditingGuest(guest);
    setFormOpen(true);
  };

  const handleSave = async (data: { name: string; bio: string; photo_url: string | null; website: string | null }) => {
    if (formType === "celebrity") {
      if (editingGuest) {
        await updateCelebrity.mutateAsync({ id: editingGuest.id, ...data });
      } else {
        await addCelebrity.mutateAsync({
          event_id: eventId,
          name: data.name,
          bio: data.bio,
          photo_url: data.photo_url,
          website: data.website,
          display_order: celebrities.length,
        });
      }
    } else {
      if (editingGuest) {
        await updateSponsor.mutateAsync({ id: editingGuest.id, ...data, website: data.website || "" });
      } else {
        await addSponsor.mutateAsync({
          event_id: eventId,
          name: data.name,
          bio: data.bio,
          photo_url: data.photo_url,
          website: data.website || "",
          display_order: sponsors.length,
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "celebrity") {
        await deleteCelebrity.mutateAsync({ id: deleteTarget.id, eventId });
      } else {
        await deleteSponsor.mutateAsync({ id: deleteTarget.id, eventId });
      }
      toast.success(`${deleteTarget.type === "celebrity" ? "Celebrity" : "Sponsor"} deleted`);
    } catch (error) {
      toast.error("Failed to delete");
    }
    setDeleteTarget(null);
  };

  const GuestItem = ({
    guest,
    type,
  }: {
    guest: EventCelebrity | EventSponsor;
    type: "celebrity" | "sponsor";
  }) => (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
        {guest.photo_url ? (
          <img src={guest.photo_url} alt={guest.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 truncate">
        <p className="truncate font-medium text-foreground">{guest.name}</p>
        <p className="truncate text-sm text-muted-foreground">{guest.bio}</p>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => openEditForm(guest, type)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteTarget({ id: guest.id, type })}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Celebrities Section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg text-foreground">Celebrities</h3>
          </div>
          <Button size="sm" onClick={() => openAddForm("celebrity")}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {loadingCelebrities ? (
          <div className="animate-pulse space-y-2">
            <div className="h-16 rounded-lg bg-secondary" />
            <div className="h-16 rounded-lg bg-secondary" />
          </div>
        ) : celebrities.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No celebrities added yet
          </p>
        ) : (
          <div className="space-y-2">
            {celebrities.map((celebrity) => (
              <GuestItem key={celebrity.id} guest={celebrity} type="celebrity" />
            ))}
          </div>
        )}
      </div>

      {/* Sponsors Section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg text-foreground">Sponsors</h3>
          </div>
          <Button size="sm" onClick={() => openAddForm("sponsor")}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {loadingSponsors ? (
          <div className="animate-pulse space-y-2">
            <div className="h-16 rounded-lg bg-secondary" />
            <div className="h-16 rounded-lg bg-secondary" />
          </div>
        ) : sponsors.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No sponsors added yet
          </p>
        ) : (
          <div className="space-y-2">
            {sponsors.map((sponsor) => (
              <GuestItem key={sponsor.id} guest={sponsor} type="sponsor" />
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <GuestFormDialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        eventId={eventId}
        type={formType}
        existingGuest={editingGuest || undefined}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventGuestsManager;
