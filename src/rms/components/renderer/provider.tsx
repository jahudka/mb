import { createContext, useContext } from 'react';
import { OffscreenRenderer } from './offscreen';
import { Renderer } from './renderer';
import { RendererInterface } from './types';

const RendererCtx = createContext<RendererInterface>(
  OffscreenRenderer.isSupported()
    ? new OffscreenRenderer()
    : new Renderer()
);

export function useRenderer(): RendererInterface {
  return useContext(RendererCtx);
}
