import DrawingModes from '../enums/DrawingModes';
import Directions from '../enums/Directions';
import Point from './Point';

interface ICursor {
  position: Point;
  drawingMode: DrawingModes;
  direction: Directions;

  rotate(n: number): Directions;
  step(n: number): void;
}

class Cursor implements ICursor {
  private _drawingMode: DrawingModes = DrawingModes.HOVER;
  private _direction: Directions = Directions.NORTH;
  constructor(
    private _posX: number,
    private _posY: number,
    private _minPosX: number,
    private _maxPosX: number,
    private _minPosY: number,
    private _maxPosY: number
  ) {
    if (_posX > _maxPosX || _posX < _minPosX) {
      throw new Error('The x-coordinate must be within the bounds.');
    } else if (_posY > _maxPosY || _posY < _minPosY) {
      throw new Error('The y-coordinate must be within the bounds.');
    }
  }

  get position(): Point {
    return { x: this._posX, y: this._posY };
  }

  get drawingMode(): DrawingModes {
    return this._drawingMode;
  }

  get direction(): Directions {
    return this._direction;
  }

  set drawingMode(mode: DrawingModes) {
    this._drawingMode = mode;
  }

  rotate(n: number): Directions {
    const mappings = new Map<Directions, Directions>([
      [Directions.NORTH, Directions.NORTHEAST],
      [Directions.NORTHEAST, Directions.EAST],
      [Directions.EAST, Directions.SOUTHEAST],
      [Directions.SOUTHEAST, Directions.SOUTH],
      [Directions.SOUTH, Directions.SOUTHWEST],
      [Directions.SOUTHWEST, Directions.WEST],
      [Directions.WEST, Directions.NORTHWEST],
      [Directions.NORTHWEST, Directions.NORTH],
    ]);

    // At most we'll have to do 7 rotations since the total number of directions is 8
    const times: number = (n % mappings.size) + mappings.size;

    for (let i = 0; i < times; i++) {
      this._direction = mappings.get(this._direction) ?? this._direction;
    }

    return this._direction;
  }

  step(n: number): void {
    const mappings = new Map<Directions, Point>([
      [Directions.NORTH, { x: 0, y: -1 }],
      [Directions.NORTHEAST, { x: 1, y: -1 }],
      [Directions.EAST, { x: 1, y: 0 }],
      [Directions.SOUTHEAST, { x: 1, y: 1 }],
      [Directions.SOUTH, { x: 0, y: 1 }],
      [Directions.SOUTHWEST, { x: -1, y: 1 }],
      [Directions.WEST, { x: -1, y: 0 }],
      [Directions.NORTHWEST, { x: -1, y: -1 }],
    ]);

    const stepsX = (mappings.get(this._direction)?.x ?? 0) * n;
    const stepsY = (mappings.get(this._direction)?.y ?? 0) * n;

    this._posX = Math.max(this._minPosX, Math.min(this._maxPosX, this._posX + stepsX));
    this._posY = Math.max(this._minPosY, Math.min(this._maxPosY, this._posY + stepsY));
  }
}

export default Cursor;