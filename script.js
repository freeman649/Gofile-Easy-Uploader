const axios = require('axios');
const FormData = require('form-data');
const { execSync } = require('child_process');
const notifier = require('node-notifier');
const ConsoleWindow = require("node-hide-console-window");

ConsoleWindow.hideConsole();

const AUTHORIZATION_TOKEN = 'W8sh6pYR3DLob2IuF7SFA1ZB0BrEDzM9';

async function getServer() {
  try {
    const res = await axios({
      url: 'https://api.gofile.io/servers',
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });
    console.log('Gofile Api Check', res.data);

    if (res.data.status !== 'ok') {
      throw new Error('Gofile Server error');
    }
    const server = res.data.data.servers[0]?.name;
    if (!server) {
      throw new Error('no server as been op');
    }
    return server;
  } catch (error) {
    console.error('error link', error.message);
    process.exit(1);
  }
}

async function uploadFile(filePath, server) {
  const formData = new FormData();
  formData.append('file', require('fs').createReadStream(filePath));

  try {
    notifier.notify({
      title: 'Gofile Uploader',
      message: 'Upload as been started',
      sound: true,
    });

    const res = await axios({
      url: `https://${server}.gofile.io/contents/uploadfile`,
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        Authorization: AUTHORIZATION_TOKEN,
      },
      data: formData,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (res.data.status !== 'ok') {
      throw new Error(`Echec de l'upload : ${res.data.message}`);
    }
    notifier.notify({
      title: 'Gofile Uploader',
      message: 'Upload succesfull link in your clipboard',
      sound: true,
    });

    return res.data.data.downloadPage;
  } catch (error) {
    console.error('Error Upload', error.message);
    notifier.notify({
      title: 'Gofile Uploader',
      message: 'Error in the upload',
      sound: true,
    });

    process.exit(1);
  }
}

function copyToClipboard(text) {
  try {
    execSync(`echo ${text} | clip`, { encoding: 'utf-8', stdio: 'ignore' });
    console.log('Link as been copied');
  } catch (error) {
    console.error('error in your clipboard', error.message);
  }
}

(async () => {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Veuillez fournir le chemin du fichier à uploader.');
    process.exit(1);
  }
  const server = await getServer();
  
  console.log(`Upload : ${filePath}`);
  const downloadLink = await uploadFile(filePath, server);
  
  console.log(`Upload Finish download link : ${downloadLink}`);
  copyToClipboard(downloadLink);
})();
