import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import {useIsFocused, useRouter} from 'expo-router';
import {GameProvider, useGame} from '../../contexts/GameContext';
import GamesScreen from '../../app/games';
import {loadLibrary, saveLibrary} from '../library';

jest.mock('expo-router', () => ({
  useIsFocused: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock('../library', () => ({
  ...jest.requireActual('../library'),
  loadLibrary: jest.fn(),
  saveLibrary: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('../../constants/CardImages', () => ({
  cardImages: Array.from({length: 24}, (_, index) => index + 1),
}));
jest.mock('react-native', () => ({
  View: 'View',
  Image: 'NativeImage',
  TouchableOpacity: 'Button',
  Alert: {alert: jest.fn()},
  Platform: {select: () => ({})},
  StyleSheet: {create: (styles: unknown) => styles},
}));
jest.mock('expo-image', () => ({Image: 'NativeImage'}));
jest.mock('../../components/TableScrollView', () => ({
  TableScrollView: 'ScrollView',
}));
jest.mock('../../components/CardFrame', () => ({CardFrame: 'Frame'}));
jest.mock('../../components/RoomMasthead', () => ({OrnamentalRule: 'Rule'}));
jest.mock('../../components/ThemedText', () => ({ThemedText: 'Text'}));
jest.mock('../../components/ThemedButton', () => ({ThemedButton: 'Button'}));

let context: ReturnType<typeof useGame>;
function Probe() {
  context = useGame();
  return null;
}
let screen: ReactTestRenderer;
const router = {replace: jest.fn(), back: jest.fn()};
const tree = () => (
  <GameProvider>
    <GamesScreen />
    <Probe />
  </GameProvider>
);
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (
    globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean}
  ).IS_REACT_ACT_ENVIRONMENT = true;
  (useRouter as jest.Mock).mockReturnValue(router);
  (useIsFocused as jest.Mock).mockReturnValue(true);
  (loadLibrary as jest.Mock).mockResolvedValue({
    activeGames: [
      {
        id: 'new',
        timestamp: 0,
        teams: [
          {id: 'a', name: 'Arizona Cardinals', players: []},
          {id: 'b', name: 'Los Angeles Rams', players: []},
        ],
        rounds: [],
        cardImageIndex: 14,
        winningScore: 1500,
        version: 1,
      },
    ],
    history: [],
    selectedId: 'new',
  });
  (saveLibrary as jest.Mock).mockResolvedValue(undefined);
});
afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
  jest.restoreAllMocks();
});

it('archives immediately and mounts fresh artwork only after returning from victory', async () => {
  await act(async () => {
    screen = create(tree());
  });
  const originalImage = screen.root.findByType('NativeImage' as never);
  (useIsFocused as jest.Mock).mockReturnValue(false);
  await act(async () => screen.update(tree()));
  expect(screen.root.findAllByType('NativeImage' as never)).toHaveLength(0);
  await act(async () =>
    context.addRound({
      bidWinner: 'a',
      bid: 250,
      meld: {},
      trickPoints: {},
      moonShotAttempted: true,
      moonShotSuccessful: true,
    }),
  );
  expect(context.activeGames).toHaveLength(0);
  expect(context.completedGames[0].teams[0].name).toBe('Arizona Cardinals');
  expect(saveLibrary).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith(
    expect.objectContaining({pathname: '/games/victory'}),
  );
  expect(screen.root.findAllByType('NativeImage' as never)).toHaveLength(0);
  (useIsFocused as jest.Mock).mockReturnValue(true);
  await act(async () => screen.update(tree()));
  const returnedImage = screen.root.findByType('NativeImage' as never);
  expect(returnedImage).not.toBe(originalImage);
  expect(returnedImage.props.source).toBe(15);
  expect(context.completedGames).toHaveLength(1);
  expect(loadLibrary).toHaveBeenCalledTimes(1); // No storage refresh or app reload.
});
