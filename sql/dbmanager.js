// Import dei dati di accesso al database e del driver per collegarmi a Postgres
const { Pool } = require('pg');

async function createDBManager(){

  let client = new Pool();
  try{
    // Creo il client e aspetto che si colleghi.

    await client.connect();

  }catch(err){
    //resp.status(500).json({valid: false, error: 'Internal Server Error'});
    console.log('Could not connect to database. Specify access data with PostgreSQL variables (PGHOST, PGPASSWORD, PGDATABASE, PGUSER).');
    process.exit(1);
  }

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

    reservationHistory: async (reservationID) => {
      /*
      let result = await client.query("SELECT prenotazioneID, aulaPID, nomePAula, staffMotivazione, inizioP, durataP, staffID, staffNome, staffCognome, staffTelefono,staffMail, richiestaID, aulaRID, nomeRAula, utenteMotivazione, inizioR, durataR, utenteID, utenteNome, utenteCognome, utenteTelefono, utenteMail \
                                        FROM \
                                          ( \
                                            SELECT prenotazione.id as prenotazioneID, prenotazione.id_richiesta as id_richiesta, prenotazione.id_aula aulaPID, aula.nome as nomePAula, prenotazione.motivazione as staffMotivazione, prenotazione.inizio as inizioP, prenotazione.durata as durataP, utente.id as staffID, utente.nome as staffNome, utente.cognome as staffCognome, utente.telefono as staffTelefono, utente.mail as staffMail \
                                            FROM prenotazione INNER JOIN aula ON id_aula = aula.id  INNER JOIN utente ON utente.id = prenotazione.id_staff \
                                          ) as A \
                                          INNER JOIN \
                                          ( \
                                            SELECT richiesta.id as richiestaID, richiesta.id_aula aulaRID, aula.nome as nomeRAula, richiesta.motivazione as utenteMotivazione, richiesta.inizio as inizioR, richiesta.durata as durataR, utente.id as utenteID, utente.nome as utenteNome, utente.cognome as utenteCognome, utente.telefono as utenteTelefono, utente.mail as utenteMail \
                                            FROM richiesta INNER JOIN aula ON richiesta.id_aula = aula.id  INNER JOIN utente ON utente.id = richiesta.id_utente \
                                          ) as B  \
                                          ON A.id_richiesta = B.richiestaID \
                                        WHERE prenotazioneID = $1",
                                        [reservationID]);
                                        */
      let result = await client.query("SELECT p.id as prenotazioneID, p.id_aula aulaPID, a1.nome as nomePAula, p.motivazione as staffMotivazione, p.inizio as inizioP, p.durata as durataP, u1.id as staffID, u1.nome as staffNome, u1.cognome as staffCognome, u1.telefono as staffTelefono, u1.mail as staffMail, richiesta.id as richiestaID, richiesta.id_aula aulaRID, a2.nome as nomeRAula, richiesta.motivazione as utenteMotivazione, richiesta.inizio as inizioR, richiesta.durata as durataR, u2.id as utenteID, u2.nome as utenteNome, u2.cognome as utenteCognome, u2.telefono as utenteTelefono, u2.mail as utenteMail \
                                        FROM (SELECT * FROM prenotazione WHERE id = $1) as p INNER JOIN aula as a1 ON id_aula = a1.id  INNER JOIN utente as u1 ON u1.id = p.id_staff INNER JOIN richiesta ON p.id_richiesta = richiesta.id INNER JOIN aula as a2 ON richiesta.id_aula = a2.id  INNER JOIN utente as u2 ON u2.id = richiesta.id_utente"
                                        ,[reservationID]);
      if( result.rows.length === 1 )
        return result.rows[0];
      else
        return false;

    },

    reservationInfo: async (reservationID) => {

      let result = await client.query("SELECT p.motivazione as staffMotivazione, p.inizio as inizioP, p.durata as durataP, u1.id as staffID, u1.nome as staffNome, u1.cognome as staffCognome, richiesta.id as richiestaID, u2.id as utenteID, u2.nome as utenteNome, u2.cognome as utenteCognome \
                                        FROM (SELECT * FROM prenotazione WHERE id = $1) as p INNER JOIN aula as a1 ON id_aula = a1.id  INNER JOIN utente as u1 ON u1.id = p.id_staff INNER JOIN richiesta ON p.id_richiesta = richiesta.id INNER JOIN aula as a2 ON richiesta.id_aula = a2.id  INNER JOIN utente as u2 ON u2.id = richiesta.id_utente"
                                        ,[reservationID]);
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

      const queryString = 'SELECT * FROM richiesta WHERE richiesta.id NOT IN ( SELECT prenotazione.id_richiesta FROM prenotazione );';
      let result = await client.query(queryString);
      return result.rows;

    },

    acceptRequest: async (requestID, staffID, reason = "", idRoom = false, beginning = false, lapse = false) => {

      let request = await client.query('SELECT * FROM richiesta WHERE id = $1 AND richiesta.id NOT IN( SELECT prenotazione.id_richiesta FROM prenotazione );', [requestID]);
      request = request.rows[0];
      if( !request )
        return false;
      if (idRoom == false) {
        idRoom = request.id_aula;
      }
      if (beginning == false) {
        beginning = request.inizio;
      }
      if (lapse == false) {
        lapse = request.durata;
      }
      if( reason == "" )
        reason = request.motivazione;
      if( request ){
        const queryString = 'INSERT INTO prenotazione(id_staff, id_richiesta, motivazione, id_aula, inizio, durata) VALUES($1, $2, $3, $4, $5, $6);'
        let res = await client.query(queryString, [staffID, requestID, reason, idRoom, request.inizio, request.durata]);
        console.log('INSERTED ')
        let result = await client.query('DELETE FROM richiesta WHERE richiesta.id NOT IN( SELECT prenotazione.id_richiesta FROM prenotazione ) AND richiesta.id_aula = $1 AND (richiesta.inizio, richiesta.durata) OVERLAPS ( $2 :: TIMESTAMP, $3 :: INTERVAL);', [idRoom, beginning, lapse]);
        console.log('DELETED', result.rowCount);
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

      const queryString = 'SELECT id FROM prenotazione WHERE prenotazione.id_aula = $1 AND (prenotazione.inizio, prenotazione.durata) overlaps ($2 :: TIMESTAMP, $3 :: INTERVAL);';
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

      const queryStringGetR = "SELECT prenotazione.id_richiesta FROM prenotazione WHERE prenotazione.id = $1;";
      let result = await client.query(queryStringGetR, [reservationID]);
      if( result.rows.length == 1 ){
        const rID = result.rows[0].id_richiesta;
        let queryStringDeleteP = 'DELETE FROM prenotazione WHERE id = $1;';
        let queryStringDeleteR = 'DELETE FROM richiesta WHERE id = $1';
        result = await client.query(queryStringDeleteP, [reservationID]);
        await client.query(queryStringDeleteR, [rID]);
        return result.rowCount;
      } else {
        return false;
      }

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

    listReservationByIdInterval: async (roomID, beginning = null, lapse = null, isStaff) => {

      let queryString = '';

      if(isStaff != false){ // se l'utente è uno staff
        queryString = 'SELECT * FROM prenotazione p WHERE p.id_aula = $1'; // richiedo tutti i dati
      }
      else{ // altrimenti chiedo solo motivazione, inizio e durata
        queryString = 'SELECT motivazione, inizio, durata FROM prenotazione p WHERE p.id_aula = $1';
      }

      let params = [roomID];
      if( beginning && lapse ){

        queryString += ' AND (p.inizio BETWEEN $2 AND ($2 + $3))';
        params.push(beginning, lapse);

      }
      queryString +=';';
      let result = await client.query(queryString, params);
      return result.rows;
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
