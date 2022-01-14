import { Coordinate } from '..';

interface RegionServiceOptions {
  lat: number;
  long: number;
  latDividor: number;
  longDividor: number;
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
}
