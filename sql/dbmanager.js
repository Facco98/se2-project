// Import dei dati di accesso al database e del driver per collegarmi a Postgres
const variables = require('../variables');
const { Pool } = require('pg');

async function createDBManager(){

  // Creo il client e aspetto che si colleghi.
  let client = new Pool(variables.databaseInfo);
  await client.connect();

  let dbmanager = {

    loginUser: async (mail, password) => {

      // Invio la query e controllo il numero di righe ritornate
      let result = await client.query('SELECT * FROM utente WHERE mail = $1 AND password = $2', [mail, password]);
      return result.rows.length === 1;

    },

    checkStaff: async (mail) => {

      const queryString = 'SELECT * FROM staff WHERE staff.id_utente = (SELECT utente.id FROM utente WHERE utente.mail = $1);'
      let result = await client.query(queryString, [mail]);
      if ( result.rows.length === 1 )
        return result.rows[0].id_utente
      else
        return false;

    },

    listRequests: async () => {

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id NOT IN (SELECT prenotazione.id_richiesta FROM prenotazione);';
      let result = await client.query(queryString);
      return result.rows;

    },

    acceptRequest: async (requestID, staffID, note = '') => {

      const queryString = 'INSERT INTO prenotazione(id_staff, id_richiesta, note) VALUES($1, $2, $3);'
      let result = await client.query(queryString, [requestID, staffID, note]);

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
