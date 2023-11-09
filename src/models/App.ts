import * as readLine from 'readline';
import assert from 'assert';
import { ICanvas } from './Canvas';
import { ICommand } from './CommandHistory';
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

    const commandNames: string[] = Object.values(Commands);
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

  private parseInput(line: string): ICommand | null { // Returns null when the line is not a valid command
    const input: string = line.trim().toLowerCase();
    const crlf: string = '\r\n';
    const numberRegex: RegExp = /^[0-9]+$/;
    const commandNames: string[] = Object.values(Commands);

    if (!input) {
      // No input, there is no error but also not output
      return null;
    }

    // First we check that there is a valid command
    const [command, ...args] = input.split(' ');
    if (!commandNames.includes(command)) {
      this._outputCb(Messages.UNKNOWN_COMMAND + crlf);
      return null;
    }

    if (args.length > 1) {
      // There is no command that accepts more than 1 argument
      this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS + crlf);
      return null;
    }

    if (command === Commands.INFO) {
      if (args.length === 1 && commandNames.includes(args[0])) {
        this._outputCb('Info command with argument ' + args[0] + crlf);
        return { type: command, userArgs: args, actualArgs: args } as ICommand;
      } else if (args.length === 0) {
        this._outputCb('Info command' + crlf);
        return { type: command } as ICommand;
      } else {
        this._outputCb(Messages.UNKNOWN_COMMAND + crlf);
        return null;
      }
    }

    if (
      command === Commands.STEPS ||
      command === Commands.ROTATE ||
      command === Commands.ROTATE_CLOCKWISE
    ) {
      if (args.length === 0) {
        return { type: command, userArgs: ['1'], actualArgs: ['1'] } as ICommand;
      } else if (!numberRegex.test(args[0])) {
        this._outputCb(`Usage: ${command} <number>` + crlf);
        return null;
      } else {
        return { type: command, userArgs: args, actualArgs: args } as ICommand;
      }
    }

    if (args.length > 0) {
      // The remaining unhandled commands do not require any arguments
      this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS + crlf);
      return null;
    }

    return { type: command } as ICommand;
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

  execute(line: string): void {
    const command: ICommand | null = this.parseInput(line);

    if (command === null) {
      return;
    }

    switch (command.type) {
      case Commands.DISPLAY:
        this.displayCommand();
        break;
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
      case Commands.POSITION:
        this.positionCommand();
        break;
      case Commands.DIRECTION:
        this.directionCommand();
        break;
      case Commands.QUIT:
        this.quitCommand();
        break;
      case Commands.SAVE:
        this.saveCommand();
        break;
      default:
        this._outputCb(Messages.UNKNOWN_COMMAND + '\r\n');
    }
  }

  private displayCommand(): void {
    this._canvas.display(text => {
      this._outputCb(text);
    });
  }

  private clearCommand(): void {
    this._canvas.clear();
    this._canvas.numberOfOperations += 1;
  }

  private stepsCommand(command: ICommand): void {
    assert(command.actualArgs !== undefined, 'The command was not parsed properly.');
    this._canvas.moveCursor(Number(command.actualArgs[0]), false);
    this._canvas.numberOfOperations += 1;
  }

  private setDrawingMode(command: ICommand): void {
    switch (command.type) {
      case Commands.DRAW:
        this._canvas.drawingMode = DrawingModes.DRAW;
        break;
      case Commands.HOVER:
        this._canvas.drawingMode = DrawingModes.HOVER;
        break;
      case Commands.ERASER:
        this._canvas.drawingMode = DrawingModes.ERASER;
        break;
    }
  }

  private rotateCommand(command: ICommand): void {
    assert(command.actualArgs !== undefined, 'The command was not parsed properly.');

    if (command.type === Commands.ROTATE) {
      this._canvas.rotateCursorDirection(-Number(command.actualArgs[0]));
    } else {
      this._canvas.rotateCursorDirection(Number(command.actualArgs[0]));
    }
  }

  private positionCommand() {
    const { x, y } = this._canvas.cursorPosition;
    this._outputCb(`The current cursor position is (${x}, ${y})` + '\r\n');
  }

  private directionCommand() {
    const direction: string = this._canvas.cursorDirection;
    this._outputCb(`The current cursor direction is ${direction}` + '\r\n');
  }

  private quitCommand() {
    this._closeCb();
  }

  private async saveCommand() {
    this._readLineInterface.removeAllListeners();
    await this.saveFileDialog();
    this.run();
  }
}

export { IApp, App };