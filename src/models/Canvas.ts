import {
  Cursor,
  ICursor,
  ICursorState,
  ICommand,
  IHistory,
  History,
  Point
} from './';

import {
  BoxDrawingCharacters as BoxChars,
  Colors,
  Commands,
  Directions,
  DrawingModes,
  Messages,
} from '../enums';
import { useColor } from '../utils';

interface ICanvas {
  drawingMode: DrawingModes;
  cursorPosition: Point;
  cursorDirection: Directions;
  width: number;
  height: number;

  getCanvasData(): string;
  display(): void;
  clear(): void;
  moveCursor(steps: number): void;
  rotateCursorDirection(times: number): void;
  executeCommand(command: ICommand): void;
}

class Canvas implements ICanvas {
  private _data: string[][];
  private _cursor: ICursor;
  private _history: IHistory;

  constructor(private _width: number, private _height: number, private _outputCb: (arg: string) => void) {
    if (_width < 0) throw new Error('The width of the canvas can not be negative');
    if (_height < 0) throw new Error('The height of the canvas can not be negative');

    this._data = Array(_height).fill(0).map(() => Array(_width).fill(' '));

    this._cursor = new Cursor(
      Math.floor(_width / 2), Math.floor(_height / 2),
      0, _width - 1,
      0, _height - 1
    );

    this._history = new History(this._cursor.getState(), this.getCanvasState());
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get drawingMode(): DrawingModes {
    return this._cursor.drawingMode;
  }

  get cursorPosition(): Point {
    return this._cursor.position;
  }

  get cursorDirection(): Directions {
    return this._cursor.direction;
  }

  set drawingMode(mode: DrawingModes) {
    this._cursor.drawingMode = mode;
  }

  // This method has to be an arrow function since it'll get called from the Cursor class
  private update: () => void = () => {
    const { x, y } = this._cursor.position;

    switch (this.drawingMode) {
      case DrawingModes.DRAW:
        this._data[y][x] = '*';
        break;
      case DrawingModes.ERASER:
        this._data[y][x] = ' ';
        break;
    }
  };

  private clearCommand(command: ICommand): void {
    this.clear();
    this._history.store(command, this._cursor.getState(), this.getCanvasState());
  }

  private stepsCommand(command: ICommand): void {
    if (command.args === undefined) {
      throw new Error("The command 'steps' was not parsed properly.");
    }

    this.moveCursor(Number(command.args[0]));
    this._history.store(command, this._cursor.getState(), this.getCanvasState());
  }

  private setDrawingMode(command: ICommand): void {
    switch (command.type) {
      case Commands.DRAW:
        this._cursor.drawingMode = DrawingModes.DRAW;
        break;
      case Commands.HOVER:
        this._cursor.drawingMode = DrawingModes.HOVER;
        break;
      case Commands.ERASER:
        this._cursor.drawingMode = DrawingModes.ERASER;
        break;
    }

    this._history.store(command, this._cursor.getState(), this.getCanvasState());
  }

  private rotateCommand(command: ICommand): void {
    if (command.args === undefined) {
      throw new Error("The command 'rotate' was not parsed properly.");
    }

    if (command.type === Commands.ROTATE) {
      this.rotateCursorDirection(-Number(command.args[0]));
    } else {
      this.rotateCursorDirection(Number(command.args[0]));
    }

    this._history.store(command, this._cursor.getState(), this.getCanvasState());
  }

  private setState(canvasState: string[][], cursorState: ICursorState): void {
    if (canvasState.length !== this._data.length || canvasState[0].length !== this._data[0].length) {
      throw new Error('The dimensions of the new canvas state must match the previous canvas.');
    }

    this._cursor.setState(cursorState);
    canvasState.forEach((row, yIndex) => {
      row.forEach((cell, xIndex) => {
        this._data[yIndex][xIndex] = cell;
      });
    });
  }

  private undoCommand(): void {
    const response: string = this._history.undo();
    const crlf: string = '\r\n';

    if (response !== Messages.EMPTY_HISTORY) {
      this.setState(this._history.currentCanvasState, this._history.currentCursorState);
      this._outputCb(useColor(Colors.GREEN, response + crlf + crlf));
    } else {
      this._outputCb(useColor(Colors.YELLOW, response + crlf + crlf));
    }
  }

  private restoreCommand(): void {
    const response: string = this._history.restore();
    const crlf: string = '\r\n';

    if (response !== Messages.NOTHING_TO_RESTORE) {
      this.setState(this._history.currentCanvasState, this._history.currentCursorState);
      this._outputCb(useColor(Colors.GREEN, response + crlf + crlf));
    } else {
      this._outputCb(useColor(Colors.YELLOW, response + crlf + crlf));
    }
  }

  display(): void {
    const topBorder: string = (
      BoxChars.TOP_LEFT_CORNER +
      BoxChars.HORIZONTAL.repeat(this._width) +
      BoxChars.TOP_RIGHT_CORNER
    );
    const bottomBorder: string = (
      BoxChars.BOTTOM_LEFT_CORNER +
      BoxChars.HORIZONTAL.repeat(this._width) +
      BoxChars.BOTTOM_RIGHT_CORNER
    );
    const crlf: string = '\r\n';

    this._outputCb(topBorder + crlf);
    this._data.forEach(row => {
      const rowValues: string = row.reduce((prev, cur) => (prev + cur), '');
      const line: string = BoxChars.VERTICAL + rowValues + BoxChars.VERTICAL;
      this._outputCb(line + crlf);
    });
    this._outputCb(bottomBorder + crlf + crlf);
  }

  getCanvasData(): string {
    let data: string = '';
    const crlf: string = '\r\n';

    this._data.forEach(row => {
      const rowValues: string = row.reduce((prev, cur) => (prev + cur), '');
      data += (rowValues + crlf);
    });

    return data;
  }

  clear(): void {
    this._data.forEach(row => {
      row.forEach((_, index) => {
        row[index] = ' ';
      });
    });
  }

  moveCursor(steps: number): void {
    // We call it once because it needs to draw the current cell even if the number of steps is zero
    this.update();
    this._cursor.move(steps, this.update);
  }

  rotateCursorDirection(times: number): void {
    this._cursor.rotate(times);
  }

  executeCommand(command: ICommand): void {
    switch (command.type) {
      case Commands.CLEAR:
        this.clearCommand(command);
        break;
      case Commands.STEPS:
        this.stepsCommand(command);
        break;
      case Commands.ROTATE:
      case Commands.ROTATE_CLOCKWISE:
        this.rotateCommand(command);
        break;
      case Commands.DRAW:
      case Commands.HOVER:
      case Commands.ERASER:
        this.setDrawingMode(command);
        break;
      case Commands.UNDO:
        this.undoCommand();
        break;
      case Commands.RESTORE:
        this.restoreCommand();
        break;
    }
  }

  getCanvasState(): string[][] {
    const result: string[][] = this._data.map(row => row.map(cell => cell));
    return result;
  }
}

export { ICanvas, Canvas };