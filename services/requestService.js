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



}
