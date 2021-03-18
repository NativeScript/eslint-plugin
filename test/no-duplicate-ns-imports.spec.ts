import rule from "../src/rules/no-duplicate-ns-imports";
import { getInvalidTestFactory, RuleTester } from "./test-helper";

const ruleTester = new RuleTester({
    parserOptions: {
        sourceType: "module",
    },
    parser: "@typescript-eslint/parser",
});

const getInvalidTest = getInvalidTestFactory("import");

ruleTester.run("no-duplicate-ns-core-imports", rule, {
    invalid: [
        getInvalidTest({
            code: `
import { Application } from '@nativescript/core';
import { Trace } from '@nativescript/core';
`,
            output: `
import { Application, Trace } from '@nativescript/core';
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { NativeScriptModule } from "@nativescript/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "@nativescript/angular";
import { NativeScriptFormsModule } from "@nativescript/angular";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
import { ModalDialogService } from "@nativescript/angular";
`,
            output: `
import { NativeScriptModule, NativeScriptRouterModule, NativeScriptFormsModule, ModalDialogService } from "@nativescript/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { android as androidApp } from '@nativescript/core';
import { Trace } from '@nativescript/core';
`,
            output: `
import { android as androidApp, Trace } from '@nativescript/core';
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import defaultExport from '@nativescript/core';
import { ApplicationSettings } from '@nativescript/core';
import { Application, Trace } from '@nativescript/core';
`,
            output: `
import defaultExport, { ApplicationSettings, Application, Trace } from '@nativescript/core';
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import defaultExport from '@nativescript/core';
import * as core from '@nativescript/core';
`,
            output: `
import defaultExport, * as core from '@nativescript/core';
`,
            locations: [{ line: 2, column: 1 }],
        }),

    ],
    valid: [
        `import { something } from 'tns-core-modules';`,
        `import { something } from 'nativescript/core';`,
        /**
         * Merging would lead to invalid syntax
         */
        `
import * as nsCore from '@nativescript/core';
import { Trace } from '@nativescript/core';
        `,

    ],
});
