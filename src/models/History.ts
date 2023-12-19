import { ICursorState } from './Cursor';
import { ICommand } from './Command';
import { Messages } from '../enums';

interface IHistory {
  size: number;
  currentCursorState: ICursorState;
  currentCanvasState: string[][];
  // The return value of these methods is a formatted string which will be display in the cli
  undo: () => string;
  restore: () => string;
  store: (command: ICommand, cursorState: ICursorState, canvasState: string[][]) => string;
}

class History implements IHistory {
  private _canvasStates: string[][][] = [];
  private _commandHistory: ICommand[] = [];
  private _cursorStates: ICursorState[] = [];
  private _size: number = 0; // The total number of applied commands, not counting the ones we might have previously undone

  constructor(initialCursorState: ICursorState, initialcanvasState: string[][]) {
    this._cursorStates.push(initialCursorState);
    this._canvasStates.push(initialcanvasState);
  }

  get size(): number {
    return this._size;
  }

  get currentCursorState(): ICursorState {
    return this._cursorStates[this._size];
  }

  get currentCanvasState(): string[][] {
    const result: string[][] = this._canvasStates[this._size].map(row => row.map(cell => cell));
    return result;
  }

  private formatCommand(command: ICommand): string {
    if (!command.args) {
      return `${command.type} command`;
    }

    return `'${command.type}' command with argument${command.args.length > 1 ? 's' : ''} ${command.args.join(' ')}`;
  }

  private canRestoreChanges(): boolean {
    return this._size !== this._commandHistory.length;
  }

  store(command: ICommand, cursorState: ICursorState, canvasState: string[][]): string {
    if (this._commandHistory.length > this._size) {
      // Removes the previous undone operations and cursor states
      this._commandHistory.splice(this._size);
      this._cursorStates.splice(this._size + 1);
      this._canvasStates.splice(this._size + 1);
    }

    this._commandHistory.push(command);
    this._cursorStates.push(cursorState);
    this._canvasStates.push(canvasState);
    this._size += 1;
    return `Applied ${this.formatCommand(command)} successfully.`;
  };

  undo(): string {
    if (this._size === 0) {
      return Messages.EMPTY_HISTORY;
    }

    this._size -= 1;
    const command = this._commandHistory[this._size]; // The last applied command in the history
    return `The ${this.formatCommand(command)} was successfully undone.`;
  };

  restore(): string {
    if (!this.canRestoreChanges()) {
      return Messages.NOTHING_TO_RESTORE;
    }

    const command = this._commandHistory[this._size]; // The next command in the history
    this._size += 1;
    // We need to subtract one to return the current command formatted
    return `The ${this.formatCommand(command)} has been successfully restored.`;
  };
}

export { IHistory, History };