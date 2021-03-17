# NativeScript ESLint Plugin

This package contains ESLint rules useful for NativeScript projects.

## Installation and setup

1. Install the necessary dependencies.

```
npm i -D @nativescript/eslint-plugin @typescript-eslint/parser eslint
```

2. Add an `.eslintrc.json` config file with the following content.

**.eslintrc.json**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2015
  },
  "plugins": ["@nativescript"],
  "rules": {
        "@nativescript/no-tns-core-modules-imports": "warn",
        "@nativescript/no-duplicate-ns-imports": "warn"
  }
}
```

3. Lint the project.

```
npx eslint --ext=ts src/
```

**Notice that you need to provide the path to your source code. In the example above, that's `src/`. Change it to match your project setup.**

4. Fix all auto-fixable problems.

```
npx eslint --ext=ts --fix src/
```

5. [Optional] Set up VSCode to use `eslint`.

-   Install the `dbaeumer.vscode-eslint` extension.
-   Add the following to your `settings.json` file:

```json
"eslint.validate": [ "typescript", "javascript"],
```
