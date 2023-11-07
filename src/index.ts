import * as readline from 'readline';
import { Canvas, App } from './models';

const width = 30, height = 30;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

new App(
  new Canvas(width, height),
  (arg: string): void => { process.stdout.write(arg); },
  (): void => { process.exit(0); },
  rl,
);