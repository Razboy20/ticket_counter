module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    browser: false,
  },
  extends: [
    "eslint:recommended",
    /** @see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#recommended-configs */
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:solid/typescript",
    "@unocss",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    allowAutomaticSingleRunInference: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    extraFileExtensions: [".json"],
  },
  plugins: ["@typescript-eslint", "solid", "prettier"],
  ignorePatterns: ["node_modules/**", "**/dist/**", "!**/.*", "pnpm-lock.yaml"],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
        fixStyle: "separate-type-imports",
      },
    ],
    /**
     * Having a semicolon helps the optimizer interpret your code correctly.
     * This avoids rare errors in optimized code.
     * @see https://twitter.com/alex_kozack/status/1364210394328408066
     */
    semi: ["error", "always"],
    /**
     * This will make the history of changes in the hit a little cleaner
     */
    "comma-dangle": ["warn", "only-multiline"],
    /**
     * Just for beauty
     */
    quotes: [
      "warn",
      "double",
      {
        avoidEscape: true,
      },
    ],
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/unbound-method": "off",
    "solid/self-closing-comp": "off",
    "solid/jsx-no-undef": "off",
  },
};
