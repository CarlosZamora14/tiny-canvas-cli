import * as readline from 'readline';
import { Canvas, App } from './models';

const width = 30, height = 30;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const output = (arg: string): void => { process.stdout.write(arg); }

new App(
  new Canvas(width, height, output),
  output,
  (): void => { process.exit(0); },
  rl,
);