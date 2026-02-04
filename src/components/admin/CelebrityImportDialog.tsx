import { useState } from "react";
import { Search, User, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCelebrities, Celebrity } from "@/hooks/useCelebrities";

interface CelebrityImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (celebrity: Celebrity) => void;
  excludeIds?: string[];
}

const CelebrityImportDialog = ({
  isOpen,
  onClose,
  onImport,
  excludeIds = [],
}: CelebrityImportDialogProps) => {
  const { data: allCelebrities = [], isLoading } = useCelebrities();
  const [searchQuery, setSearchQuery] = useState("");

  const availableCelebrities = allCelebrities.filter(
    (c) => !excludeIds.includes(c.id)
  );

  const filteredCelebrities = availableCelebrities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImport = (celebrity: Celebrity) => {
    onImport(celebrity);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Celebrity from Database</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search celebrities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading celebrities...
              </div>
            ) : filteredCelebrities.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {searchQuery ? "No celebrities match your search" : "No celebrities available to import"}
              </div>
            ) : (
              filteredCelebrities.map((celebrity) => (
                <div
                  key={celebrity.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-secondary/50"
                >
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                    {celebrity.photo_url ? (
                      <img
                        src={celebrity.photo_url}
                        alt={celebrity.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{celebrity.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{celebrity.bio}</p>
                  </div>
                  <Button size="sm" onClick={() => handleImport(celebrity)}>
                    <Check className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>

          {availableCelebrities.length > 0 && excludeIds.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {excludeIds.length} celebrity(ies) already linked to this event
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CelebrityImportDialog;
