import { EventEmitter } from '../eventEmitter';
import { RendererInterface, RendererOptions } from './types';

export class OffscreenRenderer extends EventEmitter implements RendererInterface {
  private readonly worker = new Worker(
    new URL('./worker.ts', import.meta.url),
    { type: 'module' }
  );

  static isSupported(): boolean {
    return 'transferControlToOffscreen' in HTMLCanvasElement.prototype;
  }

  constructor() {
    super();
    this.worker.addEventListener('message', (msg) => this.handleMessage(msg));
  }

  setCanvas(type: 'plot' | 'bar', el: HTMLCanvasElement): void {
    const canvas = el.transferControlToOffscreen();
    this.worker.postMessage({ canvas, type }, [canvas]);
  }

  reset(): void {
    this.worker.postMessage({ reset: true });
  }

  setOption<O extends keyof RendererOptions>(option: O, value: RendererOptions[O]) {
    this.worker.postMessage({ option, value });
  }

  private handleMessage(msg: any): void {
    if (msg !== null && typeof msg === 'object' && 'event' in msg) {
      this.emit(msg.event, ...msg.args);
    }
  }
}
