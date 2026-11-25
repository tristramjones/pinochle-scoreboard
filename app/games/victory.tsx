import {Redirect, useLocalSearchParams, useRouter} from 'expo-router';
import VictoryScreen from '../../components/VictoryScreen';

export default function VictoryRoute() {
  const router = useRouter();
  const {teamName, score} = useLocalSearchParams<{
    teamName: string;
    score: string;
  }>();
  const points = Number(score);
  if (!teamName || !score || !Number.isFinite(points))
    return <Redirect href="/games" />;
  return (
    <VictoryScreen
      winningTeam={{name: teamName, score: points}}
      onContinue={() => router.dismissTo('/games')}
    />
  );
}
