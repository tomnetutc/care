import { teamRows } from './AboutContent';

describe('teamRows', () => {
  test('one row when everyone fits', () => expect(teamRows(7, 1400)).toEqual([7]));
  test('balanced two rows (4 + 3), never 6 + 1', () => expect(teamRows(7, 900)).toEqual([4, 3]));
  test('balanced three rows (3 + 2 + 2), never 3 + 3 + 1', () => expect(teamRows(7, 560)).toEqual([3, 2, 2]));
  test('narrow phone: one per row', () => expect(teamRows(7, 160)).toEqual([1, 1, 1, 1, 1, 1, 1]));
  test('rows never differ by more than one', () => {
    for (let n = 1; n <= 12; n++) for (let w = 100; w <= 2000; w += 37) {
      const r = teamRows(n, w);
      expect(r.reduce((a, b) => a + b, 0)).toBe(n);
      expect(Math.max(...r) - Math.min(...r)).toBeLessThanOrEqual(1);
    }
  });
});
