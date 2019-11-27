// Import del pacchetto contenente il database manager layer.
const dbmanager = require('./sql/dbmanager');
const express = require('express');

let app = express();

async function main(){

  // Inizializzazione del database manager.
  let db = await dbmanager();

  // Chiedo al database se esiste un utente con mail 'prova@example.com' e password 'psw'
  let result = await db.loginUser('prova@example.com', 'psw');

  // Stampo il risultato.
  console.log(result);

  const service = require('./services/loginService');
  service(app, db);

  app.listen(3000);

}

main();
