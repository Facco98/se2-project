module.exports.init = (envoirment) => {

  // Dall'enoirment recupero l'istanza di express, il database layer
  // e l'oggetto che gestisce i token.
  let app = envoirment.app;
  let dbmanager = envoirment.db;
  let tokenManager = envoirment.jwt;

  // Creo l'handler per la richiesta get.
  app.get('/login/:mail', async (req, resp) => {

    try{

      // Recupero username e password dalla richiesta.
      let mail = req.params.mail;
      let psw = req.query.password;

      // Chiedo al database layer di autenticare l'utente.
      let logged = await dbmanager.loginUser(mail, psw);

      // Creo l'oggetto risposta.
      let responseObject = {

        valid: logged

      };


      if( logged ){

        // Fornisco il token di autenticazione
        responseObject.authToken = envoirment.createToken(mail);
        resp.status(200);

      } else {

        // Rispondo con un errore.
        responseObject.error = 'Username / password combination not found.';
        resp.status(301);

      }

      // Invio la risposta.
      resp.send(JSON.stringify(responseObject));

    }catch(err){
      resp.status(500).json({valid: false, error: 'Internal Server Error'});
    }
    
  });

};
