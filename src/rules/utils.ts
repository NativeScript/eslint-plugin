import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";

export const createESLintRule = ESLintUtils.RuleCreator(() => ``);

export function getRemoveNodeRange(node: TSESTree.Node, source: string): TSESTree.Range {
    const lineBreakPattern = /\r\n|[\r\n\u2028\u2029]/u;
    const lineBreakMatcher = new RegExp(lineBreakPattern.source, "gu");

    // eslint-disable-next-line prefer-const
    let { range: [start, end] } = node;

    while (lineBreakMatcher.test(source[end])) {
        end++;
    }

    return [start, end];
}
