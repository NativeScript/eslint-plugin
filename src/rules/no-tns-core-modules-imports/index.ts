import { TSESTree } from "@typescript-eslint/experimental-utils";
import { RuleContext, RuleFix } from "@typescript-eslint/experimental-utils/dist/ts-eslint";
import { createESLintRule, getRemoveNodeRange } from "../utils";
import {
    DEPRECATED_PATH_MAP,
    DEPRECATED_PATHS,
    RE_EXPORTED_SPECIFIERS,
    RE_EXPORTED,
    UPDATED_SPECIFIERS,
    NESTED_MODULE_EXPORT,
    DEPRECATED_PREFIX,
    NEW_MODULE_PATH,
} from "./paths-reference";

interface FixedId {
    id: TSESTree.Identifier;
    fixedValue: string;
}

interface ImportNodeFixerInfo {
    source: TSESTree.Literal;
    importedSpecifiers: Array<TSESTree.ImportClause>;
    specifiersFixes: Set<string>;
    usedIdsFixes: Set<FixedId>;
    additionalImportsFixes: Set<string>;
    fixedImportPath?: string;
}

export type Options = [];

export type MessageIds = "tnsCoreModulesImportFailure";

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
            tnsCoreModulesImportFailure:
                "Imports from '{{module}}' are deprecated. See https://nativescript.org/blog/nativescript-7-import-reference/.",
        },
        schema: [{}],
        fixable: "code",
    },
    defaultOptions: [],
    create(context) {
        const importedNodesMap: Map<TSESTree.ImportDeclaration, ImportNodeFixerInfo> = new Map();
        const identifiers: Array<TSESTree.Identifier> = [];

        return {
            ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
                const { source } = node;
                if (!isDeprecatedPath(source)) {
                    return;
                }

                importedNodesMap.set(node, {
                    source,
                    importedSpecifiers: node.specifiers,
                    specifiersFixes: new Set(),
                    usedIdsFixes: new Set(),
                    additionalImportsFixes: new Set(),
                });
            },
            ":not(:matches(ImportSpecifier, ImportNamespaceSpecifier, ExportSpecifier, FunctionDeclaration, VariableDeclarator, Property)) > Identifier": (
                node,
            ) => {
                identifiers.push(node);
            },
            VariableDeclarator: (node) => {
                const { init } = node;
                if (init && init.type === "Identifier") {
                    identifiers.push(init);
                }
            },
            Property: (node) => {
                const { value } = node;
                if (value && value.type === "Identifier") {
                    identifiers.push(value);
                }
            },
            FunctionDeclaration: (node) => {
                const params = (node?.params?.filter((param) => !!(param as any).name) || []) as Array<TSESTree.Identifier>;
                identifiers.push(...params);
            },
            "Program:exit"() {
                const importedNamesMap: Map<
                    string,
                    {
                        importNode: TSESTree.ImportDeclaration;
                        source: TSESTree.Literal;
                        specifier: TSESTree.ImportClause;
                    }
                > = new Map();

                for (const [importNode, { source, importedSpecifiers }] of importedNodesMap) {
                    importedSpecifiers.forEach((specifier) =>
                        importedNamesMap.set(specifier.local.name, { importNode, source, specifier }),
                    );
                }

                identifiers.forEach((id) => {
                    const imported = importedNamesMap.get(id.name);
                    const importPath = imported?.source.value?.toString();
                    if (!imported || !importPath) {
                        return;
                    }

                    const nodeFixes = importedNodesMap.get(imported.importNode);
                    if (!nodeFixes) {
                        return;
                    }

                    const isReexportedSpecifier = RE_EXPORTED_SPECIFIERS.includes(id.name);
                    if (isReexportedSpecifier) {
                        addSpecifierFix(id, nodeFixes.specifiersFixes);

                        return;
                    }

                    const newModule = DEPRECATED_PATH_MAP[importPath];
                    if (!newModule) {
                        return;
                    }

                    const { specifier } = imported;
                    if (shouldReplaceSpecifier(specifier)) {
                        const newSpecifier =
                            specifier.type === "ImportNamespaceSpecifier"
                                ? `* as ${specifier.local.name}`
                                : specifier.local.name;
                        const newPath = fixNestedModulePath(importPath);
                        const newImportDeclaration = `import ${newSpecifier} from '${newPath}';\n`;
                        nodeFixes?.additionalImportsFixes.add(newImportDeclaration);

                        return;
                    } else if (newModule === RE_EXPORTED) {
                        addSpecifierFix(id, nodeFixes.specifiersFixes);
                        addMigratedIdentifierFix(
                            id,
                            (imported.specifier as TSESTree.ImportSpecifier).imported,
                            nodeFixes.usedIdsFixes,
                        );

                        return;
                    } else if (newModule === NESTED_MODULE_EXPORT) {
                        nodeFixes.fixedImportPath = fixNestedModulePath(importPath);
                    } else {
                        nodeFixes.specifiersFixes.add(newModule);
                    }

                    let fixedValue: string;
                    if (shouldReplaceSpecifier(specifier)) {
                        fixedValue = newModule;
                    } else {
                        const name = (specifier as TSESTree.ImportSpecifier).imported.name;
                        const newIdentifier = UPDATED_SPECIFIERS[name] || name;
                        fixedValue = newModule === NESTED_MODULE_EXPORT ?
                            newIdentifier :
                            `${newModule}.${newIdentifier}`;
                    }

                    const fixes = importedNodesMap.get(imported.importNode)?.usedIdsFixes || new Set();
                    fixes.add({ id, fixedValue });
                });

                importedNodesMap.forEach((fixesData, importNode) =>
                    fixImportDeclaration(importNode, context, fixesData));
            },
        };
    },
});

