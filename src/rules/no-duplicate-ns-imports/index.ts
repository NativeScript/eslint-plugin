import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";
import { getRemoveNodeRange } from "../utils";
export const createESLintRule = ESLintUtils.RuleCreator(() => ``);

export type Options = [];

export type MessageIds = "import";

export default createESLintRule<Options, MessageIds>({
    name: "no-tns-core-modules-imports",
    meta: {
        type: "suggestion",
        docs: {
            category: "Best Practices",
            description: "Disallow use of tns-core-modules imports",
            recommended: "warn",
        },
        messages: {
            import: "'{{module}}' import is duplicated.",
        },
        schema: [{}],
        fixable: "code",
    },
    defaultOptions: [],
    create(context) {
        const nsCoreImports: Array<TSESTree.ImportDeclaration> = [];

        return {
            ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
                const { source } = node;
                if (source.value === "@nativescript/core") {
                    nsCoreImports.push(node);
                }
            },
            "Program:exit"() {
                if (nsCoreImports.length < 2) {
                    return;
                }

                const specifiers = nsCoreImports.reduce(
                    (all, importNode) => [...all, ...importNode.specifiers],
                    [],
                );

                const specifierValuesText = getSpecifierValues(specifiers);
                if (!specifierValuesText) {
                    return null;
                }

                const [firstImportNode] = nsCoreImports;

                context.report({
                    node: firstImportNode,
                    messageId: "import",
                    data: {
                        module: firstImportNode.source.value,
                    },
                    fix: (fixer) => {
                        const fixedImport = `import ${specifierValuesText} from '@nativescript/core';`;
                        const replaceFirstFix = fixer.replaceText(firstImportNode, fixedImport);
                        const source = context.getSourceCode().getText();
                        const removeNodesFixes = nsCoreImports
                            .slice(1)
                            .map((node) => getRemoveNodeRange(node, source))
                            .map((nodeRange) => fixer.removeRange(nodeRange));

                        return [replaceFirstFix, ...removeNodesFixes];
                    },
                });
            },
        };
    },
});

function getSpecifierValues(specifiers: Array<TSESTree.ImportClause>) {
    const importSpecifiers: Array<string> = [];
    let defaultExport: string | undefined;
    let namespaceSpecifier: string | undefined;

    specifiers.forEach((specifier) => {
        if (specifier.type === "ImportDefaultSpecifier") {
            defaultExport = specifier.local.name;
        } else if (specifier.type === "ImportNamespaceSpecifier") {
            namespaceSpecifier = `* as ${specifier.local.name}`;
        } else {
            const { imported, local } = specifier;
            importSpecifiers.push(imported.name === local.name ? imported.name : `${imported.name} as ${local.name}`);
        }
    });

    if (importSpecifiers.length && namespaceSpecifier) {
        return;
    } else if (importSpecifiers.length) {
        const specifiersText = `{ ${importSpecifiers.join(", ")} }`;

        return defaultExport ? `${defaultExport}, ${specifiersText}` : specifiersText;
    } else if (namespaceSpecifier) {
        return defaultExport ? `${defaultExport}, ${namespaceSpecifier}` : namespaceSpecifier;
    } else if (defaultExport) {
        return defaultExport;
    }
}
