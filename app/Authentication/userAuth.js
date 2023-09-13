const userQuery = require('./user');

exports.Auth = async (emailRef, pass) => {
    result = await userQuery.getInfo(emailRef);
    if (result.data) {
        const { userId, name, password, email } = result.data[0];
        if (emailRef === email && pass === password) {
            return {
                status: true,
                userId,
                name,
                password,
                email
            };
        } else {
            return {
                status: false
            };
        }
    } else if (result.err) {
        return {
            status: false,
            error: result.err};
    } else {
        return {
            status: false
        };
    }
}