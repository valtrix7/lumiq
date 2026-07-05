import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored Bklit (@bklit) chart registry components — generated third-party
    // source maintained upstream, not linted against our app rules.
    "src/components/charts/**",
    "src/components/shimmering-text.tsx",
  ]),
]);

export default eslintConfig;
