import * as child_process from 'child_process';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

const SECRETS_JSON = path.join(path.dirname(__dirname), 'secrets.json');

interface Secrets {
  website_update_key: string;
};

function isSecrets(data: any): data is Secrets {
  return typeof data.website_update_key === 'string';
}

// Load secrets
fs.readFile(SECRETS_JSON, (err, data) => {
  if (err) {
    console.error("Error loading secrets file: ", SECRETS_JSON);
    console.error(err);
    process.exit(1);
    return;
  }
  const secrets = JSON.parse(data as any) as unknown;
  if (!isSecrets(secrets)) {
    console.error("Invalid secrets file");
    process.exit(1);
    return;
  }

  const app = express()
  const port = 3000
  
  app.all(`/webhooks/${secrets.website_update_key}`, (_req, res) => {
    // Run command to update website
    child_process.execFile('/var/www/queeriouslabs.com/deploy.sh', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        res.send('Error');
        return;
      }
      console.log(`stdout:\n${stdout}`);
      console.log(`stderr:\n${stderr}`);
      res.send('Success');
    });
  })
  
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))

});
