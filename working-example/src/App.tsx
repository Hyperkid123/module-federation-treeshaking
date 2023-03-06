/// <reference types="webpack/module" />

import React, { Suspense } from 'react';
import { Button } from '@patternfly/react-core/dist/esm/components/Button';

// @ts-ignore
const WorkingRemote = React.lazy(() => import("workingRemote/WorkingButton"));

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
            <WorkingRemote />
          </div>
      </Suspense>
    </div>
  )
};

export default App;
