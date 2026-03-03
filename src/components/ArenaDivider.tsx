interface ArenaDividerProps {
  variant?: "lightbar" | "nav";
}

const ArenaDivider = ({ variant = "lightbar" }: ArenaDividerProps) => {
  if (variant === "nav") {
    return (
      <div className="h-[3px] bg-gradient-to-r from-primary via-accent to-primary" />
    );
  }

  return (
    <div className="h-px bg-border" />
  );
};

export default ArenaDivider;
