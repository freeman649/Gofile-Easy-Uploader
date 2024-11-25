const axios = require('axios'); // Pour les requêtes HTTP
const FormData = require('form-data'); // Pour gérer les données de formulaire
const { execSync } = require('child_process'); // Pour exécuter des commandes système
const notifier = require('node-notifier'); // Pour les notifications système
const ConsoleWindow = require("node-hide-console-window");

ConsoleWindow.hideConsole();

// Token d'authentification Gofile
const AUTHORIZATION_TOKEN = 'W8sh6pYR3DLob2IuF7SFA1ZB0BrEDzM9';

// Fonction pour récupérer le serveur disponible
async function getServer() {
  try {
    const res = await axios({
      url: 'https://api.gofile.io/servers',
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });

    // Log de la réponse pour voir la structure des données
    console.log('Réponse de l\'API Gofile :', res.data);

    if (res.data.status !== 'ok') {
      throw new Error('Impossible de récupérer le serveur Gofile.');
    }

    // Vérification de la structure de la réponse et extraction du serveur
    const server = res.data.data.servers[0]?.name; // On prend le premier serveur
    if (!server) {
      throw new Error('Aucun serveur disponible.');
    }

    return server;
  } catch (error) {
    console.error('Erreur lors de la récupération du serveur :', error.message);
    process.exit(1);
  }
}

// Fonction pour uploader un fichier
async function uploadFile(filePath, server) {
  const formData = new FormData();
  formData.append('file', require('fs').createReadStream(filePath));

  try {
    // Notification de début d'upload
    notifier.notify({
      title: 'Gofile Uploader',
      message: 'Upload as been started',
      sound: true,
    });

    const res = await axios({
      url: `https://${server}.gofile.io/contents/uploadfile`, // Vérification que l'URL est correcte
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

    // Notification de fin d'upload
    notifier.notify({
      title: 'Gofile Uploader',
      message: 'Upload succesfull link in your clipboard',
      sound: true,
    });

    return res.data.data.downloadPage;
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier :', error.message);

    // Notification d'échec de l'upload
    notifier.notify({
      title: 'Gofile Uploader',
      message: 'Error in the upload',
      sound: true,
    });

    process.exit(1);
  }
}

// Fonction pour copier dans le presse-papier
function copyToClipboard(text) {
  try {
    execSync(`echo ${text} | clip`, { encoding: 'utf-8', stdio: 'ignore' });
    console.log('Lien copié dans le presse-papier !');
  } catch (error) {
    console.error('Erreur lors de la copie dans le presse-papier :', error.message);
  }
}

// Programme principal
(async () => {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Veuillez fournir le chemin du fichier à uploader.');
    process.exit(1);
  }

  console.log('Récupération du serveur disponible...');
  const server = await getServer();

  console.log(`Upload du fichier : ${filePath}`);
  const downloadLink = await uploadFile(filePath, server);

  console.log(`Upload terminé ! Lien de téléchargement : ${downloadLink}`);
  copyToClipboard(downloadLink);
})();
