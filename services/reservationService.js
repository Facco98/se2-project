module.exports.init = (envoirment) => {

  // Dall'enoirment recupero l'istanza di express e il database layer.
  let app = envoirment.app;
  let dbmanager = envoirment.db;

  //gestire cancellazione prenotazione
  app.delete('/reservation/:id', async (req, resp) => {

    try{

      const reservationID = req.params.id; //id della prenotazione
      const mail = req.mailFromToken; //recupero la mail dell'utente
      const user = await dbmanager.getUserFromMail(mail); //restituisce tutto l'utente
      const userId = user.id; //recupero l'id dell'utente

      //controllo se prenotazione esiste
      const reservation = await dbmanager.reservationInfo(reservationID);

      if(reservation != false) //se c'è -> controllo se utente è giusto
      {
        let isStaff = await dbmanager.checkStaff(mail) != false;
        if(reservation.utenteid == userId || (isStaff)) //controllo l'utente
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

    }catch(err){
      console.log(err);
      resp.status(500).json({valid: false, error: 'Internal Server Error'});
    }

  });

  // lista impegni aula
  app.get('/reservation/room/:id_aula', async (req, resp) => {
    try{

      const roomID = req.params.id_aula; // ottengo id_aula
      const beginning = req.query.inizio; // inizio dell'intervallo
      const lapse = req.query.durata; // durata dell'intervallo
      const mail = req.mailFromToken; // email utente

      const isRoomValid = await dbmanager.getRoomById(roomID); // controllo se l'aula è esistente

      if(isRoomValid){ // se sì

        let isStaff;
        if( mail )
          isStaff = await dbmanager.checkStaff(mail);
        else
          isStaff = false;

        // ottengo lista prenotazioni, passo anche isStaff per ottenere la lista giusta
        // se isStaff non è falso deve ritornare una lista con tutte le informazioni
        // altrimenti solo motivazione, inizio e durata
        const listReservation = await dbmanager.listReservationByIdInterval(roomID, beginning, lapse, isStaff);

        resp.status(200).json({valid: true, list: listReservation});

      }
      else{
        resp.status(404).json({valid: false, error: 'Room id not valid'});
      }

    }catch(err){
      resp.status(500).json({valid: false, error: 'Internal Server Error'});
      console.log(err);
    }
  });

  //visualizzare singolo impegno dell'aula
  app.get('/reservation/:id', async (req, resp) => {
    try{

      let mail = req.mailFromToken;
      let isStaff = await dbmanager.checkStaff(mail);
      let reservation_id = req.params.id;

      let responseObject = {
        valid: true
      };

      const reservation = await dbmanager.reservationInfo(reservation_id);
      if( reservation != false ){

        if( isStaff ){

          responseObject.reservation = reservation;

        } else {

          responseObject.reservation = {motivazione: reservation.staffmotivazione, inizio: reservation.iniziop, durata: reservation.duratap};

        }

        resp.status(200);

      } else {

        responseObject.valid = false;
        responseObject.error = 'Reservation ID is not valid.';
        resp.status(400);

      }
      resp.json(responseObject);

    }catch(err){
      resp.status(500).json({valid: false, error: 'Internal Server Error'});
    }

  });

  app.get('/reservation/', async (req, resp) => {
    try{

      let mail = req.mailFromToken;
      let user = await dbmanager.getUserFromMail(mail);
      let userID = user.id;
      let reservations = await dbmanager.listUserReservation(userID);
      console.log(reservations)

      resp.status(200).json({valid: true, list: reservations});

    }catch(err){
      console.log(err);
      resp.status(500).json({valid: false, error: 'Internal Server Error'});
    }

  });


};
