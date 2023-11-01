import { ICanvas } from './Canvas';
import BoxChars from '../enums/BoxDrawingCharacters';
import Commands from '../enums/Commands';
import Messages from '../enums/Messages';
import DrawingModes from '../enums/DrawingModes';

interface IApp {
  execute: (line: string) => void;
}

class App implements IApp {
  constructor(
    private _canvas: ICanvas,
    private _outputCb: (arg: string) => void,
    private _closeCb: () => void
  ) {
    this.displayCommands();
  }

  private displayCommands(): void {
    const minWidth: number = 50;
    const terminalWidth: number = Math.min(process.stdout.columns ?? minWidth, minWidth);
    const crlf: string = '\r\n';
    const title: string = 'Available commands';

    this._outputCb(BoxChars.HORIZONTAL.repeat(terminalWidth) + crlf);
    this._outputCb(App.padCenter(title, terminalWidth) + crlf);
    this._outputCb(BoxChars.HORIZONTAL.repeat(terminalWidth) + crlf);

    const commandNames = Object.values(Commands) as string[];
    commandNames.forEach(command => {
      switch (command) {
        case Commands.INFO:
          command = `${command} <command-name>`;
          break;
        case Commands.STEPS:
        case Commands.ROTATE:
        case Commands.ROTATE_CLOCKWISE:
          command = `${command} <n>`;
          break;
      }

      const line: string = command.padStart(command.length + Math.floor((terminalWidth - title.length) / 2));
      this._outputCb(line + crlf);
    });
  }

  private static padCenter(text: string, len: number): string {
    if (text.length >= len) return text;

    const start: string = ' '.repeat(Math.floor((len - text.length) / 2));
    const end: string = ' '.repeat(len - (text.length + start.length));

    return (start + text + end);
  }

  execute(line: string): void {
    const input: string = line.trim().toLowerCase();
    const crlf: string = '\r\n';

    if (input) {
      const [command, ...rest] = input.split(' ');
      switch (command) {
        case Commands.DISPLAY:
          if (rest.length === 0) {
            this._canvas.display(text => {
              this._outputCb(text);
            });
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.CLEAR:
          if (rest.length === 0) {
            this._canvas.clear();
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.STEPS:
          if (rest.length === 0) {
            this._canvas.moveCursor(1);
          } else if (rest.length === 1 && rest[0].match(/^[0-9]+$/)) {
            this._canvas.moveCursor(Number(rest[0]));
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.ROTATE:
          if (rest.length === 0) {
            this._canvas.rotateCursorDirection(-1);
          } else if (rest.length === 1 && rest[0].match(/^[0-9]+$/)) {
            this._canvas.rotateCursorDirection(-Number(rest[0]));
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.ROTATE_CLOCKWISE:
          if (rest.length === 0) {
            this._canvas.rotateCursorDirection(1);
          } else if (rest.length === 1 && rest[0].match(/^[0-9]+$/)) {
            this._canvas.rotateCursorDirection(Number(rest[0]));
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.DRAW:
          if (rest.length === 0) {
            this._canvas.drawingMode = DrawingModes.DRAW;
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.HOVER:
          if (rest.length === 0) {
            this._canvas.drawingMode = DrawingModes.HOVER;
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.ERASER:
          if (rest.length === 0) {
            this._canvas.drawingMode = DrawingModes.ERASER;
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.POSITION:
          if (rest.length === 0) {
            const { x, y } = this._canvas.cursorPosition;
            this._outputCb(`The current cursor position is (${x}, ${y})`);
            this._outputCb(crlf);
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.DIRECTION:
          if (rest.length === 0) {
            const direction: string = this._canvas.cursorDirection;
            this._outputCb(`The current cursor direction is ${direction}`);
            this._outputCb(crlf);
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.QUIT:
          if (rest.length === 0) {
            this._closeCb();
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        default:
          this._outputCb(Messages.UNKNOWN_COMMAND);
          this._outputCb(crlf);
      }
    }
  }
}

export { IApp, App as default };