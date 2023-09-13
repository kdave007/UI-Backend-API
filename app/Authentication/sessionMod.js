const sessionQuery = require('./session');

exports.sessionDataValue = async(usrId) => {
    result = await sessionQuery.getSession(usrId);
    if (result.data) {
        const { sessionDATE, sessionDATA, userId } = result.data[0];
        return {
            status: true,
            sessionDATE,
            sessionDATA,
            userId
        };
    } else if (result.err) {
        return {
            status: false,
            error: result.err
        };
    } else {
        return {
            status: false
        };
    }
}

exports.setSession = async (sessDate, sessId, usrId) => {
    result = await sessionQuery.setSession(sessDate, sessId, usrId);
    if (result.data) {
        return true;
    } else if (result.err) {
        return result.err;
    } else {
        return false;
    }
}

exports.delSession = async (usrId) => {
    result = await sessionQuery.delSession(usrId);
    if (result.data) {
        return true;
    } else if (result.err) {
        return result.err;
    } else {
        return false;
    }
}

exports.delNotExistSessions = async () => {
    result = await sessionQuery.delNotExistSessions();
    if (result.data) {
        return true;
    } else if (result.err) {
        return result.err;
    } else {
        return false;
    }
}