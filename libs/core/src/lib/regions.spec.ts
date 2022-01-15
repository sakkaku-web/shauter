import { RegionService } from './regions';

describe('RegionService', () => {
  describe('GetRegionForPoint', () => {
    test.each`
      point                      | region
      ${{ lat: 0, long: 0 }}     | ${{ lat: 0, long: 0 }}
      ${{ lat: 0.5, long: 0 }}   | ${{ lat: 0, long: 0 }}
      ${{ lat: 1, long: 0 }}     | ${{ lat: 1, long: 0 }}
      ${{ lat: 1.5, long: 0 }}   | ${{ lat: 1, long: 0 }}
      ${{ lat: 0, long: 0.5 }}   | ${{ lat: 0, long: 0 }}
      ${{ lat: 0, long: 1 }}     | ${{ lat: 0, long: 1 }}
      ${{ lat: 0, long: 1.5 }}   | ${{ lat: 0, long: 1 }}
      ${{ lat: 1.5, long: 1.5 }} | ${{ lat: 1, long: 1 }}
    `(
      'get region for simple point ($point.lat, $point.long)',
      ({ point, region }) => {
        const service = new RegionService({
          lat: 10,
          long: 10,
          latDividor: 10,
          longDividor: 10,
        });
        expect(service.getRegionForPoint(point)).toEqual(region);
      }
    );

    test.each`
      point                      | region
      ${{ lat: 0, long: 0 }}     | ${{ lat: 0, long: 0 }}
      ${{ lat: 0.01, long: 0 }}  | ${{ lat: 0, long: 0 }}
      ${{ lat: 0.5, long: 0.5 }} | ${{ lat: 5, long: 5 }}
      ${{ lat: 0.1, long: 1 }}   | ${{ lat: 1, long: 10 }}
    `(
      'get region with decimal dividor for point ($point.lat, $point.long)',
      ({ point, region }) => {
        const service = new RegionService({
          lat: 10,
          long: 10,
          latDividor: 100,
          longDividor: 100,
        });
        expect(service.getRegionForPoint(point)).toEqual(region);
      }
    );
  });

  describe('GetRegionsForBox', () => {
    const service = new RegionService({
      lat: 10,
      long: 10,
      latDividor: 10,
      longDividor: 10,
    });

    test('get for box', () => {
      const regions = service.getRegionsForBox({
        leftTop: { lat: 1, long: -1 },
        leftBottom: { lat: -1, long: -1 },
        rightTop: { lat: 1, long: 1 },
        rightBottom: { lat: -1, long: 1 },
      });

      expect(regions).toEqual(
        expect.arrayContaining([
          { lat: -1, long: -1 },
          { lat: -1, long: 0 },
          { lat: -1, long: 1 },
          { lat: 0, long: -1 },
          { lat: 0, long: 0 },
          { lat: 0, long: 1 },
          { lat: 1, long: -1 },
          { lat: 1, long: 0 },
          { lat: 1, long: 1 },
        ])
      );
    });

    test('get for invalid box', () => {
      const regions = service.getRegionsForBox({
        leftTop: { lat: 10, long: 10 },
        leftBottom: { lat: 10, long: 10 },
        rightTop: { lat: 5, long: 5 },
        rightBottom: { lat: 5, long: 5 },
      });
      expect(regions).toEqual([]);
    });
  });
});