function addSpecifierFix(id: TSESTree.Identifier, fixes: Set<string>) {
    const { name } = id;
    const migrated = UPDATED_SPECIFIERS[name];
    fixes.add(migrated || name);
}

function addMigratedIdentifierFix(used: TSESTree.Identifier, imported: TSESTree.Identifier, fixes: Set<FixedId>) {
    const name = imported.name;
    const migrated = UPDATED_SPECIFIERS[name];
    if (migrated) {
        fixes.add({ id: used, fixedValue: migrated });
    }
}

function fixImportDeclaration(
    importNode: TSESTree.ImportDeclaration,
    context: RuleContext<any, any>,
    {
        source,
        additionalImportsFixes,
        specifiersFixes,
        fixedImportPath,
        usedIdsFixes,
    }: ImportNodeFixerInfo,
) {

    context.report({
        node: importNode,
        messageId: "tnsCoreModulesImportFailure",
        data: {
            module: source.value,
        },
        fix: (fixer) => {
            const path = source.value?.toString() || "";
            const fixes: Array<RuleFix> = [];

            const newModule = DEPRECATED_PATH_MAP[path];
            if (!newModule) {
                return null;
            }

            additionalImportsFixes.forEach((fix) => {
                fixes.push(fixer.insertTextBefore(importNode, fix));
            });

            const specifiers = Array.from(specifiersFixes).join(", ");
            if (specifiers) {
                const fixedPath = newModule === NESTED_MODULE_EXPORT ? fixNestedModulePath(path) : NEW_MODULE_PATH;
                fixes.push(fixer.replaceText(importNode, `import { ${specifiers} } from '${fixedPath}';`));
            } else if (fixedImportPath) {
                fixes.push(fixer.replaceText(source, `'${fixedImportPath}'`));
            } else {
                const sourceCode = context.getSourceCode().getText();
                fixes.push(fixer.removeRange(getRemoveNodeRange(importNode, sourceCode)));
            }

            for (const { id, fixedValue } of usedIdsFixes) {
                fixes.push(fixer.replaceText(id, fixedValue));
            }

            return fixes;
        },
    });
}

function shouldReplaceSpecifier(id: TSESTree.ImportClause): boolean {
    return id.type === "ImportNamespaceSpecifier" || id.type === "ImportDefaultSpecifier";
}

function isDeprecatedPath(node: TSESTree.Literal) {
    const path = node.value;

    return typeof path === "string" &&
        DEPRECATED_PATHS.some((disallowedPath) => disallowedPath.startsWith(path));
}

function fixNestedModulePath(path: string) {
    return path.replace(DEPRECATED_PREFIX, NEW_MODULE_PATH);
}
