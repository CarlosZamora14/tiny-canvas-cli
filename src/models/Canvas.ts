interface ICanvas {
  display(cb: (arg: string) => void): void;
}

class Canvas implements ICanvas {
  private data: string[][];
  constructor(private width: number, private height: number) {
    this.data = Array(height).fill(0).map(() => Array(width).fill(' '));
  }

  display(cb: (arg: string) => void): void {
    this.data.forEach(row => {
      row.forEach(cell => {
        cb(cell);
      });
      cb('\r\n');
    });
    cb('\r\n');
  }
}

export default Canvas;