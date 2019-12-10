module.exports.init = (envoirment) => {

  // Dall'enoirment recupero l'istanza di express e il database layer.
  let app = envoirment.app;
  let dbmanager = envoirment.db;

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
        resp.status(200).json({valid: true, list: listReservation}); // invio lista prenotazione
      }

    }
    else{
      resp.status(404).json({valid: false, error: 'Room id not valid'});
    }
  });

  //visualizzare singolo impegno dell'aula
  app.get('/reservation/:id', async (req, resp) => {

    let mail = req.mailFromToken;
    let isStaff = await dbmanager.checkStaff(mail);
    let reservation_id = req.params.id;

    let responseObject = {
      valid: isStaff != false
    };

    const reservation = await dbmanager.reservationInfo(reservation_id);
    if( reservation != false ){

      if( isStaff ){

        responseObject.reservation = reservation;

      } else {

        responseObject.reservation = {motivazione: reservation.staffMotivazione, inizio: reservation.inizioP, durata: reservation.durataP};

      }

      resp.status(200);

    } else {

      responseObject.error = 'Reservation ID is not valid.';
      resp.status(400);

    }
    resp.json(responseObject);

  });

};
