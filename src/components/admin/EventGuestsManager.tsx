import { useState } from "react";
import { Plus, Pencil, Trash2, Star, Award, User, Link } from "lucide-react";
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
  useCelebrities,
  useAddCelebrity,
  useUpdateCelebrity,
  useLinkCelebrityToEvent,
  useUnlinkCelebrityFromEvent,
  Celebrity,
  EventCelebrityLink,
} from "@/hooks/useCelebrities";
import {
  useEventSponsors,
  useAddSponsor,
  useUpdateSponsor,
  useDeleteSponsor,
  EventSponsor,
} from "@/hooks/useEventGuests";
import CelebrityFormDialog from "./CelebrityFormDialog";
import CelebrityImportDialog from "./CelebrityImportDialog";
import GuestFormDialog from "./GuestFormDialog";

interface EventGuestsManagerProps {
  eventId: string;
}

const EventGuestsManager = ({ eventId }: EventGuestsManagerProps) => {
  const { data: celebrityLinks = [], isLoading: loadingCelebrities } = useEventCelebrities(eventId);
  const { data: sponsors = [], isLoading: loadingSponsors } = useEventSponsors(eventId);

  const addCelebrity = useAddCelebrity();
  const updateCelebrity = useUpdateCelebrity();
  const linkCelebrity = useLinkCelebrityToEvent();
  const unlinkCelebrity = useUnlinkCelebrityFromEvent();

  const addSponsor = useAddSponsor();
  const updateSponsor = useUpdateSponsor();
  const deleteSponsor = useDeleteSponsor();

  const [celebrityFormOpen, setCelebrityFormOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<Celebrity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "celebrity" | "sponsor"; name: string } | null>(null);

  const [sponsorFormOpen, setSponsorFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<EventSponsor | null>(null);

  const linkedCelebrityIds = celebrityLinks.map((l) => l.celebrity_id);

  const handleAddNewCelebrity = () => {
    setEditingCelebrity(null);
    setCelebrityFormOpen(true);
  };

  const handleEditCelebrity = (celebrity: Celebrity) => {
    setEditingCelebrity(celebrity);
    setCelebrityFormOpen(true);
  };

  const handleSaveCelebrity = async (data: { name: string; bio: string; photo_url: string | null; website: string | null }) => {
    if (editingCelebrity) {
      await updateCelebrity.mutateAsync({ id: editingCelebrity.id, ...data });
    } else {
      const newCelebrity = await addCelebrity.mutateAsync({
        ...data,
        is_featured: false,
        featured_order: 0,
      });
      await linkCelebrity.mutateAsync({
        eventId,
        celebrityId: newCelebrity.id,
        displayOrder: celebrityLinks.length,
      });
    }
  };

  const handleImportCelebrity = async (celebrity: Celebrity) => {
    try {
      await linkCelebrity.mutateAsync({
        eventId,
        celebrityId: celebrity.id,
        displayOrder: celebrityLinks.length,
      });
      toast.success(`Linked ${celebrity.name} to this event`);
    } catch (error) {
      toast.error("Failed to link celebrity");
    }
  };

  const handleUnlinkCelebrity = async () => {
    if (!deleteTarget || deleteTarget.type !== "celebrity") return;
    const link = celebrityLinks.find((l) => l.celebrity_id === deleteTarget.id);
    if (!link) return;

    try {
      await unlinkCelebrity.mutateAsync({ linkId: link.id, eventId });
      toast.success("Celebrity unlinked from event");
    } catch (error) {
      toast.error("Failed to unlink celebrity");
    }
    setDeleteTarget(null);
  };

  // Sponsor handlers
  const handleAddSponsor = () => {
    setEditingSponsor(null);
    setSponsorFormOpen(true);
  };

  const handleEditSponsor = (sponsor: EventSponsor) => {
    setEditingSponsor(sponsor);
    setSponsorFormOpen(true);
  };

  const handleSaveSponsor = async (data: { name: string; bio: string; photo_url: string | null; website: string | null }) => {
    if (editingSponsor) {
      await updateSponsor.mutateAsync({ id: editingSponsor.id, ...data, website: data.website || "" });
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
  };

  const handleDeleteSponsor = async () => {
    if (!deleteTarget || deleteTarget.type !== "sponsor") return;
    try {
      await deleteSponsor.mutateAsync({ id: deleteTarget.id, eventId });
      toast.success("Sponsor deleted");
    } catch (error) {
      toast.error("Failed to delete sponsor");
    }
    setDeleteTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "celebrity") {
      handleUnlinkCelebrity();
    } else {
      handleDeleteSponsor();
    }
  };

  return (
    <div className="space-y-6">
      {/* Celebrities Section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            <h3 className="font-display text-lg text-foreground">Celebrities</h3>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Link className="mr-1 h-4 w-4" />
              Import
            </Button>
            <Button size="sm" onClick={handleAddNewCelebrity}>
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {loadingCelebrities ? (
          <div className="animate-pulse space-y-2">
            <div className="h-16 rounded-lg bg-secondary" />
            <div className="h-16 rounded-lg bg-secondary" />
          </div>
        ) : celebrityLinks.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No celebrities added yet. Import from database or create new.
          </p>
        ) : (
          <div className="space-y-2">
            {celebrityLinks.map((link) => {
              const celebrity = link.celebrity;
              if (!celebrity) return null;
              return (
                <div key={link.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                    {celebrity.photo_url ? (
                      <img src={celebrity.photo_url} alt={celebrity.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate font-medium text-foreground">{celebrity.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{celebrity.bio}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCelebrity(celebrity)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget({ id: celebrity.id, type: "celebrity", name: celebrity.name })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
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
          <Button size="sm" onClick={handleAddSponsor}>
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
              <div key={sponsor.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                  {sponsor.photo_url ? (
                    <img src={sponsor.photo_url} alt={sponsor.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate font-medium text-foreground">{sponsor.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{sponsor.bio}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditSponsor(sponsor)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget({ id: sponsor.id, type: "sponsor", name: sponsor.name })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Celebrity Form Dialog */}
      <CelebrityFormDialog
        isOpen={celebrityFormOpen}
        onClose={() => {
          setCelebrityFormOpen(false);
          setEditingCelebrity(null);
        }}
        existingCelebrity={editingCelebrity || undefined}
        onSave={handleSaveCelebrity}
      />

      {/* Import Celebrity Dialog */}
      <CelebrityImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportCelebrity}
        excludeIds={linkedCelebrityIds}
      />

      {/* Sponsor Form Dialog */}
      <GuestFormDialog
        isOpen={sponsorFormOpen}
        onClose={() => {
          setSponsorFormOpen(false);
          setEditingSponsor(null);
        }}
        eventId={eventId}
        type="sponsor"
        existingGuest={editingSponsor || undefined}
        onSave={handleSaveSponsor}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteTarget?.type === "celebrity" ? "Unlink celebrity?" : "Delete sponsor?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "celebrity"
                ? `This will remove ${deleteTarget?.name} from this event only. The celebrity will remain in the database and can be linked to other events.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {deleteTarget?.type === "celebrity" ? "Unlink" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventGuestsManager;
