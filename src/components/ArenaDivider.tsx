interface ArenaDividerProps {
  variant?: "lightbar" | "nav";
}

const ArenaDivider = ({ variant = "lightbar" }: ArenaDividerProps) => {
  if (variant === "nav") {
    return (
      <div className="relative">
        <div className="h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/40" />
        <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
      </div>
    );
  }

  // Lightbar variant - simple orange and blue light bars
  return (
    <div className="relative py-2">
      <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
      <div className="h-1.5" />
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
    </div>
  );
};

export default ArenaDivider;
