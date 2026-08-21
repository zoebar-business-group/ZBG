import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

/**
 * ANSWER-FIRST BLOCK — Strategy 5.2, applied to every content page.
 *
 *   1. An H2 phrased as the buyer's actual question.
 *   2. A 40–60 word self-contained answer directly beneath: numbers, place
 *      names, altitudes, dates. No back-references. It must survive being
 *      quoted alone.
 *   3. Then the depth for the human reader.
 *
 * The answer is a plain <p> in the DOM — never inside a tab, accordion or
 * JS-only component, because an answer engine has to be able to lift it out
 * (Directive 19).
 */

export interface QA {
  question: string;
  /** Keep to 40–60 words and fully self-contained. */
  answer: string;
}

export function Answer({
  id,
  question,
  answer,
  children,
  onDark = false,
  className,
}: QA & {
  id?: string;
  children?: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col", className)}>
      <h2
        id={id}
        className={clsx(
          "max-w-[24ch] text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.16] tracking-[-0.01em]",
          onDark ? "text-alabaster" : "text-ink",
        )}
      >
        {question}
      </h2>
      <p
        className={clsx(
          "mt-5 max-w-[58ch] font-sans text-[1.0625rem] leading-[1.65]",
          onDark ? "text-[#cfd9d6]" : "text-[#3d423a]",
        )}
      >
        {answer}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

/**
 * FAQ list. Rendered as a definition list in plain HTML — deliberately not an
 * accordion, so every answer is present and extractable without interaction.
 */
export function FaqList({
  faqs,
  onDark = false,
  className,
}: {
  faqs: ReadonlyArray<QA>;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <dl className={clsx("flex flex-col", className)}>
      {faqs.map((f) => (
        <div
          key={f.question}
          className={clsx(
            "border-t py-7",
            onDark ? "border-[rgba(240,226,203,0.18)]" : "border-[#e2dbcd]",
          )}
        >
          <dt
            className={clsx(
              "max-w-[46ch] font-display text-[1.25rem] leading-snug",
              onDark ? "text-alabaster" : "text-ink",
            )}
          >
            {f.question}
          </dt>
          <dd
            className={clsx(
              "mt-3 max-w-[58ch] font-sans text-[0.9375rem] leading-[1.65]",
              onDark ? "text-[#9db3b0]" : "text-[#5a5f56]",
            )}
          >
            {f.answer}
          </dd>
        </div>
      ))}
    </dl>
  );
}
