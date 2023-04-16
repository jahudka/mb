import { createContext, Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import { RendererInterface, useRenderer } from './renderer';
import { Children } from './types';
import { useContextSafely } from './utils';

export type AppCtx = {
  options: Options;
  setOption: SetOptionFn;
  setCanvas: SetCanvasFn;
};

export type Options = {
  source: string;
  root: boolean;
  mean: boolean;
  square: boolean;
  x2: boolean;
  play: boolean;
};

export type SetOptionFn<O extends keyof Options = keyof Options> = (option: O, value: Options[O]) => void;
export type SetCanvasFn = (type: 'plot' | 'bar', canvas: HTMLCanvasElement | OffscreenCanvas) => void;

const AppCtx = createContext<AppCtx | undefined>(undefined);

export function useAppCtx(): AppCtx {
  return useContextSafely(AppCtx);
}


function createSetOptionFn(
  renderer: RendererInterface,
  setOptions: Dispatch<SetStateAction<Options>>,
): SetOptionFn {
  return (option, value) => setOptions((options) => {
    if (options[option] === value) {
      return options;
    }

    renderer.setOption(option, value);
    return { ...options, [option]: value };
  });
}

function createSetCanvasFn(renderer: RendererInterface): SetCanvasFn {
  return (type, canvas) => renderer.setCanvas(type, canvas);
}

const defaults: Options = {
  source: 'sin',
  root: false,
  mean: false,
  square: false,
  x2: false,
  play: false,
};

export const AppContext: FC<Children> = ({ children }) => {
  const renderer = useRenderer();
  const [options, setOptions] = useState(defaults);
  const setOption = useMemo(() => createSetOptionFn(renderer, setOptions), [renderer, setOptions]);
  const setCanvas = useMemo(() => createSetCanvasFn(renderer), [renderer])

  return (
    <AppCtx.Provider value={{ options, setOption, setCanvas }}>
      {children}
    </AppCtx.Provider>
  );
};
