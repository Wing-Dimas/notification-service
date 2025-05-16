import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(["dist", "src/generated"]),
  {
    extends: compat.extends(
      "prettier",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended",
    ),

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: "module",
    },

    rules: {
      "@typescript-eslint/explicit-member-accessibility": 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/no-parameter-properties": 0,
      "@typescript-eslint/interface-name-prefix": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unused-vars": "off",

      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
]);
