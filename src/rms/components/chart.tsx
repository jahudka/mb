import { createContext, FC, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppCtx } from './context';
import { useRenderer } from './renderer';
import { Children } from './types';

import './chart.less';

export const Chart: FC = () => {
  const { options: { x2 } } = useAppCtx();

  return (
    <div id="chart">
      <Legend width={6} placement="left">
        <Label value={1}>{x2 ? '+12' : 0} dB</Label>
        <Label value={0.5}>{x2 ? '+6' : -6} dB</Label>
        <Label value={0}>-∞ dB</Label>
        <Label value={-0.5}>{x2 ? '+6' : -6} dB</Label>
        <Label value={-1}>{x2 ? '+12' : 0} dB</Label>
      </Legend>
      <Canvas type="plot" />
      <Legend width={4} placement="right">
        <Label value={1}>{x2 ? 4 : 1}</Label>
        <Label value={0.5}>{x2 ? 2: 0.5}</Label>
        <Label value={0} />
        <Label value={-0.5}>{x2 ? -2 : -0.5}</Label>
        <Label value={-1}>{x2 ? -4 : -1}</Label>
      </Legend>
      <Canvas type="bar" />
      <Readout />
    </div>
  );
}

type LegendProps = Children & {
  width: number;
  placement: 'left' | 'right';
};

const Legend: FC<LegendProps> = ({ width, placement, children }) => (
  <div className={`legend ${placement}`} style={{ width: `${width}em` }}>{children}</div>
);

type LabelProps = Children & {
  value: number;
};

const Label: FC<LabelProps> = ({ value, children }) => (
  <div className="label" style={{ top: `${(1 - value) * 50}%` }}>{children ?? value}</div>
);

type CanvasProps = {
  type: 'plot' | 'bar';
};

const Canvas: FC<CanvasProps> = ({ type }) => {
  const { setCanvas } = useAppCtx();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.width = type === 'bar' ? 1 : ref.current.clientWidth;
    ref.current.height = ref.current.clientHeight;
    setCanvas(type, ref.current);
  }, []);

  return (
    <div className={`canvas ${type}`}>
      <canvas ref={ref} />
    </div>
  );
};

type ReadoutCtx = {
  peakLin: number;
  rmsLin?: number;
  cfLin?: number;
  peakLog: number;
  rmsLog?: number;
  cfLog?: number;
};

const defaultReadout: ReadoutCtx = { peakLin: 1, peakLog: 0 };
const ReadoutCtx = createContext(defaultReadout);

const Readout: FC = () => {
  const renderer = useRenderer();
  const [ctx, setCtx] = useState(defaultReadout);

  useEffect(() => {
    const update = (peak: number, rms?: number): void => {
      setCtx((prev) => {
        if (peak === prev.peakLin && rms === prev.rmsLin) {
          return prev;
        } else if (rms === undefined) {
          return { peakLin: peak, peakLog: db(peak) };
        } else {
          return {
            peakLin: peak,
            peakLog: db(peak),
            rmsLin: rms,
            rmsLog: db(rms),
            cfLin: peak / rms,
            cfLog: db(peak / rms),
          };
        }
      });
    };

    renderer.on('render', update);
    return () => renderer.off('render', update);
  }, [renderer, setCtx]);

  return (
    <ReadoutCtx.Provider value={ctx}>
      <ReadoutTable />
    </ReadoutCtx.Provider>
  );
};

function db(value: number): number {
  return 20 * Math.log10(Math.abs(value));
}

const ReadoutTable: FC = () => (
  <div className="readout">
    <table>
      <thead>
        <tr>
          <td />
          <th>lin</th>
          <th>dB</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>peak</th>
          <td><ReadoutValue prop="peakLin" /></td>
          <td><ReadoutValue prop="peakLog" /></td>
        </tr>
        <tr>
          <th>rms</th>
          <td><ReadoutValue prop="rmsLin" /></td>
          <td><ReadoutValue prop="rmsLog" /></td>
        </tr>
        <tr>
          <th>cf</th>
          <td><ReadoutValue prop="cfLin" /></td>
          <td><ReadoutValue prop="cfLog" /></td>
        </tr>
      </tbody>
    </table>
  </div>
);

type ReadoutValueProps = {
  prop: keyof ReadoutCtx;
};

const ReadoutValue: FC<ReadoutValueProps> = ({ prop }) => {
  const { [prop]: value } = useContext(ReadoutCtx);
  return (
    <input type="text" readOnly value={value?.toFixed(2) ?? ''} />
  );
};
