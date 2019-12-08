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

    getUserFromMail: async (mail) => {

      let result = await client.query('SELECT * FROM utente WHERE mail = $1', [mail]);
      if( result.rows.length === 1 )
        return result.rows[0];
      else
        return false;

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

      const queryString = 'SELECT * FROM richiesta;';
      let result = await client.query(queryString);
      return result.rows;

    },

    acceptRequest: async (requestID, staffID) => {

      let request = await client.query('SELECT * FROM richiesta WHERE id = $1', [requestID]);
      request = request.rows[0];
      if( request ){
        const queryString = 'INSERT INTO prenotazione(id_staff, id_utente, motivazione, id_aula, inizio, durata) VALUES($1, $2, $3, $4, $5, $6);'
        let res = await client.query(queryString, [staffID, request.id_utente, request.motivazione, request.id_aula, request.inizio, request.durata]);
        await client.query('DELETE FROM richiesta WHERE id = $1', [requestID]);
        return res.rowCount;
      } else
        return false;
    },

    getRequest: async (requestID) => {

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id = $1;';
      let result = await client.query(queryString, [requestID]);
      if ( result.rows.length === 1 )
        return result.rows[0]
      else
        return false;

    },

    addRequest: async (userID, roomID, reason = '', beginning, lapse) => {

      const queryString = 'INSERT INTO richiesta(id_utente, id_aula, motivazione, inizio, durata) VALUES($1, $2, $3, $4, $5);'
      let result = await client.query(queryString, [userID, roomID, reason, beginning, lapse]);
      return result.rowCount;

    },

    removeRequest: async (requestID) => {

      const queryString = 'DELETE FROM richiesta WHERE id = $1;'
      let result = await client.query(queryString, [requestID]);
      return result.rowCount;

    },

    updateRequest: async (requestID, userID, roomID, reason = '', beginning, lapse) => {

      const queryString = 'UPDATE richiesta SET id_utente = $1, id_aula = $2, motivazione = $3, inizio = $4, durata = $5  WHERE id = $6;'
      let result = await client.query(queryString, [userID, roomID, reason, beginning, lapse, requestID])
      return result.rowCount;

    },

    listUserRequest: async (userID) => {

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id_utente = $1;';
      let result = await client.query(queryString, [userID]);
      return result.rows;

    },

    numberUserRequest: async (userID) => {

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id_utente = $1;';
      let result = await client.query(queryString, [userID]);
      return result.rows.length;

    },

    checkReservationOverlap: async (id_aula, inizio, durata) => {

      const queryString = 'SELECT id FROM prenotazione WHERE prenotazione.id_aula = $1 AND (prenotazione.inizio, prenotazione.durata) overlaps ($2, $3);';
      let result = await client.query(queryString, [id_aula, inizio, durata]);
      if (result.rows.length === 0)
      {
        return false;
      }
      else
      {
        return true;
      }
    },


    getReservation: async (reservationID) => {

      const queryString = 'SELECT * FROM prenotazione WHERE prenotazione.id = $1;';
      let result = await client.query(queryString, [reservationID]);
      if ( result.rows.length === 1 )
        return result.rows[0]
      else
        return false;

    },

    removeReservation: async (reservationID) => {

      const queryString = 'DELETE FROM prenotazione WHERE id = $1;'
      let result = await client.query(queryString, [reservationID]);
      return result.rowCount;

    },

    updateReservation: async (reservationID, requestID, staffID, note) => {

      const queryString = 'UPDATE prenotazione SET id_staff = $1, id_richiesta = $2, note = $3 WHERE id = $4;'
      let result = await client.query(queryString, [requestID, staffID, note, reservationID]);

    },

    listStaffReservation: async (staffID) => {

      const queryString = 'SELECT * FROM prenotazione WHERE prenotazione.id_staff = $1;';
      let result = await client.query(queryString, [staffID]);
      return result.rows;

    },

    numberStaffReservation: async (staffID) => {

      const queryString = 'SELECT * FROM prenotazione WHERE prenotazione.id_staff = $1;';
      let result = await client.query(queryString, [staffID]);
      return result.rows.length;

    },

    listReservation: async () => {

      const queryString = 'SELECT * FROM prenotazione;';
      let result = await client.query(queryString);
      return result.rows;

    },

    listReservationByIdInterval: async (roomID, beginning = null, lapse = null) => {

      // seleziono tutte le prenotazioni che hanno inizio tra beginning e lapse
      // const queryString = 'SELECT * FROM prenotazione p WHERE p.id_aula = $1 AND (p.inizio BETWEEN timestamp $2 AND (timestamp $2 + interval $3));';
      let queryString = 'SELECT * FROM prenotazione p WHERE p.id_aula = $1';
      let params = [roomID];
      if( beginning && lapse ){

        queryString += ' AND (p.inizio BETWEEN $2 AND ($2 + $3))';
        params.push(beginning, lapse);

      }
      queryString +=';';
      let result = await client.query(queryString, params);
      console.log('result', result.rows);
      if (result.rows.length === 0)
      {
        return false;
      }
      else
      {
        return result.rows;
      }
    },

    listRooms: async () => {

      const queryString = 'SELECT * FROM aula;';
      let result = await client.query(queryString);
      return result.rows;

    },

    getRoomById: async (roomID) => {

      const queryString = 'SELECT * FROM aula WHERE aula.id = $1;';
      let result = await client.query(queryString, [roomID]);
      if (result.rows.length === 0){
        return false;
      }
      else{
        return true;
      }

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
