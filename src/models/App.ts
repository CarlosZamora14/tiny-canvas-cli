import * as readLine from 'readline';
import { ICanvas } from './Canvas';
import {
  BoxDrawingCharacters as BoxChars,
  Commands,
  Messages,
  DrawingModes,
} from '../enums';
import { fileExists } from '../utils/fileExists';
import { saveFile } from '../utils/saveFile';

interface IApp {
  execute: (line: string) => void;
}

class App implements IApp {
  constructor(
    private _canvas: ICanvas,
    private _outputCb: (arg: string) => void,
    private _closeCb: () => void,
    private _readLineInterface: readLine.Interface,
  ) {
    this.displayCommands();
    this.run();
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

  private run() {
    this._readLineInterface.on('line', line => {
      this.execute(line);
    });
  }

  private askPrompt(question: Messages, messageOnError: Messages, conditionCb: (input: string) => boolean): Promise<string> {
    let answer: string;
    const crlf: string = '\r\n';

    return new Promise<string>((resolve, reject) => {
      try {
        this._readLineInterface.question(question, async input => {

          if (!conditionCb(input)) {
            this._outputCb(messageOnError);
            this._outputCb(crlf);

            answer = await this.askPrompt(question, messageOnError, conditionCb);
          } else {
            answer = input;
          }

          resolve(answer);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private async saveFileDialog(): Promise<void> {
    const filenameRegex: RegExp = /^\s*\w+\s*$/;
    const yesOrNoRegex: RegExp = /^\s*(y|n|yes|no)\s*$/i;
    const crlf = '\r\n';

    try {
      let filename = await this.askPrompt(Messages.REQUEST_FILE_NAME, Messages.INVALID_FILE_NAME, (input: string): boolean => {
        return filenameRegex.test(input);
      });

      if (fileExists(filename)) {
        this._outputCb(Messages.FILE_EXISTS + crlf);
        let confirmation = await this.askPrompt(Messages.REPLACE_FILE, Messages.INVALID_ANSWER, (input: string): boolean => {
          return yesOrNoRegex.test(input);
        });

        confirmation = confirmation.trim().toLowerCase()[0];

        if (confirmation === 'y') {
          saveFile(this._canvas.getCanvasData(), filename);
          this._outputCb(Messages.FILE_SAVED + crlf);
        } else {
          this.saveFileDialog();
        }
      } else {
        saveFile(this._canvas.getCanvasData(), filename);
        this._outputCb(Messages.FILE_SAVED + crlf);
      }
    } catch (err) {
      throw err;
    }
  }

  async execute(line: string): Promise<void> {
    const input: string = line.trim().toLowerCase();
    const crlf: string = '\r\n';
    const numberRegex: RegExp = /^[0-9]+$/;

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
          } else if (rest.length === 1 && numberRegex.test(rest[0])) {
            this._canvas.moveCursor(Number(rest[0]));
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.ROTATE:
          if (rest.length === 0) {
            this._canvas.rotateCursorDirection(-1);
          } else if (rest.length === 1 && numberRegex.test(rest[0])) {
            this._canvas.rotateCursorDirection(-Number(rest[0]));
          } else {
            this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS);
            this._outputCb(crlf);
          }
          break;
        case Commands.ROTATE_CLOCKWISE:
          if (rest.length === 0) {
            this._canvas.rotateCursorDirection(1);
          } else if (rest.length === 1 && numberRegex.test(rest[0])) {
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
        case Commands.SAVE:
          if (rest.length === 0) {
            this._readLineInterface.removeAllListeners();
            await this.saveFileDialog();
            this.run();

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

export { IApp, App };