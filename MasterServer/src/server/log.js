import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const logFilePath = path.join(__dirname, '../../log.txt');

export function logMessage(message) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `${timestamp}: ${message}\n`;

    console.log(formattedMessage);   // Log the message to the consoles
    fs.appendFile(logFilePath, formattedMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
}
