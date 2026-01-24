import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface ResponsiveDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
});

const ResponsiveDialog = ({ open, onOpenChange, children }: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ResponsiveDialogContext.Provider value={{ isMobile: true }}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      </ResponsiveDialogContext.Provider>
    );
  }

  return (
    <ResponsiveDialogContext.Provider value={{ isMobile: false }}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ResponsiveDialogContext.Provider>
  );
};

const ResponsiveDialogContent = ({ children, className }: ResponsiveDialogContentProps) => {
  const { isMobile } = React.useContext(ResponsiveDialogContext);

  if (isMobile) {
    return (
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        <div className="overflow-y-auto px-4 pb-6">
          {children}
        </div>
      </DrawerContent>
    );
  }

  return (
    <DialogContent className={cn("max-h-[90vh] overflow-y-auto", className)}>
      {children}
    </DialogContent>
  );
};

const ResponsiveDialogHeader = ({ children, className }: ResponsiveDialogHeaderProps) => {
  const { isMobile } = React.useContext(ResponsiveDialogContext);

  if (isMobile) {
    return <DrawerHeader className={cn("text-left", className)}>{children}</DrawerHeader>;
  }

  return <DialogHeader className={className}>{children}</DialogHeader>;
};

const ResponsiveDialogTitle = ({ children, className }: ResponsiveDialogTitleProps) => {
  const { isMobile } = React.useContext(ResponsiveDialogContext);

  if (isMobile) {
    return <DrawerTitle className={className}>{children}</DrawerTitle>;
  }

  return <DialogTitle className={className}>{children}</DialogTitle>;
};

const ResponsiveDialogDescription = ({ children, className }: ResponsiveDialogDescriptionProps) => {
  const { isMobile } = React.useContext(ResponsiveDialogContext);

  if (isMobile) {
    return <DrawerDescription className={className}>{children}</DrawerDescription>;
  }

  return <DialogDescription className={className}>{children}</DialogDescription>;
};

const ResponsiveDialogFooter = ({ children, className }: ResponsiveDialogFooterProps) => {
  const { isMobile } = React.useContext(ResponsiveDialogContext);

  if (isMobile) {
    return <DrawerFooter className={className}>{children}</DrawerFooter>;
  }

  return <DialogFooter className={className}>{children}</DialogFooter>;
};

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
};
