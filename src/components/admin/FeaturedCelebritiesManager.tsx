import { useState } from "react";
import { Plus, User } from "lucide-react";
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
  useCelebrities,
  useAddCelebrity,
  useUpdateCelebrity,
  useDeleteCelebrity,
  useReorderCelebrities,
  Celebrity,
} from "@/hooks/useCelebrities";
import CelebrityFormDialog from "./CelebrityFormDialog";
import SortableGuestItem from "./SortableGuestItem";

const FeaturedCelebritiesManager = () => {
  const { data: allCelebrities = [], isLoading } = useCelebrities();

  const addCelebrity = useAddCelebrity();
  const updateCelebrity = useUpdateCelebrity();
  const deleteCelebrity = useDeleteCelebrity();
  const reorderCelebrities = useReorderCelebrities();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<Celebrity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Celebrity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openAddForm = () => {
    setEditingCelebrity(null);
    setFormOpen(true);
  };

  const openEditForm = (celebrity: Celebrity) => {
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
          is_featured: true,
          featured_order: allCelebrities.filter((c) => c.is_featured).length,
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

  const handleToggleFeatured = async (celebrity: Celebrity) => {
    try {
      await updateCelebrity.mutateAsync({
        id: celebrity.id,
        is_featured: !celebrity.is_featured,
        featured_order: celebrity.is_featured ? 0 : allCelebrities.filter((c) => c.is_featured).length,
      });
      toast.success(celebrity.is_featured ? "Celebrity hidden from homepage" : "Celebrity shown on homepage");
    } catch (error) {
      toast.error("Failed to update visibility");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = allCelebrities.findIndex((c) => c.id === active.id);
      const newIndex = allCelebrities.findIndex((c) => c.id === over.id);

      const reordered = arrayMove(allCelebrities, oldIndex, newIndex);
      const updates = reordered.map((c, index) => ({
        id: c.id,
        featured_order: index,
      }));

      try {
        await reorderCelebrities.mutateAsync(updates);
        toast.success("Order updated");
      } catch (error) {
        toast.error("Failed to update order");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Manage all celebrities. Drag to reorder. Toggle visibility to show on homepage.
        </p>
        <Button size="sm" onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Celebrity
        </Button>
      </div>

      {/* Celebrities List */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 rounded-lg bg-secondary" />
          <div className="h-16 rounded-lg bg-secondary" />
        </div>
      ) : allCelebrities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No celebrities yet</p>
          <p className="text-sm text-muted-foreground">Add celebrities to manage them across events</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={allCelebrities.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {allCelebrities.map((celebrity) => (
                <SortableGuestItem
                  key={celebrity.id}
                  id={celebrity.id}
                  name={celebrity.name}
                  bio={celebrity.bio}
                  photoUrl={celebrity.photo_url}
                  isFeatured={celebrity.is_featured}
                  showFeaturedToggle={true}
                  onEdit={() => openEditForm(celebrity)}
                  onDelete={() => setDeleteTarget(celebrity)}
                  onToggleFeatured={() => handleToggleFeatured(celebrity)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Form Dialog */}
      <CelebrityFormDialog
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCelebrity(null);
        }}
        existingCelebrity={editingCelebrity || undefined}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete celebrity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> and remove them from all events. This action cannot be undone.
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

export default FeaturedCelebritiesManager;
