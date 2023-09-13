const connection = require('../Data_Base/db.connection');

exports.getSession = async (userId) => {
    const mainQuery = `SELECT * FROM session_local_use WHERE userId = '${userId}';`
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

exports.getSessionbySId = async (sessionIdentifier ) => {
    const mainQuery = `SELECT * FROM session_local_use WHERE sessionDATA = '${sessionIdentifier}';`
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

exports.setSession = async (sessionDate, sessionId, userId) => {
    const mainQuery = `INSERT INTO session_local_use (sessionDATE, sessionDATA, userId) VALUES ('${sessionDate}', '${sessionId}', '${userId}')
                        ON DUPLICATE KEY UPDATE sessionDATE = '${sessionDate}', sessionDATA = '${sessionId}', userId ='${userId}';`;
    let con = await connection.connect();
    await con.query(mainQuery).then(([rows, fields]) => {
        if (rows.affectedRows) {
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

exports.delSession = async (userId) => {
    const mainQuery = `DELETE FROM session_local_use WHERE userId = '${userId}';`;

    let con = await connection.connect();
    await con.query(mainQuery).then(([rows, fields]) => {
        if (rows.affectedRows) {
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

exports.delNotExistSessions = async () => {
    const mainQuery = `DELETE FROM session_local_use WHERE NOT EXISTS(SELECT NULL FROM USERS_SESSIONS WHERE session_id = session_local_use.sessionDATA);`;

    let con = await connection.connect();
    await con.query(mainQuery).then(([rows, fields]) => {
        if (rows.affectedRows) {
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

