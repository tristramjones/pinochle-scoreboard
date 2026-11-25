import {Alert, Linking, StyleSheet, View} from 'react-native';
import {TableScrollView} from '../../components/TableScrollView';
import {ScreenTitle} from '../../components/ScreenTitle';
import {ThemedButton} from '../../components/ThemedButton';
import {ThemedText} from '../../components/ThemedText';
import {AppInfo} from '../../constants/AppInfo';
import {Theme} from '../../constants/Theme';

export default function AboutScreen() {
  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Unable to open link',
        `Please contact ${AppInfo.supportEmail}.`,
      );
    }
  };
  return (
    <TableScrollView contentContainerStyle={styles.content}>
      <ScreenTitle>About and privacy</ScreenTitle>
      <View style={styles.sections}>
        <ThemedText type="heading">{AppInfo.name}</ThemedText>
        <ThemedText style={styles.secondary}>
          Version {AppInfo.version}
        </ThemedText>
        <ThemedText>Keep track of your table, one hand at a time.</ThemedText>
        <ThemedText type="heading">Your games stay on your device</ThemedText>
        <ThemedText>
          Team names, bids, rounds, and scores are saved locally. The app does
          not send your game data to the developer. Scoring works offline,
          without accounts, advertising, or analytics.
        </ThemedText>
        <ThemedText type="heading">Deleting your data</ThemedText>
        <ThemedText>
          Open a game and choose Delete game to remove it and its rounds,
          including any local backup copy. Device backups are managed by Apple
          according to your device settings.
        </ThemedText>
        <ThemedText type="heading">Privacy and support</ThemedText>
        <ThemedText>
          Opening the links below uses your browser or email app. If you email
          support, the developer receives the email you send and uses it to
          respond to your request.
        </ThemedText>
        <ThemedButton
          title="Read privacy policy"
          onPress={() => open(AppInfo.privacyUrl)}
        />
        <ThemedButton
          title="Support"
          variant="secondary"
          onPress={() => open(AppInfo.supportUrl)}
        />
        <ThemedButton
          title="Email the developer"
          variant="text"
          onPress={() => open(`mailto:${AppInfo.supportEmail}`)}
        />
        <ThemedText style={styles.secondary}>{AppInfo.supportEmail}</ThemedText>
      </View>
    </TableScrollView>
  );
}

const styles = StyleSheet.create({
  content: {padding: Theme.spacing.lg, paddingBottom: Theme.spacing.xxl},
  sections: {gap: Theme.spacing.md},
  secondary: {color: Theme.colors.textSecondary},
});
