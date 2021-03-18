# Disallows usage of imports from `nativescript-angular` (no-nativescript-angular-imports)

The use of imports from `nativescript-angular` is banned. Instead use imports from `@nativescript/angular`.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { NativeScriptModule } from "@nativescript/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "@nativescript/angular";
import { NativeScriptFormsModule } from "@nativescript/angular";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
import { ModalDialogService } from "@nativescript/angular";
```

Examples of **correct** code for this rule:

```ts
import { NativeScriptModule } from "@nativescript/angular";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "@nativescript/angular";
import { NativeScriptFormsModule } from "@nativescript/angular";
import { routes } from "./app.routes";
import { AppComponent } from "./app.component";
import { ModalDialogService } from "@nativescript/angular";
```
