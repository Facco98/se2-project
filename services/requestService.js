module.exports.init = (envoirment) => {

  // Dall'enoirment recupero l'istanza di express, il database layer
  let app = envoirment.app;
  let dbmanager = envoirment.db;

  // Creo l'handler per la richiesta GET.
  app.get('/requests/', async (req, resp) => {

    let mail = req.mailFromToken;
    let isStaff = await dbmanager.checkStaff(mail);

    let responseObject = {
      valid: isStaff != false
    };


    if( isStaff ){

      let requests = await dbmanager.listRequests();
      responseObject.requests = requests;
      resp.status(200);

    } else {

      responseObject.error = 'Access denied';
      resp.status(302);

    }

    resp.json(responseObject);

  });

  // Creo l'handler per la richiesta patch.
  app.patch('/requests/:id', async (req, resp) => {

    let requestID = parseInt(req.params.id);
    let mail = req.mailFromToken;

    let staff = await dbmanager.checkStaff(mail);

    let responseObject = {valid: staff != false };

    if( staff ){

      let result = await dbmanager.acceptRequest(requestID, staff);
      responseObject.valid = result;

      resp.status(200);


    } else {

      responseObject.valid = false;
      responseObject.error = 'Access denied.';
      resp.status(302);

    }
    resp.json(responseObject);

  });

  // prenotazione aula
  app.post('/requests/', async(req, resp) => {

    const request = req.body; // body json della richiesta

    // controllo se c'è overlap della prenotazione con quelli già esistenti
    const isOverlap = await dbmanager.checkReservationOverlap(request.id_aula, request.inizio, request.durata);

    if(!isOverlap){ // se non c'è overlap
      const nRowModified = await dbmanager.addRequest(request.id_utente, request.id_aula, request.motivazione, request.inizio, request.durata);

      if (nRowModified != 0){
        resp.status(200).json({valid: true}); //invio risposta
      } else {
        resp.status(500).json({valid: false, error: 'Could not add your request'});
      }
    }
    else{
      resp.status(400).json({valid: false, error: 'There may be overlap with other reservation or the room id is not valid'});
    }

  });


}
