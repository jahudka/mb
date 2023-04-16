import { FC } from 'react';
import { Options, useAppCtx } from './context';
import { Children } from './types';

export const Ui: FC = () => {
  const { options, setOption } = useAppCtx();

  return (
    <>
      <select value={options.source} onChange={(evt) => setOption('source', evt.target.value)}>
        <option value="sin">sine</option>
        <option value="square">square</option>
        <option value="random">random</option>
      </select>
      <Toggle prop="root">root</Toggle>
      <Toggle prop="mean">mean</Toggle>
      <Toggle prop="square">square</Toggle>
      <Toggle prop="x2">x2</Toggle>
      <Toggle prop="play">play</Toggle>
    </>
  );
};

type KeysOfType<O extends {}, T> = keyof {
  [K in keyof O as O[K] extends T ? K : never]: O[K];
};

type ToggleProps = Children & {
  prop: KeysOfType<Options, boolean>;
};

const Toggle: FC<ToggleProps> = ({ prop, children }) => {
  const { options, setOption } = useAppCtx();
  return (
    <label>
      <input type="checkbox" checked={options[prop]} onChange={(evt) => setOption(prop, evt.target.checked)} />
      {children}
    </label>
  );
};
