import { TSESTree } from "@typescript-eslint/experimental-utils";
import { createESLintRule } from "../utils";

export type Options = [];

export type MessageIds = "noNativeScriptAngularImportFailure";

const DEPRECATED_PREFIX = "nativescript-angular";
const NEW_MODULE_PATH = "@nativescript/angular";

export default createESLintRule<Options, MessageIds>({
    name: "no-nativescript-angular-imports",
    meta: {
        type: "suggestion",
        docs: {
            category: "Best Practices",
            description: "Disallow duplicated imports from NativeScript packages",
            recommended: "warn",
        },
        messages: {
            noNativeScriptAngularImportFailure: "Imports from '{{module}}' are deprecated."
        },
        schema: [{}],
        fixable: "code", 
    },
    defaultOptions: [],
    create(context) {
        return {
            ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
                const { source } = node;
                const { value } = source;

                if (typeof value === "string" && value.startsWith(DEPRECATED_PREFIX)) {
                    context.report({
                        node: source,
                        messageId: "noNativeScriptAngularImportFailure",
                        data: {
                            module: value,
                        },
                        fix: fixer => {
                            const { raw: rawPath } = source;
                            const fixedValue = rawPath.replace(value, NEW_MODULE_PATH);

                            return fixer.replaceText(source, fixedValue);
                        }
                    })
                }
            }
        }
    }
});
