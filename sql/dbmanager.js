const database = require('../variables');
const { Pool } = require('pg');

async function createDBManager(){

  let client = new Pool(database);
  await client.connect();

  dbmanager = {

    loginUser: async (mail, password) => {

      let result = await client.query('SELECT * FROM utente WHERE mail = $1 AND password = $2', [mail, password]);
      return result.rows.length === 1;

    },

    closeConnection: async () => {

      await client.end();

    }

  };

  return dbmanager;

}

module.exports = createDBManager;
