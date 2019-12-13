module.exports.init = (envoirment) => {

  // Dall'enoirment recupero l'istanza di express, il database layer
  let app = envoirment.app;
  let dbmanager = envoirment.db;

  // Creo l'handler per la richiesta GET.
  app.get('/request/', async (req, resp) => {

    try{

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
        resp.status(401);

      }

      resp.json(responseObject);

    }catch(err){
      resp.status(500).json({valid: false, error: 'Internal Server Error'});
    }

  });

  // Creo l'handler per la richiesta patch.
  app.patch('/request/:id', async (req, resp) => {

    try{

      let requestID = parseInt(req.params.id);
      let mail = req.mailFromToken;

      let staff = await dbmanager.checkStaff(mail);

      let responseObject = {valid: staff != false };

      if( staff ){

        let result = await dbmanager.acceptRequest(requestID, staff);
        responseObject.valid = result;
        if( result )
          resp.status(200);
        else {
          resp.status(400);
          responseObject.error = 'Bad request';
        }


      } else {

        responseObject.valid = false;
        responseObject.error = 'Access denied.';
        resp.status(401);

      }
      resp.json(responseObject);

    }catch(err){
      console.log(err);
      resp.status(500).json({valid: false, error: 'Internal Server Error'});
    }

  });

  // prenotazione aula
  app.post('/request/', async(req, resp) => {

    try{

      const request = req.body; // body json della richiesta

      if( !request ){

        resp.status(400).json({valid: false, error: 'Payload not declared to be JSON or is not valid'});
        return;

      }
      // controllo se c'è overlap della prenotazione con quelli già esistenti
      const isOverlap = await dbmanager.checkReservationOverlap(request.id_aula, request.inizio, request.durata);

      if(!isOverlap){ // se non c'è overlap
        const user = await dbmanager.getUserFromMail(req.mailFromToken);
        const nRowModified = await dbmanager.addRequest(user.id, request.id_aula, request.motivazione, request.inizio, request.durata);

        if (nRowModified != 0){
          resp.status(200).json({valid: true}); //invio risposta
        } else {
          resp.status(500).json({valid: false, error: 'Could not add your request'});
        }
      }
      else{
        resp.status(400).json({valid: false, error: 'There may be overlap with other reservation or the room id is not valid'});
      }

    }catch(err){
      console.log(err);
      resp.status(400).json({valid: false, error: 'Bad request'});
    }

  });


}
