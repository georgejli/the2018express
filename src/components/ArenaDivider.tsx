interface ArenaDividerProps {
  variant?: "gradient" | "spotlight" | "double";
}

const ArenaDivider = ({ variant = "gradient" }: ArenaDividerProps) => {
  if (variant === "spotlight") {
    return (
      <div className="relative h-24 overflow-hidden">
        {/* Spotlight beams */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -left-20 h-24 w-64 rotate-12 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-2xl" />
          <div className="absolute -right-20 h-24 w-64 -rotate-12 bg-gradient-to-r from-transparent via-accent/10 to-transparent blur-2xl" />
        </div>
        {/* Center line */}
        <div className="absolute left-1/2 top-1/2 h-px w-48 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>
    );
  }

  if (variant === "double") {
    return (
      <div className="relative py-1">
        {/* Orange stripe */}
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        {/* Gap */}
        <div className="h-1" />
        {/* Blue stripe */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
    );
  }

  // Default gradient variant
  return (
    <div className="relative h-16 overflow-hidden">
      {/* Arena gradient sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-1/4" />
      {/* Center accent line */}
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2">
        <div className="mx-auto h-full w-3/4 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      </div>
    </div>
  );
};

export default ArenaDivider;
