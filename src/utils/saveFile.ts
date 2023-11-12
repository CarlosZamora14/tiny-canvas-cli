import fs from 'fs';
import path from 'path';
import { fileExists } from './fileExists';

function saveFile(content: string, filename: string) {
  try {
    const folderName = 'files';
    const folderPath = path.join(__dirname, '..', '..', folderName);
    filename += '.txt';

    if (!fileExists(folderName)) {
      fs.mkdirSync(folderPath);
    }

    fs.writeFileSync(path.join(folderPath, filename), content);
  } catch (err) {
    process.stdout.write(`There was an error: ${err}`);
  }
}

export { saveFile };