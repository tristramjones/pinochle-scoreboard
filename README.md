# Pinochle Scoreboard

A React Native mobile app built with Expo for tracking scores in Pinochle card
games. Keep track of bids, melds, and trick points for multiple teams with an
easy-to-use interface.

## Features

- Keep multiple 2-team Pinochle games in progress
- End a game early to save its scores, or delete an ongoing game
- Record bids, melds, and trick points for each round
- Automatic score calculation following Pinochle rules
- Game history with final scores
- Offline scoring help with meld values, trick points, and the app’s scoring
  rules
- A card-room design with green felt, champagne cards, wine buttons, and gold
  borders

## Getting Started

1. Use Node.js 24 (`nvm use`), then install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npx expo start
   ```

3. Open the app in:
   - iOS Simulator
   - Android Emulator
   - Expo Go on your physical device

## Saved games

Ongoing games appear under “At the table.” Tap a game to resume it. “Start new
game” stays available even when other games are in progress. “End game and save
scores” saves scores to “The ledger” without requiring another round; “Delete
game” removes only that game after confirmation. Games ended early are not
marked as wins.

The app imports the previous single current game and history into a new library
on the first successful save. Original storage is retained during migration.
Backups include the full multi-game library; older backups are imported into the
same format. A tied score above 1500 does not pick an arbitrary winner; play
continues.

## Scoring Rules

- Each round, one team makes a bid
- Teams record their meld points and trick points
- Bid-winning team must achieve their bid amount in combined meld + trick points
- If bid team makes their bid, they score: meld points + trick points
- If bid team fails to make their bid, they score: -bid amount
- A team must win at least one trick to count its meld. The bidding team loses
  its bid if it wins no tricks or fails to reach the bid; the non-bidding team
  scores zero without a trick.
- A team wins by reaching 1500 points or leading by at least 1500 points,
  including after moon shots
- A successful moon shot requires one player to take all 12 tricks

## Color palette

The final palette lives in [`constants/Theme.ts`](constants/Theme.ts). `Palette`
defines the colors; `Theme` assigns them to surfaces, text, controls, and
borders. The green room and wine actions are approximately opposite on the HSL
color wheel (155.3° and 336.6°). Champagne provides a warm neutral card surface.

| Role                                 | Color                       |
| ------------------------------------ | --------------------------- |
| Room                                 | Velvet green `#20533E`      |
| Primary buttons and selected choices | Muted wine `#71364D`        |
| Cards                                | Pale champagne `#E7D2A4`    |
| Text on cards                        | Dark green ink `#23382C`    |
| Outer surround and header            | Green-black `#101A14`       |
| Gold accents                         | Honey gold `#E9C27E`        |
| Text on dark surfaces                | Candlelight cream `#F7E8C9` |

Cards use their own foreground colors, separate from text on the green room. The
gold-frame geometry and gradient are shared by cards and primary buttons.
[`theme-contrast.test.ts`](utils/__tests__/theme-contrast.test.ts) checks
enabled body/control text pairs against 4.5:1 contrast and verifies the
complementary hue relationship. Decorative suit highlights and disabled controls
are excluded from those flat-color text checks. No theme-preview controls or
runtime palette switchers are included.

## Development

This app is built with:

- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/) for navigation
- [AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/) for
  data persistence

## Contributing

Feel free to submit issues and enhancement requests!

## Toolchain

This project uses Expo SDK 58, React Native 0.88, React 19.3, and TypeScript 6.
Use Node.js 24 (`nvm use`) before running npm commands.

Validation: `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`,
`npx expo-doctor`, and `npx expo export --platform web`.

Scores are calculated from meld and tricks for saved games as well as new
rounds. Previously stored totals that awarded meld without tricks are corrected
on display. Older automatically-set rounds recorded zero tricks for both teams;
these now award zero points to the non-bidding team because no actual trick
result was saved.

## Apple release

The app is linked to
[its Expo project](https://expo.dev/accounts/tristramjones/projects/pinochle-scoreboard).
`eas.json` contains production App Store and native simulator build profiles.
Production build numbers are managed remotely and increment automatically.

After selecting Node.js 24 with `nvm use`:

```sh
npx --yes eas-cli@27.11.0 build --platform ios --profile production
npx --yes eas-cli@27.11.0 submit --platform ios --profile production
```

Apple signing and upload may require the account holder to authenticate in the
terminal. Enter passwords and verification codes only in the authentication
flow. Never commit signing keys or credentials. Uploading through Expo Submit
delivers a build to App Store Connect/TestFlight; App Review and public release
are separate steps in App Store Connect.

Public support and privacy pages are served by GitHub Pages from `docs/`:

- Support: https://tristramjones.github.io/pinochle-scoreboard/
- Privacy: https://tristramjones.github.io/pinochle-scoreboard/privacy.html

The in-app About and privacy screen links to those pages. `store/app-store.json`
contains draft listing copy and remaining submission fields; it is a reference,
not an automatic metadata-upload configuration. Use native device/simulator
screenshots for the store. The app supports iPad, so include iPad screenshots.
Test the signed build through TestFlight before submitting for App Review.
