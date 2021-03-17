# Disallows usage of imports from `tns-core-modules` (no-tns-core-modules-imports)

The use of imports from `tns-core-modules` is banned. Instead use imports from `@nativescript/core`.

## Rule Details

Examples of **incorrect** code for this rule:

```ts
import { write } from 'tns-core-modules/trace';
import { android, ios } from 'tns-core-modules/application';

write();

if (android) {
    // ...
} else if (ios) {
    // ...
}
```

Examples of **correct** code for this rule:

```ts
import { Trace } from '@nativescript/core';
import { Application } from '@nativescript/core';

Trace.write();

if (Application.android) {
    // ...
} else if (Application.ios) {
    // ...
}
```
