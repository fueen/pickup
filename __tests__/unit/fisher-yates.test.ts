import { fisherYatesShuffle } from '../../src/utils/fisher-yates';

describe('fisherYatesShuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = fisherYatesShuffle(input);
    expect(result.length).toBe(input.length);
  });

  it('contains the same elements after shuffle', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = fisherYatesShuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    fisherYatesShuffle(input);
    expect(input).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
  });

  it('handles single-element array', () => {
    expect(fisherYatesShuffle([42])).toEqual([42]);
  });
});
