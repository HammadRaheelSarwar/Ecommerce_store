import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scheduleBackups = () => {
  cron.schedule('0 2 * * *', () => {
    console.log('Automated Database Backup starting...');
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)){
        fs.mkdirSync(backupDir);
    }

    const dbName = 'allavailable';
    const date = new Date().toISOString().split('T')[0];
    const backupPath = path.join(backupDir, `${dbName}-${date}`);

    exec(`mongodump --db ${dbName} --out "${backupPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup error: ${error.message}`);
        return;
      }
      console.log(`Backup completed successfully at ${backupPath}`);
    });
  });
  console.log('Cron backup jobs scheduled.');
};

export default scheduleBackups;
