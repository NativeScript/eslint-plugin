import rule from "../src/rules/no-tns-core-modules-imports";
import { getInvalidTestFactory, RuleTester } from "./test-helper";

const ruleTester = new RuleTester({
    parserOptions: {
        sourceType: "module",
    },
    parser: "@typescript-eslint/parser",
});

const getInvalidTest = getInvalidTestFactory("tnsCoreModulesImportFailure");

ruleTester.run("no-tns-core-modules-imports", rule, {
    invalid: [
        getInvalidTest({
            code: `
import { write } from 'tns-core-modules/trace';
write();
`,
            output: `
import { Trace } from '@nativescript/core';
Trace.write();
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { android, ios } from 'tns-core-modules/application';

export class AppUsingAndroidExampleComponent {
    constructor() {
        if (android) {

        } else if (ios) {

        }
    }
}
`,
            output: `
import { Application } from '@nativescript/core';

export class AppUsingAndroidExampleComponent {
    constructor() {
        if (Application.android) {

        } else if (Application.ios) {

        }
    }
}
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { android as androidApp, ios as iosApp } from 'tns-core-modules/application';

export class AppUsingAndroidExampleComponent {
    constructor() {
        if (androidApp) {

        } else if (iosApp) {

        }
    }
}
`,
            output: `
import { Application } from '@nativescript/core';

export class AppUsingAndroidExampleComponent {
    constructor() {
        if (Application.android) {

        } else if (Application.ios) {

        }
    }
}
`,
            locations: [{ line: 2, column: 1 }],
        }),

        /**
         * Re-exported symbols
         */
        getInvalidTest({
            code: `
import { ObservableArray } from 'tns-core-modules/data/observable-array';
let myObservableArray = new ObservableArray(10);
`,
            output: `
import { ObservableArray } from '@nativescript/core';
let myObservableArray = new ObservableArray(10);
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { Observable, fromObject } from 'tns-core-modules/data/observable';
const obs = new Observable();
const json = { Name: 'John', Age: 34, Married: true };
const person = fromObject(json);
`,
            output: `
import { Observable, fromObject } from '@nativescript/core';
const obs = new Observable();
const json = { Name: 'John', Age: 34, Married: true };
const person = fromObject(json);
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { ObservableArray } from 'tns-core-modules/data/observable-array';
let myObservableArray = new ObservableArray(10);
`,
            output: `
import { ObservableArray } from '@nativescript/core';
let myObservableArray = new ObservableArray(10);
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { VirtualArray } from 'tns-core-modules/data/virtual-array';

const array = new VirtualArray<number>(100);
array.on(VirtualArray.changeEvent, (args: ChangedData<number>) => {
    result = args;
});
`,
            output: `
import { VirtualArray } from '@nativescript/core';

const array = new VirtualArray<number>(100);
array.on(VirtualArray.changeEvent, (args: ChangedData<number>) => {
    result = args;
});
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import { File, getFileAccess } from 'tns-core-modules/file-system';

File;
getFileAccess;
`,
            output: `
import { File, getFileAccess } from '@nativescript/core';

File;
getFileAccess;
`,
            locations: [{ line: 2, column: 1 }],
        }),

        /**
         * Symbol exported from module (Application.ios and Application.android) and
         * re-exported symbols (iOSApplication and AndroidApplication)
         */
        getInvalidTest({
            code: `
import { iOSApplication, ios, AndroidApplication, android } from 'tns-core-modules/application';

const androidContext: AndroidApplication = android.context;
const iosContext: iOSApplication = ios.context;
`,
            output: `
import { AndroidApplication, Application, iOSApplication } from '@nativescript/core';

const androidContext: AndroidApplication = Application.android.context;
const iosContext: iOSApplication = Application.ios.context;
`,
            locations: [{ line: 2, column: 1 }],
        }),

        /**
         * Symbol exported from module (Trace.writeMessage) and re-exported symbol (TraceWriter)
         */
        getInvalidTest({
            code: `
import { writeMessage, TraceWriter } from 'tns-core-modules/trace';

writeMessage();
const writer: TraceWriter;
`,
            output: `
import { Trace, TraceWriter } from '@nativescript/core';

Trace.writeMessage();
const writer: TraceWriter;
`,
            locations: [{ line: 2, column: 1 }],
        }),

        /**
         * Symbol exported from module (Http.request) and re-exported symbol (HttpResponse)
         */
        getInvalidTest({
            code: `
import { request, HttpResponse } from 'tns-core-modules/http';

request({ url: 'hgfttp://httpbin.org/get', method: 'GET', timeout: 2000 }).then(
    function (response: HttpResponse) {
        //
    });
`,
            output: `
import { Http, HttpResponse } from '@nativescript/core';

Http.request({ url: 'hgfttp://httpbin.org/get', method: 'GET', timeout: 2000 }).then(
    function (response: HttpResponse) {
        //
    });
`,
            locations: [{ line: 2, column: 1 }],
        }),

        /**
         * Namespace specifier from re-exported module
         */
        getInvalidTest({
            code: `
import * as fs from 'tns-core-modules/file-system';

fs.File;
fs.getFileAccess();
`,
            output: `
import * as fs from '@nativescript/core/file-system';

fs.File;
fs.getFileAccess();
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import * as http from 'tns-core-modules/http';

export var test_getString = function (done: (err: Error, res?: string) => void) {
	http.getString('https://httpbin.org/get').then(
		function (r: http.HttpResponse) {
			//// Argument (r) is string!
			done(null);
		},
		function (e) {
			//// Argument (e) is Error!
			done(e);
		}
	);
};
`,
            output: `
import * as http from '@nativescript/core/http';

export var test_getString = function (done: (err: Error, res?: string) => void) {
	http.getString('https://httpbin.org/get').then(
		function (r: http.HttpResponse) {
			//// Argument (r) is string!
			done(null);
		},
		function (e) {
			//// Argument (e) is Error!
			done(e);
		}
	);
};
`,
            locations: [{ line: 2, column: 1 }],
        }),

        getInvalidTest({
            code: `
import * as app from 'tns-core-modules/application';
const rootView = app.getRootView();
const androidApp = app.AndroidApplication;
`,
            output: `
import * as app from '@nativescript/core/application';
const rootView = app.getRootView();
const androidApp = app.AndroidApplication;
`,
            locations: [{ line: 2, column: 1 }],
        }),
        
        /**
         * Don't replace object keys
         */
        getInvalidTest({
            code: `
import { PromptOptions, inputType, capitalizationType, alert } from 'tns-core-modules/ui/dialogs';
let options: PromptOptions = {
    alert: alert,
    inputType: inputType.text, // email, number, text, password, or email
    capitalizationType: capitalizationType.sentences // all. none, sentences or words
};
            `,
            output: `
import { PromptOptions, Dialogs, inputType, capitalizationType } from '@nativescript/core';
let options: PromptOptions = {
    alert: Dialogs.alert,
    inputType: inputType.text, // email, number, text, password, or email
    capitalizationType: capitalizationType.sentences // all. none, sentences or words
};
            `,
            locations: [{ line: 2, column: 1 }],
        }),

        /**
         * Migrated specifiers
         */
         getInvalidTest({
            code: `
import { device, screen } from 'tns-core-modules/platform';

console.log(device.model);
console.log(screen.mainScreen.scale);
            `,
            output: `
import { Device, Screen } from '@nativescript/core';

console.log(Device.model);
console.log(Screen.mainScreen.scale);
            `,
            locations: [{ line: 2, column: 1 }],
        }),

        /**
         * Deep exports
         */
         getInvalidTest({
            code: `
import { Color } from 'tns-core-modules/color';
import * as colors from 'tns-core-modules/color/known-colors';
import { isKnownName } from 'tns-core-modules/color/known-colors';

Color;
colors;
isKnownName;
            `,
            output: `
import { Color } from '@nativescript/core';
import * as colors from '@nativescript/core/color/known-colors';
import { isKnownName } from '@nativescript/core/color/known-colors';

Color;
colors;
isKnownName;
            `,
            locations: [
                { line: 2, column: 1 },
                { line: 3, column: 1 },
                { line: 4, column: 1 },
            ],
        }),
    ],
    valid: [],
});
