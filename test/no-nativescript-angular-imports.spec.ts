import rule from "../src/rules/no-nativescript-angular-imports";
import { getInvalidTestFactory, RuleTester } from "./test-helper";

const ruleTester = new RuleTester({
    parserOptions: {
        sourceType: "module",
    },
    parser: "@typescript-eslint/parser",
});

const getInvalidTest = getInvalidTestFactory("noNativeScriptAngularImportFailure");

ruleTester.run("no-nativescript-angular-imports", rule, {
    invalid: [
        getInvalidTest({
            code: `
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
import { ModalDialogService } from "nativescript-angular/modal-dialog";
            `,
            output: `
import { NativeScriptModule } from "@nativescript/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "@nativescript/angular";
import { NativeScriptFormsModule } from "@nativescript/angular";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
import { ModalDialogService } from "@nativescript/angular";
            `,
            locations: [
                { line: 2, column: 36 },
                { line: 4, column: 42 },
                { line: 5, column: 41 },
                { line: 8, column: 36 },
            ]
        }),
    ],
    valid: [
        `
import { NativeScriptModule } from "@nativescript/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "@nativescript/angular";
import { NativeScriptFormsModule } from "@nativescript/angular";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
import { ModalDialogService } from "@nativescript/angular";
        `
    ]
});