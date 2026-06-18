import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
  {
    // eslint-config-next 16 promotes the new React Compiler readiness checks to
    // errors. They flag pre-existing patterns (incl. vendored shadcn UI) that are
    // runtime-correct, so we keep them as warnings instead of blocking lint.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/set-state-in-render": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
    },
  },
];

export default eslintConfig;
