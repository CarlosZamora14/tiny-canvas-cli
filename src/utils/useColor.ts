import { Colors } from '../enums';

function useColor(color: Colors, text: string): string {
  return `${color}${text}${Colors.RESET}`;
}

export { useColor };