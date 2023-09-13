const connection = require('../Data_Base/db.connection');

exports.getInfo = async (email) => {
  const mainQuery = `SELECT * FROM user WHERE email = "${email}";`;

  let con = await connection.connect();
  await con.query(mainQuery).then(([rows, fields]) => {
    if (rows.length) {
      result = {
        err: null,
        data: rows
      };
    } else {
      result = {
        err: null,
        data: false
      };
    }
    con.end();
  })
    .catch((error) => {
      result = {
        err: error,
        data: null
      };
    });

  return result;
}

exports.getuserInformation = async (userId) => {
  const mainQuery = `SELECT * FROM user WHERE userId = "${userId}";`;

  let con = await connection.connect();
  await con.query(mainQuery).then(([rows, fields]) => {
    if (rows.length) {
      result = {
        err: null,
        data: rows
      };
    } else {
      result = {
        err: null,
        data: false
      };
    }
    con.end();
  })
    .catch((error) => {
      result = {
        err: error,
        data: null
      };
    });
  return result;
}