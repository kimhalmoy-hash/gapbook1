import { ReactNode } from "react";

export function PageShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto px-4 py-10 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
      {children}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-card px-3 py-2 outline-none focus:border-pine";

export function ErrorText({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <p className="rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay-dark">
      {error}
    </p>
  );
}

export function PrimaryButton({
  children,
  pending = false,
}: {
  children: ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      className="rounded-full bg-clay px-5 py-2.5 text-white hover:bg-clay-dark disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Lagrer…" : children}
    </button>
  );
}
