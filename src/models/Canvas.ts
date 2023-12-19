import assert from 'assert';
import { Cursor, ICursor } from './Cursor';
import { ICommand } from './Command';
import { Point } from './Point';
import {
  BoxDrawingCharacters as BoxChars,
  Commands,
  Directions,
  DrawingModes,
} from '../enums';

interface ICanvas {
  drawingMode: DrawingModes;
  cursorPosition: Point;
  cursorDirection: Directions;
  width: number;
  height: number;

  getCanvasData(): string;
  display(callback: (arg: string) => void): void;
  clear(): void;
  moveCursor(steps: number): void;
  rotateCursorDirection(times: number): void;
  executeCommand(command: ICommand): void;
}

class Canvas implements ICanvas {
  private _data: string[][];
  private _cursor: ICursor;

  constructor(private _width: number, private _height: number, private _outputCb: (arg: string) => void) {
    if (_width < 0) throw new Error('The width of the canvas can not be negative');
    if (_height < 0) throw new Error('The height of the canvas can not be negative');

    this._data = Array(_height).fill(0).map(() => Array(_width).fill(' '));

    this._cursor = new Cursor(
      Math.floor(_width / 2), Math.floor(_height / 2),
      0, _width - 1,
      0, _height - 1
    );
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

  private clearCommand(): void {
    this.clear();
  }

  private stepsCommand(command: ICommand): void {
    assert(command.args !== undefined, 'The command was not parsed properly.');
    this.moveCursor(Number(command.args[0]));
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
  }

  private rotateCommand(command: ICommand): void {
    assert(command.args !== undefined, 'The command was not parsed properly.');

    if (command.type === Commands.ROTATE) {
      this.rotateCursorDirection(-Number(command.args[0]));
    } else {
      this.rotateCursorDirection(Number(command.args[0]));
    }
  }

  private undoCommand(command: ICommand): void {
    switch (command.type) {
      case Commands.CLEAR:
        this.clearCommand();
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
    }
  }

  private restoreCommand(command: ICommand): void {

  }

  display(callback: (arg: string) => void): void {
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

    callback(topBorder + crlf);
    this._data.forEach(row => {
      const rowValues: string = row.reduce((prev, cur) => (prev + cur), '');
      const line: string = BoxChars.VERTICAL + rowValues + BoxChars.VERTICAL;
      callback(line + crlf);
    });
    callback(bottomBorder + crlf);
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
        this.clearCommand();
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
        this.undoCommand(command);
        break;
      case Commands.RESTORE:
        this.restoreCommand(command);
        break;
    }
    this.generateCanvasSnapshot()
  }

  generateCanvasSnapshot(): string[][] {
    const result: string[][] = this._data.map(row => row.map(cell => cell));
    return result;
  }
}

export { ICanvas, Canvas };