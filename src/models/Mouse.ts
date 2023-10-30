import DrawingModes from '../enums/DrawingModes';

interface IMouse {
  posX: number;
  posY: number;
  drawingMode: DrawingModes;
}

class Mouse implements IMouse {
  private _drawingMode: DrawingModes = DrawingModes.HOVER;
  constructor(private _posX: number, private _posY: number) { }

  get posX(): number {
    return this._posX;
  }

  get posY(): number {
    return this._posY;
  }

  get drawingMode(): DrawingModes {
    return this._drawingMode;
  }
}

export default Mouse;