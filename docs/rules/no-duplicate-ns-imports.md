# Disallows duplicated imports from NativeScript modules (no-duplicate-ns-imports)

Using a single import statement per module will make the code clearer because you can see everything being imported from that module on one line.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { Trace } from '@nativescript/core';
import { Application } from '@nativescript/core';

import { NativeScriptModule } from '@nativescript/angular';
import { NativeScriptRouterModule } from '@nativescript/angular';
import { NativeScriptFormsModule } from '@nativescript/angular';
```

Examples of **correct** code for this rule:

```ts
import { Trace, Application} from '@nativescript/core';

import { NativeScriptModule, NativeScriptRouterModule, NativeScriptFormsModule } from '@nativescript/angular';
```
