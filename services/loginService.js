module.exports.init = (envoirment) => {

  // Dall'enoirment recupero l'istanza di express e il database layer.
  let app = envoirment.app;
  let dbmanager = envoirment.db;

  // Creo l'handler per la richiesta get.
  app.get('/login/:username', async (req, resp) => {

    // Recupero username e password dalla richiesta.
    let username = req.params.username;
    let psw = req.query.password;

    // Chiedo al database layer di autenticare l'utente.
    let logged = await dbmanager.loginUser(username, psw);

    // Creo l'oggetto risposta.
    let responseObject = {

      valid: logged

    };


    if( logged ){

      // Fornisco il token di autenticazione
      responseObject.authToken = 'superSecretAuthToken';
      resp.status(200);

    } else {

      // Rispondo con un errore.
      responseObject.errorDescription = 'Username / password combination not found.';
      resp.status(300);

    }

    // Invio la risposta.
    resp.send(JSON.stringify(responseObject));


  });

};
