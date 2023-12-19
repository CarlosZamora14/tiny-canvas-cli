import fs from 'fs';
import path from 'path';

function saveFile(content: string, filename: string): string {
  try {
    const folderName = 'files';
    const folderPath = path.join(__dirname, '..', '..', folderName);
    filename += '.txt';

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderPath);
    }

    const filePath: string = path.join(folderPath, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  } catch (err) {
    throw new Error(`There was an error: ${err}`);
  }
}

export { saveFile };