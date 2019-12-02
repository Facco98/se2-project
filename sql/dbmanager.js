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

    getRequest: async (requestID) => {

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id = &1;';
      let result = await client.query(queryString, [requestID]);
      if ( result.rows.length === 1 )
        return result.rows[0]
      else
        return false;

    },

    addRequest: async (userID, roomID, reason = '', beginning, lapse) => {

      const queryString = 'INSERT INTO richiesta(id_utente, id_aula, motivazione, inizio, durata) VALUES($1, $2, $3, $4, $5);'
      let result = await client.query(queryString, [userID, roomID, reason, beginning, lapse]);

    },

    removeRequest: async (requestID) => {

      const queryString = 'DELETE FROM richiesta WHERE id = $1;'
      let result = await client.query(queryString, [requestID]);

    },

    updateRequest: async (requestID, userID, roomID, reason = '', beginning, lapse) => {

      const queryString = 'UPDATE richiesta SET id_utente = $1, id_aula = &2, motivazione = $3, inizio = &4, durata = &5  WHERE id = &6;'
      let result = await client.query(queryString, [userID, roomID, reason, beginning, lapse, requestID]);

    },

    listUserRequest: async (userID) => {

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id_utente = &1;';
      let result = await client.query(queryString, [userID]);
      return result.rows;

    },

    numberUserRequest: async (userID) => {

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id_utente = &1;';
      let result = await client.query(queryString, [userID]);
      return result.rows.length;

    },

    getReservation: async (reservationID) => {

      const queryString = 'SELECT * FROM prenotazione WHERE prenotazione.id = &1;';
      let result = await client.query(queryString, [reservationID]);
      if ( result.rows.length === 1 )
        return result.rows[0]
      else
        return false;

    },

    removeReservation: async (reservationID) => {

      const queryString = 'DELETE FROM prenotazione WHERE id = $1;'
      let result = await client.query(queryString, [reservationID]);

    },

    updateReservation: async (reservationID, requestID, staffID, note) => {

      const queryString = 'UPDATE prenotazione SET id_staff = $1, id_richiesta = &2, note = $3 WHERE id = &4;'
      let result = await client.query(queryString, [requestID, staffID, note, reservationID]);

    },

    listStaffReservation: async (staffID) => {

      const queryString = 'SELECT * FROM prenotazione WHERE prenotazione.id_staff = &1;';
      let result = await client.query(queryString, [staffID]);
      return result.rows;

    },

    numberStaffReservation: async (staffID) => {

      const queryString = 'SELECT * FROM prenotazione WHERE prenotazione.id_staff = &1;';
      let result = await client.query(queryString, [staffID]);
      return result.rows.length;

    },

    listReservation: async () => {

      const queryString = 'SELECT * FROM prenotazione;';
      let result = await client.query(queryString);
      return result.rows;

    },

    listRooms: async () => {

      const queryString = 'SELECT * FROM aula;';
      let result = await client.query(queryString);
      return result.rows;

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
