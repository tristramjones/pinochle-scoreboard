import {Theme, ThemeType} from '../constants/Theme';

export function useTheme(): {
  theme: ThemeType;
  colors: typeof Theme.colors;
} {
  return {
    theme: Theme,
    colors: Theme.colors,
  };
}
