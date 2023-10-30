import * as readline from 'readline';
import Canvas from './models/Canvas';

const canvas = new Canvas(30, 30);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', input => {
  if (input.trim()) {
    process.stdout.write(`You wrote: ${input}\r\n`);
  }
});