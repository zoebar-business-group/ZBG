import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next, but matched at ANY depth.
    //
    // The unqualified ".next/**" only ignores the build output sitting at the
    // repo root. Git worktrees under .claude/worktrees/ are separate checkouts
    // of this same repository and each carries its own .next directory, so a
    // bare `eslint` at the root walked into generated Turbopack bundles and
    // reported ~4000 problems in code nobody here wrote. Anchor every pattern
    // with ** so a nested checkout cannot reintroduce the noise.
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    "**/node_modules/**",
    ".claude/**",
    // qa/ is the verification harness: standalone Node scripts that drive a
    // headless browser and are never imported, bundled or shipped. This config
    // is eslint-config-next — React and Core Web Vitals rules aimed at the
    // application in src/ — and applying it to Playwright scripts only reports
    // style nits from a different idiom. The "lint must stay clean" invariant
    // is about the app, and it still holds for every file that becomes one.
    "qa/**",
  ]),
]);

export default eslintConfig;
