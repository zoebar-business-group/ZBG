/**
 * Minimal class joiner. Deliberately not a dependency — the site ships no
 * utility library it does not need (Directive 21: avoid unnecessary libraries).
 */
export function clsx(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
