import {normalizeTeamNames} from '../teamNames';

describe('new game team names', () => {
  it('accepts the requested longest example and trims outer whitespace', () => {
    expect(
      normalizeTeamNames([' Washington Commanders ', 'San Francisco 49ers']),
    ).toEqual(['Washington Commanders', 'San Francisco 49ers']);
  });

  it('rejects names exceeding the limit instead of silently truncating them', () => {
    expect(() =>
      normalizeTeamNames(['Washington Commanders!', 'Other team']),
    ).toThrow('21 characters');
  });

  it('requires exactly two nonempty names', () => {
    expect(() => normalizeTeamNames(['One', '   '])).toThrow();
    expect(() => normalizeTeamNames(['One'])).toThrow();
    expect(() => normalizeTeamNames(['One', 'Two', 'Three'])).toThrow();
  });
});
