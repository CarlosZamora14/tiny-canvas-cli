import fs from 'fs';
import path from 'path';

function fileExists(filename: string): boolean {
  try {
    filename += '.txt';
    return fs.existsSync(path.join(__dirname, '..', '..', 'files', filename));
  } catch (err) {
    throw err;
  }
}

export { fileExists };