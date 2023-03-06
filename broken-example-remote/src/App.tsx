/// <reference types="webpack/module" />

import React from 'react';
import { Button } from '@patternfly/react-core';

const getSharedScope = () => {
  return __webpack_share_scopes__['default'];
};

const App = () => {
  return <Button onClick={() => console.log(getSharedScope())}>Button broken remote app</Button>;
};

export default App;
