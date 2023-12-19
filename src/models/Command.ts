import { Commands } from '../enums';

interface ICommand {
  type: Commands;
  args?: string[];
}

export { ICommand };