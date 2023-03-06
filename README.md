# Introduction

This example repository shows how incorrect use of webpack module sharing can cause issues with tree shaking and increase bundle size in such an environment.

## Getting started

1. run `npm i` in a root directory
2. to show analyzer output run `npm run analyze`
3. to start dev servers run `npm run serve`

## What does "incorrect use" mean?

In some cases marking a dependency as shared will disable webpack tree shaking. That happens because webpack does not know which modules from marked dependency are supposed to be used at runtime. Because of that, tree shaking will be disabled to provide all modules from dependency to any future potential consumers.

### Examples

For packages like react or react-dom, dependency sharing is not an issue. That's because the whole dependency has to be included in the output bundle. No parts of the package can be ommited.

```js
// ...
new ModuleFederationPlugin({
  shared: {
    react: {
      singleton: true
      eager: true,
    },
    'react-dom': {
      singleton: true
      eager: true,
    },
  },
});
```

For packages like `@patternfly/react-core` (component libraries, etc.) the story is differrent.

Imagine a React application that includes only a `Button` component from PF.


```jsx
import { Button } from '@patternfly/react-core'

const App = () => {
  return (
    <Button>Click me!</Button>
  )
}

export default App;

```

If the whole `@patternfly/react-core` package is marked as shared every single module (component) will be in the output bundle.

```js
// ...
new ModuleFederationPlugin({
  shared: {
    '@patternfly/react-core': {/** other config */},
  },
});
```
Why is that? Even though the example application only uses the `Button` component, webpack has no way of knowing what other modules from the PF package might be required by some other federated module. Imagine that within the same environment, another application will be hosted that also requires the `Stack` and `StackItem` components.

```jsx
import { Button, Stack, StackItem } from '@patternfly/react-core'

const OtherApp = () => {
  return (
    <Stack>
      <StackItem>
        <Button>Click me!</Button>
      </StackItem>
    </Stack>
  )
}

export default OtherApp;
```

In a scenario where the `App` module is loaded into the browser first and webpack would apply tree shaking, follow events would occur.

1. `App` script is loaded into browser memory.
2. `App` checks webpack shared scope for the existing `@patternfly/react-core` module in webpack shared scope Finds nothing.
3. The `@patternfly/react-core` module is added to webpack shared scope. It only includes the `Button` (This is only hypothetical! In reality, every module from dependency is added.).
4. `OtherApp` script is loaded into browser memory.
5. `OtherApp` searches for `@patternfly/react-core` in webpack shared scope and finds an already initialized and shared module that matches its version requirements.
6. `OtherApp` tries to get `Stack` and `StackItem` modules from shared scope. These modules were not shared and runtime error occurs about components being undefined.

This is why webpack cannot apply tree shaking on shared modules. Some modules might be missing inside the shared scope and runtime errors would occur.

## How to fix "tree shaking"?

The short answer is, we can't. Due to the nature of module federation. tree shaking cannot be applied on any shared modules for the reasons mentioned above.

However, we can "help" webpack and tree shake the dependencies for it.

This is important. **Webpack uses an import path to determine if a module was used somewhere in the code or not!**

If the `@patternfly/react-core` module is marked for sharing, but that specific import path was never used in a code, **webpack will not bundle it to output**.

If we use absolute import paths, both in code and sharing config, we explicitly set which modules should be shared and bundled with 0 overhead. Check these examples.

```js
// ...
new ModuleFederationPlugin({
  shared: {
    '@patternfly/react-core/dist/esm/components/Button': {/** other config */},
    // Every other PF exposed module can be listed. Only those used in code will be actually exposed for sharing.
  },
});

import { Button } from '@patternfly/react-core/dist/esm/components/Button';
```

Now in applications we use the absolute import paths:

```jsx
import { Button } from '@patternfly/react-core/dist/esm/components/Button'

const App = () => {
  return (
    <Button>Click me!</Button>
  )
}

export default App;
```

The output bundle will include only a single module from PF. The button component.

## Conclusion

Because module federation did not exist when PF4 libraries were built, there was no way of knowing we would end up dealing with this issue.

The HCC has over 60 micro applications, each using PF and each of them is sharing the module. If any application is using a different version of PF, then the rest, even though PF might be already initialized inside the shared scope, a new entry will be added and additional resources will be used. This ultimately decreases the user experience.

The HCC can have potentially up to 60 different PF modules in the shared scope. Because applications are developed, build, and deployed independently, we have no way of controlling which version of PF is used. Some tenants have had valid reasons for using different versions. Like bugs, beta features, etc. And some are just simply outdated and not properly maintained.

This is the reason why we would like to introduce a type of output alongside the existing one that will allow developers to use absolute import paths, and not have to decide between `esm` or `commonjs` variants. We would like this feature to be opt-in and not destructive to the current system.

Don't forget to check the recording with even more detailed explanations and examples.
