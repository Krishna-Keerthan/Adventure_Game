export function GoldDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
      {label && (
        <span
          className="text-xs text-primary/60 tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {label}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
    </div>
  )
}