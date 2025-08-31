// @ts-check

import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import { defineConfig } from "eslint/config"
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.node },
        rules: {
            semi: ["error", "never"],
        }
    },
    tseslint.configs.recommended,
    prettierConfig,
])
