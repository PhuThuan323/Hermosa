const admin = require("firebase-admin");
const serviceAccount = require("../hermosacoffee-f0a0a-firebase-adminsdk-fbsvc-d019cb125e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;


