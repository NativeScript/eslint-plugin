import { TSESTree } from "@typescript-eslint/experimental-utils";
import { createESLintRule, getRemoveNodeRange } from "../utils";

export type Options = [];

export type MessageIds = "import";

const NATIVESCRIPT_MODULES = [
    "@nativescript/core",
    "@nativescript/angular"
];

export default createESLintRule<Options, MessageIds>({
    name: "no-duplicate-ns-imports",
    meta: {
        type: "suggestion",
        docs: {
            category: "Best Practices",
            description: "Disallow duplicated imports from NativeScript packages",
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
        const nsImports: Map<string, Array<TSESTree.ImportDeclaration>> = new Map();

        return {
            ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
                const { source } = node;
                const { value, raw } = source;

                if (typeof value === "string" && NATIVESCRIPT_MODULES.includes(value)) {
                    const imports = nsImports.get(raw) || [];
                    imports.push(node);
                    nsImports.set(raw, imports);
                }
            },
            "Program:exit"() {
                for (const [path, imports] of nsImports) {
                    if (imports.length < 2) {
                        return;
                    }

                    const specifiers = imports.reduce(
                        (all, importNode) => [...all, ...importNode.specifiers],
                        []
                    );

                    const specifierValuesText = getSpecifierValues(specifiers);
                    if (!specifierValuesText) {
                        return null;
                    }

                    const [firstImportNode] = imports;

                    context.report({
                        node: firstImportNode,
                        messageId: "import",
                        data: {
                            module: firstImportNode.source.value,
                        },
                        fix: (fixer) => {
                            const fixedImport = `import ${specifierValuesText} from ${path};`;
                            const replaceFirstFix = fixer.replaceText(firstImportNode, fixedImport);
                            const sourceCode = context.getSourceCode().getText();
                            const removeNodesFixes = imports
                                .slice(1)
                                .map((node) => getRemoveNodeRange(node, sourceCode))
                                .map((nodeRange) => fixer.removeRange(nodeRange));

                            return [replaceFirstFix, ...removeNodesFixes];
                        },
                    });
                }
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
