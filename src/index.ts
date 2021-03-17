import noDuplicateNsImports from "./rules/no-duplicate-ns-imports";
import noTnsCoreModulesImports from "./rules/no-tns-core-modules-imports";

module.exports = {
    rules: {
        "no-tns-core-modules-imports": noTnsCoreModulesImports,
        "no-duplicate-ns-imports": noDuplicateNsImports,
    },
};
