import { setLandingLocale } from "@/lib/actions/locale";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";

export function LanguageSwitch({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 text-xs uppercase tracking-[0.14em]"
      role="group"
      aria-label={label}
    >
      {LOCALES.map((item) => {
        const active = item === locale;
        return (
          <form key={item} action={setLandingLocale}>
            <input type="hidden" name="locale" value={item} />
            <button
              type="submit"
              className={
                active
                  ? "rounded-full bg-pine px-2.5 py-1 text-white"
                  : "rounded-full px-2.5 py-1 text-muted hover:text-ink"
              }
              aria-pressed={active}
              aria-label={LOCALE_LABELS[item]}
            >
              {item}
            </button>
          </form>
        );
      })}
    </div>
  );
}
