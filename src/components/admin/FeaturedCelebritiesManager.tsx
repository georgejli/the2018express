import { useState } from "react";
import { Plus, Pencil, Trash2, User, Eye, EyeOff, Import } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useFeaturedCelebrities,
  useAddFeaturedCelebrity,
  useUpdateFeaturedCelebrity,
  useDeleteFeaturedCelebrity,
  FeaturedCelebrity,
} from "@/hooks/useFeaturedCelebrities";
import { useEventCelebrities, EventCelebrity } from "@/hooks/useEventGuests";
import { useEvents } from "@/hooks/useEvents";
import FeaturedCelebrityForm from "./FeaturedCelebrityForm";

const FeaturedCelebritiesManager = () => {
  const { data: celebrities = [], isLoading } = useFeaturedCelebrities(false);
  const { events } = useEvents();

  const addCelebrity = useAddFeaturedCelebrity();
  const updateCelebrity = useUpdateFeaturedCelebrity();
  const deleteCelebrity = useDeleteFeaturedCelebrity();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<FeaturedCelebrity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeaturedCelebrity | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingCelebrity(null);
    setFormOpen(true);
  };

  const openEditForm = (celebrity: FeaturedCelebrity) => {
    setEditingCelebrity(celebrity);
    setFormOpen(true);
  };

  const handleSave = async (data: { name: string; bio: string; photo_url: string | null; website: string | null }) => {
    try {
      if (editingCelebrity) {
        await updateCelebrity.mutateAsync({ id: editingCelebrity.id, ...data });
        toast.success("Celebrity updated");
      } else {
        await addCelebrity.mutateAsync({
          ...data,
          display_order: celebrities.length,
          is_active: true,
        });
        toast.success("Celebrity added");
      }
      setFormOpen(false);
      setEditingCelebrity(null);
    } catch (error) {
      toast.error("Failed to save celebrity");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCelebrity.mutateAsync(deleteTarget.id);
      toast.success("Celebrity deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
    setDeleteTarget(null);
  };

  const handleToggleActive = async (celebrity: FeaturedCelebrity) => {
    try {
      await updateCelebrity.mutateAsync({ id: celebrity.id, is_active: !celebrity.is_active });
      toast.success(celebrity.is_active ? "Celebrity hidden from homepage" : "Celebrity shown on homepage");
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleImportFromEvent = async (eventCelebrity: EventCelebrity) => {
    try {
      await addCelebrity.mutateAsync({
        name: eventCelebrity.name,
        bio: eventCelebrity.bio,
        photo_url: eventCelebrity.photo_url,
        website: eventCelebrity.website,
        display_order: celebrities.length,
        is_active: true,
      });
      toast.success(`Imported ${eventCelebrity.name}`);
    } catch (error) {
      toast.error("Failed to import celebrity");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Manage celebrities that appear on the homepage "Past Celebrity Guests" section.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
            <Import className="mr-2 h-4 w-4" />
            Import from Event
          </Button>
          <Button size="sm" onClick={openAddForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Celebrity
          </Button>
        </div>
      </div>

      {/* Celebrities List */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 rounded-lg bg-secondary" />
          <div className="h-16 rounded-lg bg-secondary" />
        </div>
      ) : celebrities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No featured celebrities yet</p>
          <p className="text-sm text-muted-foreground">Add celebrities to show them on the homepage</p>
        </div>
      ) : (
        <div className="space-y-3">
          {celebrities.map((celebrity) => (
            <div
              key={celebrity.id}
              className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 ${
                !celebrity.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                {celebrity.photo_url ? (
                  <img src={celebrity.photo_url} alt={celebrity.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{celebrity.name}</p>
                  {!celebrity.is_active && (
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">Hidden</span>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">{celebrity.bio}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2" title={celebrity.is_active ? "Visible on homepage" : "Hidden from homepage"}>
                  {celebrity.is_active ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Switch
                    checked={celebrity.is_active}
                    onCheckedChange={() => handleToggleActive(celebrity)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditForm(celebrity)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(celebrity)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Dialog */}
      <FeaturedCelebrityForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCelebrity(null);
        }}
        existingCelebrity={editingCelebrity || undefined}
        onSave={handleSave}
      />

      {/* Import from Event Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import from Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select an event to import celebrities from:
            </p>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {events.map((event) => (
                <EventCelebritiesImport
                  key={event.id}
                  eventId={event.id}
                  eventLabel={`${event.month} ${event.date}, ${event.year}`}
                  isExpanded={selectedEventId === event.id}
                  onToggle={() => setSelectedEventId(selectedEventId === event.id ? null : event.id)}
                  onImport={handleImportFromEvent}
                  existingNames={celebrities.map((c) => c.name.toLowerCase())}
                />
              ))}
              {events.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No events found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete celebrity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{deleteTarget?.name}</strong> from the featured celebrities. This action cannot be undone.
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

// Sub-component for importing celebrities from a specific event
interface EventCelebritiesImportProps {
  eventId: string;
  eventLabel: string;
  isExpanded: boolean;
  onToggle: () => void;
  onImport: (celebrity: EventCelebrity) => void;
  existingNames: string[];
}

const EventCelebritiesImport = ({
  eventId,
  eventLabel,
  isExpanded,
  onToggle,
  onImport,
  existingNames,
}: EventCelebritiesImportProps) => {
  const { data: celebrities = [], isLoading } = useEventCelebrities(isExpanded ? eventId : undefined);

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 text-left hover:bg-secondary/50"
      >
        <span className="font-medium text-foreground">{eventLabel}</span>
        <span className="text-sm text-muted-foreground">{isExpanded ? "−" : "+"}</span>
      </button>
      {isExpanded && (
        <div className="border-t border-border p-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : celebrities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No celebrities for this event</p>
          ) : (
            <div className="space-y-2">
              {celebrities.map((celebrity) => {
                const alreadyImported = existingNames.includes(celebrity.name.toLowerCase());
                return (
                  <div key={celebrity.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-secondary">
                        {celebrity.photo_url ? (
                          <img src={celebrity.photo_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-foreground">{celebrity.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant={alreadyImported ? "outline" : "default"}
                      onClick={() => onImport(celebrity)}
                      disabled={alreadyImported}
                    >
                      {alreadyImported ? "Already Added" : "Import"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeaturedCelebritiesManager;
