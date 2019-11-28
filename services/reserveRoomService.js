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

};
