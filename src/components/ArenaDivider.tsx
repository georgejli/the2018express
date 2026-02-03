interface ArenaDividerProps {
  variant?: "gradient" | "spotlight" | "double" | "nav";
}

const ArenaDivider = ({ variant = "gradient" }: ArenaDividerProps) => {
  if (variant === "nav") {
    return (
      <div className="relative">
        {/* Orange stripe */}
        <div className="h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/40" />
        {/* Blue stripe */}
        <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      </div>
    );
  }

  if (variant === "spotlight") {
    return (
      <div className="relative h-32 overflow-hidden">
        {/* Spotlight beams */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute h-48 w-48 rounded-full bg-accent/30 blur-[80px]" />
          <div className="absolute -left-10 h-32 w-80 rotate-12 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-3xl" />
          <div className="absolute -right-10 h-32 w-80 -rotate-12 bg-gradient-to-r from-transparent via-accent/20 to-transparent blur-3xl" />
        </div>
        {/* Center line */}
        <div className="absolute left-1/2 top-1/2 h-0.5 w-64 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-accent to-transparent" />
      </div>
    );
  }

  if (variant === "double") {
    return (
      <div className="relative py-1.5">
        {/* Orange stripe */}
        <div className="h-1.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
        {/* Gap */}
        <div className="h-1.5" />
        {/* Blue stripe */}
        <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
    );
  }

  // Default gradient variant
  return (
    <div className="relative h-24 overflow-hidden">
      {/* Arena gradient sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 translate-x-1/4" />
      {/* Center accent line */}
      <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2">
        <div className="mx-auto h-full w-3/4 bg-gradient-to-r from-transparent via-accent to-transparent" />
      </div>
    </div>
  );
};

export default ArenaDivider;
