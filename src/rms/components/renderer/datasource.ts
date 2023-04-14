import { range } from '../utils';

export type DataGenerator = (x: number) => number;

export interface IDataSource {
  getView(offset: number, length: number): number[];
}

export class DataSource implements IDataSource {
  private readonly data: number[];

  constructor(data: number[]);
  constructor(size: number, generator: DataGenerator);
  constructor(dataOrSize: number[] | number, maybeGenerator?: DataGenerator) {
    if (maybeGenerator && typeof dataOrSize === 'number') {
      this.data = range(dataOrSize).map(maybeGenerator);
    } else if (Array.isArray(dataOrSize)) {
      this.data = dataOrSize;
    }
  }

  getView(offset: number, length: number): number[] {
    return range(length).map((x) => this.data[(offset + x) % this.data.length]);
  }
}

export class RandomDataSource implements IDataSource {
  private readonly data: number[] = [];
  private offset: number = 0;

  getView(offset: number, length: number): number[] {
    offset -= this.offset;

    while (offset + length > this.data.length) {
      if (!this.data.length) {
        this.data.push(2 * Math.random() - 1);
        continue;
      }

      const size = Math.floor(Math.random() * length / 10) + 1;
      const next = 2 * Math.random() - 1;
      const prev = this.data[this.data.length - 1];

      for (let i = 1; i <= size; ++i) {
        this.data.push(prev + (next - prev) * i / size);
      }

      if (this.data.length >= 3 * length) {
        this.data.splice(0, length);
        this.offset += length;
        offset -= length;
      }
    }

    return this.data.slice(offset, offset + length);
  }
}
