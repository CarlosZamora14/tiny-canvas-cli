import { Cursor, ICursor } from './Cursor';
import { Point } from './Point';
import {
  BoxDrawingCharacters as BoxChars,
  Directions,
  DrawingModes,
} from '../enums';

interface ICanvas {
  drawingMode: DrawingModes;
  cursorPosition: Point;
  cursorDirection: Directions;

  display(callback: (arg: string) => void): void;
  clear(): void;
  moveCursor(steps: number): void;
  rotateCursorDirection(times: number): void;
}

class Canvas implements ICanvas {
  private _data: string[][];
  private _cursor: ICursor;

  constructor(private _width: number, private _height: number) {
    if (_width < 0) throw new Error('The width of the canvas can not be negative');
    if (_height < 0) throw new Error('The height of the canvas can not be negative');

    this._data = Array(_height).fill(0).map(() => Array(_width).fill(' '));
    this._cursor = new Cursor(
      Math.floor(_width / 2), Math.floor(_height / 2),
      0, _width - 1,
      0, _height - 1
    );
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
      const line = BoxChars.VERTICAL + row.join('') + BoxChars.VERTICAL;
      callback(line + crlf);
    });
    callback(bottomBorder + crlf);
  }

  clear(): void {
    this._data.forEach(row => {
      row.forEach((_, index) => {
        row[index] = ' ';
      });
    });
  }

  moveCursor(steps: number): void {
    this._cursor.move(steps, this.update);
  }

  rotateCursorDirection(times: number): void {
    this._cursor.rotate(times);
  }
}

export { ICanvas, Canvas };