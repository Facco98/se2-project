// Import del pacchetto contenente il database manager layer e il pacchetto del
// middlewere per i token.
const dbmanager = require('./sql/dbmanager');
const express = require('express');
const auth = require('./middlewere/auth');
const bodyParser = require('body-parser');

// Leggo la porta direttamente dal file package.json; se non è presente
// utilizzo la porta 3001
const port = process.env.npm_package_constants_port || 3001;


// Funzione che carica i servizi dinamicamente a partire dal percorso specificato.
function loadServices(envoirment, path = './services/'){

  const fs = require('fs').promises;
  fs.readdir(path).then((files) => {
    for( let file of files ){
      let service = require(path+file);
      service.init(envoirment);
    }
  });

}

// Funzione che carica i componenti e lancia il server.
async function main(){

  let db = await dbmanager();
  let app = express();

  let envoirment = {

    db: db,
    app: app,
    createToken: auth.createToken

  };

  loadServices(envoirment);

  // Impongo l'uso del middlewere per il controllo dei token a tutte le route.
  app.use(auth.checkTokenMiddlewere);

  app.use(bodyParser.json());

  app.listen(port, () => {

    console.log('Version:', process.env.npm_package_version);
    console.log('Server is listening on port', port)

  });


}

// Chiamata alla funzione principale.
main();
