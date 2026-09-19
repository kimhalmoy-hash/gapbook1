const MESSAGES: Record<string, string> = {
  lagret: "Profilen er lagret. Den blir offentlig når admin har godkjent.",
  opprettet: "Sloten er publisert.",
  oppdatert: "Sloten er oppdatert.",
  trukket: "Sloten er trukket fra markedet.",
};

export function Flash({ message }: { message?: string }) {
  if (!message) return null;
  const text = MESSAGES[message] ?? message;
  return (
    <p className="mb-4 rounded-md border border-ok/30 bg-ok/10 px-3 py-2 text-sm text-ok">
      {text}
    </p>
  );
}
