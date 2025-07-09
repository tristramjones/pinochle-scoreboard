# Pinochle Score Tracker

A React Native mobile app built with Expo for tracking scores in Pinochle card games. Keep track of bids, melds, and trick points for multiple teams with an easy-to-use interface.

## Features

- Track scores for 2-team Pinochle games
- Record bids, melds, and trick points for each round
- Automatic score calculation following Pinochle rules
- Game history with final scores
- Clean, modern UI optimized for iOS

## Getting Started

1. Install dependencies:
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

## Scoring Rules

- Each round, one team makes a bid
- Teams record their meld points and trick points
- Bid-winning team must achieve their bid amount in combined meld + trick points
- If bid team makes their bid, they score: meld points + trick points
- If bid team fails to make their bid, they score: -bid amount
- Non-bidding team always scores: meld points + trick points
- First team to reach 1500 points wins

## Development

This app is built with:
- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/) for navigation
- [AsyncStorage](https://docs.expo.dev/versions/latest/sdk/async-storage/) for data persistence

## Contributing

Feel free to submit issues and enhancement requests!
