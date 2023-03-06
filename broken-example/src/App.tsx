/// <reference types="webpack/module" />

import React, { Suspense } from 'react';
import { Button } from '@patternfly/react-core';

// @ts-ignore
const BrokenRemote = React.lazy(() => import("brokenRemote/BrokenButton"));

const getSharedScope = () => {
  return __webpack_share_scopes__['default'];
};

const App = () => {
  return (
    <div>
      <div>
        <Button onClick={() => console.log(getSharedScope())}>Button in host app</Button>
      </div>
      <Suspense>
          <div>
            <BrokenRemote />
          </div>
      </Suspense>
    </div>
  )
};

export default App;
