import * as readLine from 'readline';
import { ICanvas } from './Canvas';
import { ICommand } from './Command';
import {
  BoxDrawingCharacters as BoxChars,
  Commands,
  Messages,
  CommandsInfo,
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

  private getCommandInfo(commandName: string): string {
    const commandMapping: Record<Commands, CommandsInfo> = {
      [Commands.STEPS]: CommandsInfo.STEPS,
      [Commands.ROTATE]: CommandsInfo.ROTATE,
      [Commands.ROTATE_CLOCKWISE]: CommandsInfo.ROTATE_CLOCKWISE,
      [Commands.HOVER]: CommandsInfo.HOVER,
      [Commands.DRAW]: CommandsInfo.DRAW,
      [Commands.ERASER]: CommandsInfo.ERASER,
      [Commands.POSITION]: CommandsInfo.POSITION,
      [Commands.DIRECTION]: CommandsInfo.DIRECTION,
      [Commands.DISPLAY]: CommandsInfo.DISPLAY,
      [Commands.CLEAR]: CommandsInfo.CLEAR,
      [Commands.QUIT]: CommandsInfo.QUIT,
      [Commands.UNDO]: CommandsInfo.UNDO,
      [Commands.RESTORE]: CommandsInfo.RESTORE,
      [Commands.SAVE]: CommandsInfo.SAVE,
      [Commands.INFO]: CommandsInfo.INFO,
    };

    return commandMapping[commandName as Commands];
  }

  private getCommandUsage(commandName: string): string {
    let usage: string = commandName;

    switch (commandName) {
      case Commands.INFO:
        usage += ' <command-name>';
        break;
      case Commands.STEPS:
      case Commands.ROTATE:
      case Commands.ROTATE_CLOCKWISE:
        usage += ' <n>';
        break;
    }

    return usage;
  }

  private printCommandInfo(commandName: string, terminalWidth: number, largestCommandUsage: number): void {
    const crlf: string = '\r\n';
    const tab: string = ' '.repeat(4);
    const commandUsage = this.getCommandUsage(commandName);

    let commandInfo: string = this.getCommandInfo(commandName);
    if (terminalWidth <= largestCommandUsage + 3 * tab.length + 16) {
      this._outputCb(tab + tab + commandUsage + ': ' + commandInfo + crlf + crlf);
    } else {
      let line = tab + tab + commandUsage + ' '.repeat(largestCommandUsage - commandUsage.length) + tab + commandInfo;
      this._outputCb(line.slice(0, terminalWidth) + crlf);
      line = line.slice(terminalWidth);
      while (line.length) {
        line = ' '.repeat(tab.length * 3 + largestCommandUsage + 1) + line;
        this._outputCb(line.slice(0, terminalWidth) + crlf);
        line = line.slice(terminalWidth);
      }
    }
  }

  private displayCommands(): void {
    const minWidth: number = 100;
    const terminalWidth: number = process.stdout.columns ?? minWidth;

    const crlf: string = '\r\n';
    const tab: string = ' '.repeat(4);
    const title: string = 'Available commands';

    const commandNames: string[] = Object.values(Commands);
    const largestCommandUsage = commandNames.reduce((prev, curr) => {
      return Math.max(prev, this.getCommandUsage(curr).length);
    }, 0);

    this._outputCb(BoxChars.HORIZONTAL.repeat(terminalWidth) + crlf);
    this._outputCb(tab + tab + title + crlf);
    this._outputCb(BoxChars.HORIZONTAL.repeat(terminalWidth) + crlf);

    commandNames.forEach(commandName => {
      this.printCommandInfo(commandName, terminalWidth, largestCommandUsage);
    });

    this._outputCb(crlf);
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
      this._outputCb(Messages.UNKNOWN_COMMAND + crlf + crlf);
      return null;
    }

    if (args.length > 1) {
      // There is no command that accepts more than 1 argument
      this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS + crlf + crlf);
      return null;
    }

    if (command === Commands.INFO) {
      if (args.length === 1 && commandNames.includes(args[0])) {
        // this._outputCb('Info command with argument ' + args[0] + crlf + crlf);
        return { type: command, args: args } as ICommand;
      } else if (args.length === 0) {
        // this._outputCb('Info command' + crlf);
        return { type: command } as ICommand;
      } else {
        this._outputCb(Messages.UNKNOWN_COMMAND + crlf + crlf);
        return null;
      }
    }

    if (
      command === Commands.STEPS ||
      command === Commands.ROTATE ||
      command === Commands.ROTATE_CLOCKWISE
    ) {
      if (args.length === 0) {
        return { type: command, args: ['1'] } as ICommand;
      } else if (!numberRegex.test(args[0])) {
        this._outputCb(`Usage: ${command} <number>` + crlf + crlf);
        return null;
      }

      return {
        type: command,
        args: args,
      } as ICommand;
    }


    if (args.length > 0) {
      // The remaining unhandled commands do not require any arguments
      this._outputCb(Messages.WRONG_NUMBER_OF_PARAMETERS + crlf + crlf);
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
            this._outputCb(crlf + crlf);

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
        this._outputCb(Messages.FILE_EXISTS + crlf + crlf);
        let confirmation = await this.askPrompt(Messages.REPLACE_FILE, Messages.INVALID_ANSWER, (input: string): boolean => {
          return yesOrNoRegex.test(input);
        });

        confirmation = confirmation.trim().toLowerCase()[0];

        if (confirmation === 'y') {
          const filePath = saveFile(this._canvas.getCanvasData(), filename);
          this._outputCb(Messages.FILE_SAVED + filePath + crlf + crlf);
        } else {
          this.saveFileDialog();
        }
      } else {
        const filePath = saveFile(this._canvas.getCanvasData(), filename);
        this._outputCb(Messages.FILE_SAVED + filePath + crlf + crlf);
      }
    } catch (err) {
      throw err;
    }
  }

  private executeCommand(command: ICommand): void {
    switch (command.type) {
      case Commands.DISPLAY:
        this.displayCommand();
        break;
      case Commands.CLEAR:
      case Commands.STEPS:
      case Commands.ROTATE:
      case Commands.ROTATE_CLOCKWISE:
      case Commands.DRAW:
      case Commands.HOVER:
      case Commands.ERASER:
      case Commands.UNDO:
      case Commands.RESTORE:
        this._canvas.executeCommand(command);
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
      case Commands.INFO:
        this.commandInfo(command);
        break;
      default:
        this._outputCb(Messages.UNKNOWN_COMMAND + '\r\n' + '\r\n');
    }
  }

  execute(line: string): void {
    const command: ICommand | null = this.parseInput(line);

    if (command === null) {
      return;
    }

    this.executeCommand(command);
  }

  private displayCommand(): void {
    this._canvas.display(text => {
      this._outputCb(text);
    });
  }

  private positionCommand() {
    const { x, y } = this._canvas.cursorPosition;
    this._outputCb(`The current cursor position is (${x}, ${y})` + '\r\n' + '\r\n');
  }

  private directionCommand() {
    const direction: string = this._canvas.cursorDirection;
    this._outputCb(`The current cursor direction is ${direction}` + '\r\n' + '\r\n');
  }

  private quitCommand() {
    this._closeCb();
  }

  private async saveCommand() {
    this._readLineInterface.removeAllListeners();
    await this.saveFileDialog();
    this.run();
  }

  private commandInfo(command: ICommand): void {
    if (!command.args) {
      this.displayCommands();
      return;
    }

    const minWidth: number = 100;
    const terminalWidth: number = process.stdout.columns ?? minWidth;

    const crlf: string = '\r\n';
    const tab: string = ' '.repeat(4);
    const commandName: string = command.args[0];
    const commandUsage: string = this.getCommandUsage(commandName);

    if (terminalWidth <= commandUsage.length + 3 * tab.length + 16) {
      this._outputCb(tab + tab + commandUsage + ': ' + this.getCommandInfo(commandName) + crlf);
    }

    this.printCommandInfo(commandName, terminalWidth, commandUsage.length);
    this._outputCb(crlf);
  }
}

export { IApp, App };