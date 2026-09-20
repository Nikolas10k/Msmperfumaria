import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skills de terceiros instaladas via `npx skills add` — código vendorizado,
    // não faz parte da aplicação.
    ".claude/skills/**",
    ".agents/skills/**",
  ]),
]);

export default eslintConfig;
