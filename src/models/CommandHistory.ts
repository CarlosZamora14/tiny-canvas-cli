import { Commands } from '../enums';

interface ICommand {
  type: Commands;
  userArgs?: string[];
  actualArgs?: string[];
}

interface ICommandHistory {
  // The return value of this methods is a formatted string which will be display in the cli
  undo: (callback: (command: ICommand) => void) => string;
  restore: (callback: (command: ICommand) => void) => string;
  store: (command: ICommand) => string;
}

class CommandHistory implements ICommandHistory {
  private _history: ICommand[] = new Array<ICommand>();
  private _size: number = 0; // The total number of applied commands, not counting the ones we might have previously undone

  private formatCommand(command: ICommand): string {
    if (!command.userArgs) {
      return command.type;
    }

    return `'${command.type}' command with arguments ${command.userArgs.join(' ')}`;
  }

  private canRestoreChanges(): boolean {
    return this._size !== this._history.length;
  }

  store(command: ICommand): string {
    if (this._history.length > this._size) {
      // Removes the previous undone operations
      this._history.splice(this._size);
    }
    this._history.push(command);
    this._size += 1;
    return `Applied ${this.formatCommand(command)} successfully.`;
  };

  undo(callback: (command: ICommand) => void): string {
    if (this._size === 0) {
      return `The command history is empty.`;
    }

    this._size -= 1;
    const command = this._history[this._size]; // The last applied command in the history
    callback(command);
    return `The ${this.formatCommand(this._history[this._size])} was successfully undone.`;
  };

  restore(callback: (command: ICommand) => void): string {
    if (!this.canRestoreChanges()) {
      return `There is nothing to restore.`;
    }

    const command = this._history[this._size]; // The next command in the history
    callback(command);
    this._size += 1;
    // We need to subtract one to return the current command formatted
    return `The ${this.formatCommand(this._history[this._size - 1])} has been successfully restored.`;
  };
}

export { ICommand, ICommandHistory, CommandHistory };