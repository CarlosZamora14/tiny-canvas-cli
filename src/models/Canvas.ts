import assert from 'assert';
import { Cursor, ICursor } from './Cursor';
import { Point } from './Point';
import {
  BoxDrawingCharacters as BoxChars,
  Directions,
  DrawingModes,
} from '../enums';

interface ICell {
  value: string;
  drawCount: number; // Variable that tracks how many times a cell has been drawn
  previousDrawCounts: Map<number, number>; // Map that associates the value of drawCount after n operations
}

interface ICanvas {
  drawingMode: DrawingModes;
  cursorPosition: Point;
  cursorDirection: Directions;
  numberOfOperations: number;

  getCanvasData(): string;
  display(callback: (arg: string) => void): void;
  clear(): void;
  moveCursor(steps: number, undoing: boolean): void;
  rotateCursorDirection(times: number): void;
}

class Canvas implements ICanvas {
  private _data: ICell[][];
  private _cursor: ICursor;
  private _numberOfOperations: number = 0;

  constructor(private _width: number, private _height: number) {
    if (_width < 0) throw new Error('The width of the canvas can not be negative');
    if (_height < 0) throw new Error('The height of the canvas can not be negative');

    this._data = Array(_height).fill(0).map(() => Array(_width).fill(0).map(() => {
      const cell = {
        value: ' ',
        drawCount: 0,
        previousDrawCounts: new Map<number, number>()
      } as ICell;

      return cell;
    }));
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

  get numberOfOperations(): number {
    return this._numberOfOperations;
  }

  set drawingMode(mode: DrawingModes) {
    this._cursor.drawingMode = mode;
  }

  set numberOfOperations(value: number) {
    this._numberOfOperations = value;
  }

  private invertCursorDrawingMode(): void {
    switch (this._cursor.drawingMode) {
      case DrawingModes.DRAW:
        this._cursor.drawingMode = DrawingModes.ERASER;
        break;
      case DrawingModes.ERASER:
        this._cursor.drawingMode = DrawingModes.HOVER;
        break;
    }
  }

  // This method has to be an arrow function since it'llget called from the Cursor class
  private update: (undoing: boolean) => void = (undoing: boolean) => {
    const { x, y } = this._cursor.position;
    const cell: ICell = this._data[y][x];

    if (undoing) {
      this.invertCursorDrawingMode();
    }

    switch (this.drawingMode) {
      case DrawingModes.DRAW:
        if (undoing) {
          // If we are undoing a ERASE operation the current cell must have a value of ' '
          assert(
            cell.value === ' ',
            `There is a cell in an invalid state, either the undoing argument was set to true when
            it should have been false or the update method is not working as expected`
          );
          cell.drawCount = cell.previousDrawCounts.get(this._numberOfOperations) ?? 0;
          cell.value = cell.drawCount > 0 ? '*' : ' ';
        } else {
          cell.value = '*';
          cell.drawCount += 1;
        }
        break;
      case DrawingModes.ERASER:
        if (undoing) {
          // If we are undoing a DRAW operation the current cell must have a value of '*'
          assert(
            cell.value === '*',
            `There is a cell in an invalid state, either the undoing argument was set to true when
            it should have been false or the update method is not working as expected`
          );
          assert(
            cell.drawCount > 0,
            `Cell in invalid state. You can not undone a drawing operation on a cell if the cell is empty`
          );
          cell.drawCount -= 1;
          cell.value = cell.drawCount === 0 ? ' ' : '*';
        } else {
          cell.value = ' ';
          cell.previousDrawCounts.set(this._numberOfOperations, cell.drawCount);
          cell.drawCount = 0;
        }
        break;
    }

    if (undoing) {
      this.invertCursorDrawingMode();
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
      const rowValues: string = row.reduce((prev, cur) => (prev + cur.value), '');
      const line: string = BoxChars.VERTICAL + rowValues + BoxChars.VERTICAL;
      callback(line + crlf);
    });
    callback(bottomBorder + crlf);
  }

  getCanvasData(): string {
    let data: string = '';
    const crlf: string = '\r\n';

    this._data.forEach(row => {
      const rowValues: string = row.reduce((prev, cur) => (prev + cur.value), '');
      data += (rowValues + crlf);
    });

    return data;
  }

  clear(): void {
    this._data.forEach(row => {
      row.forEach((_, index) => {
        row[index].value = ' ';
        row[index].previousDrawCounts.set(this._numberOfOperations, row[index].drawCount);
        row[index].drawCount = 0;
      });
    });
  }

  moveCursor(steps: number, undoing: boolean): void {
    this._cursor.move(steps, this.update, undoing);
  }

  rotateCursorDirection(times: number): void {
    this._cursor.rotate(times);
  }
}

export { ICanvas, Canvas };