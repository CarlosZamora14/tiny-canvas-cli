import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', input => {
  if (input.trim()) {
    process.stdout.write(`You wrote: ${input}\r\n`);
  }
});