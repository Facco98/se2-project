module.exports =  (app, dbmanager) => app.get('/login/:username', async (req, resp) => {


  let username = req.params.username;
  let psw = req.query.password;
  let logged = await dbmanager.loginUser(username, psw);


  let responseObject = {

    valid: logged

  };

  if( logged ){

    responseObject.authToken = 'superSecretAuthToken';
    resp.status(200);

  } else {

    responseObject.errorDescription = 'Username / password combination not found.';
    resp.status(300);

  }

  resp.send(JSON.stringify(responseObject));


});
