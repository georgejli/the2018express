import { useState } from "react";
import { Plus, Star, Award, User, Link } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  useAddCelebrity,
  useUpdateCelebrity,
  useLinkCelebrityToEvent,
  useUnlinkCelebrityFromEvent,
  useReorderEventCelebrities,
  Celebrity,
  EventCelebrityLink,
} from "@/hooks/useCelebrities";
import {
  useEventSponsors,
  useAddSponsor,
  useUpdateSponsor,
  useDeleteSponsor,
  useReorderSponsors,
  EventSponsor,
} from "@/hooks/useEventGuests";
import CelebrityFormDialog from "./CelebrityFormDialog";
import CelebrityImportDialog from "./CelebrityImportDialog";
import GuestFormDialog from "./GuestFormDialog";
import SortableGuestItem from "./SortableGuestItem";

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
  const reorderEventCelebrities = useReorderEventCelebrities();

  const addSponsor = useAddSponsor();
  const updateSponsor = useUpdateSponsor();
  const deleteSponsor = useDeleteSponsor();
  const reorderSponsors = useReorderSponsors();

  const [celebrityFormOpen, setCelebrityFormOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<Celebrity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "celebrity" | "sponsor"; name: string } | null>(null);

  const [sponsorFormOpen, setSponsorFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<EventSponsor | null>(null);

  const linkedCelebrityIds = celebrityLinks.map((l) => l.celebrity_id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleCelebrityDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = celebrityLinks.findIndex((l) => l.id === active.id);
      const newIndex = celebrityLinks.findIndex((l) => l.id === over.id);

      const reordered = arrayMove(celebrityLinks, oldIndex, newIndex);
      const updates = reordered.map((l, index) => ({
        id: l.id,
        display_order: index,
      }));

      try {
        await reorderEventCelebrities.mutateAsync({ eventId, updates });
        toast.success("Order updated");
      } catch (error) {
        toast.error("Failed to update order");
      }
    }
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

  const handleSponsorDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sponsors.findIndex((s) => s.id === active.id);
      const newIndex = sponsors.findIndex((s) => s.id === over.id);

      const reordered = arrayMove(sponsors, oldIndex, newIndex);
      const updates = reordered.map((s, index) => ({
        id: s.id,
        display_order: index,
      }));

      try {
        await reorderSponsors.mutateAsync({ eventId, updates });
        toast.success("Order updated");
      } catch (error) {
        toast.error("Failed to update order");
      }
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCelebrityDragEnd}
          >
            <SortableContext
              items={celebrityLinks.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {celebrityLinks.map((link) => {
                  const celebrity = link.celebrity;
                  if (!celebrity) return null;
                  return (
                    <SortableGuestItem
                      key={link.id}
                      id={link.id}
                      name={celebrity.name}
                      bio={celebrity.bio}
                      photoUrl={celebrity.photo_url}
                      onEdit={() => handleEditCelebrity(celebrity)}
                      onDelete={() => setDeleteTarget({ id: celebrity.id, type: "celebrity", name: celebrity.name })}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSponsorDragEnd}
          >
            <SortableContext
              items={sponsors.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sponsors.map((sponsor) => (
                  <SortableGuestItem
                    key={sponsor.id}
                    id={sponsor.id}
                    name={sponsor.name}
                    bio={sponsor.bio}
                    photoUrl={sponsor.photo_url}
                    onEdit={() => handleEditSponsor(sponsor)}
                    onDelete={() => setDeleteTarget({ id: sponsor.id, type: "sponsor", name: sponsor.name })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
