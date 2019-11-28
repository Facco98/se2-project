// Import dei dati di accesso al database e del driver per collegarmi a Postgres
const database = require('../variables');
const { Pool } = require('pg');

async function createDBManager(){

  // Creo il client e aspetto che si colleghi.
  let client = new Pool(database);
  await client.connect();

  let dbmanager = {

    loginUser: async (mail, password) => {

      // Invio la query e controllo il numero di righe ritornate
      let result = await client.query('SELECT * FROM utente WHERE mail = $1 AND password = $2', [mail, password]);
      return result.rows.length === 1;

    },

    closeConnection: async () => {

      // Aspetto che la connessione venga chiusa.
      await client.end();

    }

  };

  return dbmanager;

}

// Esporto la funzione che inizializza il tutto.
module.exports = createDBManager;
