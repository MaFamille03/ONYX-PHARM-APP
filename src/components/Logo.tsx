export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-onyx-900">
        <span className="text-sm font-bold tracking-tight text-accent-400">
          OP
        </span>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight text-onyx-900">
          ONYX PHARM
        </p>
        <p className="text-[11px] text-onyx-400">Gestion intégrée</p>
      </div>
    </div>
  );
}
