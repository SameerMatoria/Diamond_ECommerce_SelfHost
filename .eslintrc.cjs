module.exports = {
  root: true,
  env: {
    es2021: true
  },
  extends: ["eslint:recommended", "plugin:import/recommended", "prettier"],
  plugins: ["import"],
  overrides: [
    {
      files: ["server/**/*.js"],
      env: { node: true },
      parserOptions: { ecmaVersion: "latest", sourceType: "script" }
    },
    {
      files: ["web/**/*.{js,jsx}"],
      env: { browser: true, node: true },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      plugins: ["react", "react-hooks"],
      extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/recommended",
        "prettier"
      ],
      settings: { react: { version: "detect" } }
    }
  ]
};
