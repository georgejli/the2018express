import { useState } from "react";
import { Plus, Pencil, Trash2, User, Eye, EyeOff } from "lucide-react";
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
  useCelebrities,
  useAddCelebrity,
  useUpdateCelebrity,
  useDeleteCelebrity,
  Celebrity,
} from "@/hooks/useCelebrities";
import CelebrityFormDialog from "./CelebrityFormDialog";

const FeaturedCelebritiesManager = () => {
  const { data: allCelebrities = [], isLoading } = useCelebrities();

  const addCelebrity = useAddCelebrity();
  const updateCelebrity = useUpdateCelebrity();
  const deleteCelebrity = useDeleteCelebrity();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<Celebrity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Celebrity | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Manage all celebrities. Toggle visibility to show on homepage "Past Celebrity Guests" section.
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
        <div className="space-y-3">
          {allCelebrities.map((celebrity) => (
            <div
              key={celebrity.id}
              className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 ${
                !celebrity.is_featured ? "opacity-70" : ""
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
                  {celebrity.is_featured && (
                    <span className="rounded bg-accent/20 px-1.5 py-0.5 text-xs text-accent">Featured</span>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">{celebrity.bio}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2" title={celebrity.is_featured ? "Featured on homepage" : "Not featured"}>
                  {celebrity.is_featured ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  <Switch
                    checked={celebrity.is_featured}
                    onCheckedChange={() => handleToggleFeatured(celebrity)}
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
