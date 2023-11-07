import fs from 'fs';
import path from 'path';

function saveFile(content: string, filename: string) {
  try {
    filename += '.txt';
    fs.writeFileSync(path.join(__dirname, '..', '..', filename), content);
  } catch (err) {
    process.stdout.write(`There was an error: ${err}`);
  }
}

export { saveFile };