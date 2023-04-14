import { FC } from 'react';
import { Chart } from './chart';
import { AppContext } from './context';
import { Ui } from './ui';

import './app.less';

export const App: FC = () => (
  <AppContext>
    <Chart />
    <div id="controls">
      <Ui />
    </div>
  </AppContext>
);
