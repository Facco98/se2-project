module.exports.init = (envoirment) => {

  // Dall'enoirment recupero l'istanza di express e il database layer.
  let app = envoirment.app;
  let dbmanager = envoirment.db;

  app.post('/reserve/:id', (req, resp) => {

    // Recupero l'id della stanza da prenotare.
    let id = req.params.id;

    // Risposta di default.
    resp.status(400).send('Ups, cannot reserve room with id ' +id);

  });

  //gestire cancellazione prenotazione
  app.delete('/reservation/:id', async (req, resp) => {

    const reservationID = req.params.id; //id della prenotazione
    const mail = req.mailFromToken; //recupero la mail dell'utente
    const user = await dbmanager.getUserFromMail(mail); //restituisce tutto l'utente
    const userId = user.id; //recupero l'id dell'utente

    //controllo se prenotazione esiste
    const reservation = await dbmanager.getReservation(reservationID);

    if(reservation != false) //se c'è -> controllo se utente è giusto
    {
      let isStaff = await dbmanager.checkStaff(mail) != false;
      if(reservation.id_utente == userId || (isStaff)) //controllo l'utente
      {
        await dbmanager.removeReservation(reservationID); //elimino prenotazione
        resp.status(200).json({valid: true}); //invio risposta
      }
      else //se non è l'utrnte
      {
        resp.status(401).json({valid: false, error: 'Unauthorized access'}); //rispondo
      }
    }
    else
    {
      resp.status(404).json({valid: false, error: 'Reservation id not valid'});
    }

  });

  // lista impegni aula
  app.get('/reservation/room/:id_aula', async (req, resp) => {

    const roomID = req.params.id_aula; // ottengo id_aula
    const beginning = req.query.inizio; // inizio dell'intervallo
    const lapse = req.query.durata; // durata dell'intervallo

    const isRoomValid = await dbmanager.getRoomById(roomID); // controllo se l'aula è esistente
    
    if(isRoomValid){ // se sì
      
      // ottengo lista prenotazioni
      const listReservation = await dbmanager.listReservationByIdInterval(roomID, beginning, lapse);

      if(listReservation != false){ 
        resp.status(200).json({valid: true, listReservation}); // invio lista prenotazione
      }
      else{
        resp.status(404).json({valid: false, error: 'There is no reservation for this room'});
      }

    }
    else{
      resp.status(404).json({valid: false, error: 'Room id not valid'});
    }
  });

};
