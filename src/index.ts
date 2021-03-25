import noDuplicateNsImports from "./rules/no-duplicate-ns-imports";
import noNativescriptAngularImports from "./rules/no-nativescript-angular-imports";
import noTnsCoreModulesImports from "./rules/no-tns-core-modules-imports";

const rules = {
    "no-duplicate-ns-imports": noDuplicateNsImports,
    "no-nativescript-angular-imports": noNativescriptAngularImports,
    "no-tns-core-modules-imports": noTnsCoreModulesImports,
};

const recommendedRules = {
    "@nativescript/no-duplicate-ns-imports": "warn",
    "@nativescript/no-nativescript-angular-imports": "warn",
    "@nativescript/no-tns-core-modules-imports": "warn",
}

module.exports = {
    rules,
    configs: {
        recommended: {
            rules: recommendedRules
        }
    }
};
