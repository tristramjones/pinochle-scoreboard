export const TEAM_NAME_MAX_LENGTH = 21;

// Apply only when creating a game; existing saved names stay intact.
export function normalizeTeamNames(teamNames: string[]): string[] {
  const names = teamNames.map(name => name.trim());
  if (names.length !== 2 || names.some(name => !name)) {
    throw new Error('Please enter names for both teams.');
  }
  if (names.some(name => name.length > TEAM_NAME_MAX_LENGTH)) {
    throw new Error(
      `Team names can have up to ${TEAM_NAME_MAX_LENGTH} characters.`,
    );
  }
  return names;
}
