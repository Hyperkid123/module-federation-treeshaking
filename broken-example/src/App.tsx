import React from 'react';
import { Button } from '@patternfly/react-core';

const App = () => {
  return <Button onClick={() => console.log('Host app button click')}>Button in host app</Button>;
};

export default App;
