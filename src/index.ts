import * as readline from 'readline';
import { Canvas, ICanvas, App, IApp } from './models';

const width = 30, height = 30;
const canvas: ICanvas = new Canvas(width, height);
const app: IApp = new App(
  canvas,
  (arg: string): void => { process.stdout.write(arg); },
  (): void => { process.exit(0); }
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', line => {
  app.execute(line);
});