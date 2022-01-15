import { Coordinate } from './core';

interface RegionServiceOptions {
  lat: number;
  long: number;
  latDividor: number;
  longDividor: number;
}

interface RegionBox {
  leftTop: Coordinate;
  leftBottom: Coordinate;
  rightTop: Coordinate;
  rightBottom: Coordinate;
}

export class RegionService {
  constructor(private options: RegionServiceOptions) {}

  private get dividor(): Coordinate {
    return {
      lat: this.options.lat / this.options.latDividor,
      long: this.options.long / this.options.longDividor,
    };
  }

  getRegionForPoint(coor: Coordinate): Coordinate {
    const dividor = this.dividor;
    const lat = Math.floor(coor.lat / dividor.lat);
    const long = Math.floor(coor.long / dividor.long);

    return { lat, long };
  }

  private isValidBox({
    leftBottom,
    leftTop,
    rightBottom,
    rightTop,
  }: RegionBox): boolean {
    return (
      leftTop.lat > leftBottom.lat &&
      leftTop.long < rightTop.long &&
      rightBottom.long > leftBottom.long &&
      rightBottom.lat < rightTop.lat &&
      leftTop.lat > rightBottom.lat &&
      leftTop.long < rightBottom.long
    );
  }

  getRegionsForBox(box: RegionBox): Coordinate[] {
    if (!box || !this.isValidBox(box)) {
      return [];
    }

    const start = box.leftBottom;
    const end = box.rightTop;

    const diff: Coordinate = {
      lat: end.lat - start.lat,
      long: end.long - start.long,
    };

    const result: Coordinate[] = [];
    for (let i = 0; i <= diff.lat; i++) {
      for (let j = 0; j <= diff.long; j++) {
        result.push({ lat: start.lat + i, long: start.long + j });
      }
    }

    return result;
  }
}
