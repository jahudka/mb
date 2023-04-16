import { EventEmitter } from '../eventEmitter';
import { DataSource, IDataSource, RandomDataSource } from './datasource';
import { RendererInterface, RendererOptions } from './types';

const signalColor = '#55e';
const rmsColor = '#e55';

const sources = {
  sin: new DataSource(400, (x) => Math.sin(Math.PI * x / 200)),
  square: new DataSource(400, (x) => x < 200 ? -1 : 1),
  random: new RandomDataSource(),
} satisfies Record<string, IDataSource>;

export class Renderer extends EventEmitter implements RendererInterface {
  private plot?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private bar?: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;

  private readonly options: RendererOptions = {
    source: 'sin',
    root: false,
    mean: false,
    square: false,
    x2: false,
    play: false,
  };

  private offset: number = 0;
  private frame?: number;

  constructor() {
    super();
    this.play = this.play.bind(this);
    this.render = this.render.bind(this);
  }

  setCanvas(type: 'plot' | 'bar', canvas: HTMLCanvasElement | OffscreenCanvas): void {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot initialise canvas rendering context');
    }

    if (type === 'plot') {
      this.plot = ctx;
      this.width = canvas.width;
      this.height = canvas.height;
    } else {
      this.bar = ctx;
    }

    this.renderOnce();
  }

  setOption<O extends keyof RendererOptions>(option: O, value: RendererOptions[O]) {
    if (option === 'source' && typeof value === 'string') {
      if (value in sources && value !== this.options.source) {
        this.options.source = value;
        this.reset();
      }
    } else if (typeof value === 'boolean' && this.options[option] !== value) {
      this.options[option] = value;

      if (option === 'play') {
        this.checkPlayback(value);
      } else {
        this.renderOnce();
      }
    }
  }

  reset(): void {
    this.offset = 0;
    this.renderOnce();
  }

  private checkPlayback(on: boolean): void {
    if (on) {
      this.frame = requestAnimationFrame(this.play);
    } else {
      this.frame !== undefined && cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }
  }

  private play(): void {
    this.frame = requestAnimationFrame(this.play);
    ++this.offset;
    this.render();
  }

  private renderOnce(): void {
    if (!this.options.play) {
      this.frame = requestAnimationFrame(this.render);
    }
  }

  private render(): void {
    if (!this.plot || !this.bar) {
      return;
    }

    this.plot.clearRect(0, 0, this.width, this.height);

    const data = sources[this.options.source].getView(this.offset, this.width);
    const mult = this.options.x2 ? 2 : 1;
    const scale = this.options.x2 ? 0.25 : 1;
    let peak = 0;
    let rms = 0;

    this.plot.strokeStyle = signalColor;
    this.plot.beginPath();


    for (let x = 0; x < this.width; ++x) {
      const amplitude = mult * data[x];
      Math.abs(amplitude) > Math.abs(peak) && (peak = amplitude);

      if (this.options.mean) {
        rms += this.options.square ? amplitude ** 2 : amplitude;
      }

      const y = (1 - scale * amplitude) * this.height / 2;
      x < 1 ? this.plot.moveTo(x, y) : this.plot.lineTo(x, y);
    }

    this.plot.stroke();
    this.plot.strokeStyle = rmsColor;

    if (this.options.mean) {
      rms /= this.width;
      this.options.root && (rms = rms < 0 ? 0 : Math.sqrt(rms));

      const y = (1 - scale * rms) * this.height / 2;
      this.plot.beginPath();
      this.plot.moveTo(0, y);
      this.plot.lineTo(this.width, y);
      this.plot.stroke();
    } else if (this.options.root || this.options.square) {
      this.plot.beginPath();

      let invalid = false;

      for (let x = 0; x < this.width; ++x) {
        const rs = this.options.root && this.options.square
          ? Math.abs(mult * data[x])
          : this.options.square
            ? (mult * data[x]) ** 2
            : Math.sqrt(mult * data[x]);

        if (Number.isNaN(rs)) {
          invalid || this.plot.lineTo(x, this.height / 2);
          invalid = true;
          continue;
        }

        Math.abs(rs) > Math.abs(rms) && (rms = rs);

        const y = (1 - scale * rs) * this.height / 2;
        invalid && this.plot.moveTo(x - 1, this.height / 2);
        x < 1 ? this.plot.moveTo(x, y) : this.plot.lineTo(x, y);
        invalid = false;
      }

      this.plot.stroke();
    }

    this.bar.clearRect(0, 0, 1, this.height);

    this.bar.strokeStyle = signalColor;
    this.bar.beginPath();
    this.bar.moveTo(0, (1 - scale * peak) * this.height / 2);
    this.bar.lineTo(1, (1 - scale * peak) * this.height / 2);
    this.bar.stroke();

    if (this.options.root || this.options.mean || this.options.square) {
      this.bar.strokeStyle = rmsColor;
      this.bar.beginPath();
      this.bar.moveTo(0, (1 - scale * rms) * this.height / 2);
      this.bar.lineTo(1, (1 - scale * rms) * this.height / 2);
      this.bar.stroke();
    }

    this.emit('render', peak, this.options.root || this.options.mean || this.options.square ? rms : undefined);
  }
}
