import { Linter } from "eslint";
import { rules } from "../rules";
import { parseForESLint } from "@typescript-eslint/parser";

const PARSER = "@typescript-eslint/parser";

export interface ReportWithFileName extends Linter.FixReport {
    fileName: string;
}

export function verifyAndFixFileContent(fileContent: string, fileName: string): ReportWithFileName {
    const linter = new Linter();

    for (const rule of Object.keys(rules)) {
        linter.defineRule(rule, rules[rule]);
    }
    const definedRules = Object.keys(rules).reduce((obj, rule) => {
        obj[rule] = "error";
        return obj;
    }, {});

    linter.defineParser(PARSER, {
        parseForESLint: parseForESLint as any,
    });

    const report = linter.verifyAndFix(fileContent, {
        parser: PARSER,
        rules: definedRules,
    });

    return { ...report, fileName };
}
