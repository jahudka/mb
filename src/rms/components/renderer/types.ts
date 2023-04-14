export type RendererOptions = {
  source: string;
  root: boolean;
  mean: boolean;
  square: boolean;
  play: boolean;
};

export interface RendererInterface {
  setCanvas(type: 'plot' | 'bar', canvas: HTMLCanvasElement | OffscreenCanvas): void;
  setOption<O extends keyof RendererOptions>(option: O, value: RendererOptions[O]): void;
  on(event: 'render', handler: (peak: number, rms?: number) => void): void;
  off(event: 'render', handler: (peak: number, rms?: number) => void): void;
  reset(): void;
}
