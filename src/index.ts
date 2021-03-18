import noDuplicateNsImports from "./rules/no-duplicate-ns-imports";
import noNativescriptAngularImports from "./rules/no-nativescript-angular-imports";
import noTnsCoreModulesImports from "./rules/no-tns-core-modules-imports";

module.exports = {
    rules: {
        "no-duplicate-ns-imports": noDuplicateNsImports,
        "no-nativescript-angular-imports": noNativescriptAngularImports,
        "no-tns-core-modules-imports": noTnsCoreModulesImports,
    },
};
