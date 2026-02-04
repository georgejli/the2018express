import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface SortableGuestItemProps {
  id: string;
  name: string;
  bio: string;
  photoUrl: string | null;
  isFeatured?: boolean;
  showFeaturedToggle?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured?: () => void;
}

const SortableGuestItem = ({
  id,
  name,
  bio,
  photoUrl,
  isFeatured,
  showFeaturedToggle = false,
  onEdit,
  onDelete,
  onToggleFeatured,
}: SortableGuestItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 ${
        isDragging ? "opacity-50 shadow-lg" : ""
      } ${showFeaturedToggle && !isFeatured ? "opacity-70" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-foreground">{name}</p>
          {showFeaturedToggle && isFeatured && (
            <span className="rounded bg-accent/20 px-1.5 py-0.5 text-xs text-accent">Featured</span>
          )}
        </div>
        <p className="truncate text-sm text-muted-foreground">{bio}</p>
      </div>

      <div className="flex items-center gap-2">
        {showFeaturedToggle && onToggleFeatured && (
          <div
            className="flex items-center gap-2"
            title={isFeatured ? "Featured on homepage" : "Not featured"}
          >
            {isFeatured ? (
              <Eye className="h-4 w-4 text-muted-foreground" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch checked={isFeatured} onCheckedChange={onToggleFeatured} />
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default SortableGuestItem;
