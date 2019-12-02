// Importo ciò che serve per gestire i JWT.
const variables = require('../variables');
const jwt = require('jsonwebtoken');

// Funzione che si occupa di firmare il token a partire dall'utente.
let createToken = (user) => {

  let mail = user.mail || user;
  let token = jwt.sign(mail, variables.tokenSecret);
  return token;
};

// Middlewere che si occupa di verificare che il token sia valido.
let checkToken = (req, res, next) => {

  let token = req.headers['x-access-token'] || req.headers['authorization'] || '';
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if( token && token !== '' ) {
    jwt.verify(token, variables.tokenSecret, (err, decoded) =>{

      if( err ){
        let responseObject = {
          valid: false,
          error: 'The token supplied is not valid'
        };
        return res.status(302).json(responseObject);


      }
      else {

        req.mailFromToken = decoded;
        next();

      }
    });
  }
  else {

    return res.status(302).json({
      valid: false,
      error: 'No token supplied'
    });

  }

};

// Wrapper del middlewere che si occupa di applicare il controllo del token
// solo alle route corrette.
let wrapper = (req, res, next) => {

  let contained = false;
  for( let safePath of variables.safePaths ){

    contained = req.path.startsWith(safePath);

  }
  if( !contained )
    checkToken(req, res, next);
  else
    next();

};

module.exports.checkTokenMiddlewere = wrapper;
module.exports.createToken = createToken;
