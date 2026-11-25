import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import {Alert} from 'react-native';
import {useRouter} from 'expo-router';
import {useGame} from '../../contexts/GameContext';
import NewRoundScreen from '../../app/games/round/new';

jest.mock('expo-router', () => ({useRouter: jest.fn()}));
jest.mock('../../contexts/GameContext', () => ({useGame: jest.fn()}));
jest.mock('react-native', () => ({
  View: 'View',
  TextInput: 'TextInput',
  Alert: {alert: jest.fn()},
  Keyboard: {dismiss: jest.fn()},
  StyleSheet: {create: (styles: unknown) => styles},
}));
jest.mock('../../components/KeyboardScrollView', () => ({
  KeyboardScrollView: 'ScrollView',
}));
jest.mock('../../components/ProgressDots', () => ({
  ProgressDots: 'ProgressDots',
}));
jest.mock('../../components/ThemedButton', () => ({ThemedButton: 'Button'}));
jest.mock('../../components/ThemedText', () => ({ThemedText: 'Text'}));

const router = {replace: jest.fn(), back: jest.fn()};
const addRound = jest.fn();
const currentGame = {
  teams: [
    {id: 'a', name: 'One'},
    {id: 'b', name: 'Two'},
  ],
};
let screen: ReactTestRenderer;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (
    globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT: boolean}
  ).IS_REACT_ACT_ENVIRONMENT = true;
  // Native navigation can give the still-mounted screen a new router object.
  (useRouter as jest.Mock).mockImplementation(() => ({...router}));
  (useGame as jest.Mock).mockReturnValue({
    currentGame,
    addRound,
    isLoading: false,
  });
});
afterEach(async () => {
  if (screen) await act(async () => screen.unmount());
  jest.restoreAllMocks();
});

async function fillRound() {
  await act(async () => {
    screen = create(<NewRoundScreen />);
  });
  await act(async () => {
    screen.root.findByProps({title: 'One'}).props.onPress();
    screen.root.findByType('TextInput' as never).props.onChangeText('250');
  });
  await act(async () =>
    screen.root.findByProps({title: 'Submit bid'}).props.onPress(),
  );
  await act(async () => {
    screen.root
      .findAllByType('TextInput' as never)[0]
      .props.onChangeText('100');
  });
  await act(async () =>
    screen.root.findByProps({title: 'Submit meld'}).props.onPress(),
  );
  await act(async () =>
    screen.root
      .findAllByType('TextInput' as never)[0]
      .props.onChangeText('150'),
  );
}

it('does not overwrite victory navigation when archiving removes the current game before the round screen unmounts', async () => {
  await fillRound();
  addRound.mockImplementationOnce(async () => router.replace('/games/victory'));
  await act(async () =>
    screen.root.findByProps({title: 'Submit round'}).props.onPress(),
  );
  // A delayed provider update arrives while the native stack is transitioning.
  (useGame as jest.Mock).mockReturnValue({
    currentGame: null,
    addRound,
    isLoading: false,
  });
  await act(async () => screen.update(<NewRoundScreen />));
  expect(router.replace.mock.calls).toEqual([['/games/victory']]);
});

it('lets the player retry when saving the round fails', async () => {
  await fillRound();
  addRound.mockRejectedValueOnce(new Error('Storage unavailable'));
  await act(async () =>
    screen.root.findByProps({title: 'Submit round'}).props.onPress(),
  );
  expect(Alert.alert).toHaveBeenCalledWith(
    'Error',
    'Failed to submit round. Please try again.',
  );
  addRound.mockResolvedValueOnce(undefined);
  await act(async () =>
    screen.root.findByProps({title: 'Submit round'}).props.onPress(),
  );
  expect(addRound).toHaveBeenCalledTimes(2);
});
