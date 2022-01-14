import { RegionService } from './regions';

describe('RegionService', () => {
  test.each`
    point                    | region
    ${{ lat: 0, long: 0 }}   | ${{ lat: 0, long: 0 }}
    ${{ lat: 0.5, long: 0 }} | ${{ lat: 0, long: 0 }}
    ${{ lat: 1, long: 0 }}   | ${{ lat: 1, long: 0 }}
    ${{ lat: 1.5, long: 0 }} | ${{ lat: 1, long: 0 }}
    ${{ lat: 0, long: 0.5 }} | ${{ lat: 0, long: 0 }}
    ${{ lat: 0, long: 1 }}   | ${{ lat: 0, long: 1 }}
    ${{ lat: 0, long: 1.5 }} | ${{ lat: 0, long: 1 }}
  `('get region for point ($point.lat, $point.long)', ({ point, region }) => {
    const service = new RegionService({
      lat: 10,
      long: 10,
      latDividor: 10,
      longDividor: 10,
    });
    expect(service.getRegionForPoint(point)).toEqual(region);
  });
});
