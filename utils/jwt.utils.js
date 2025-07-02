var jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = "0s9d8f7a6s5d4f3g2h1j0k9l8m7n6o5p4q3r2t1u0v9w8x7y6z5a4b3c2d1e0f"; // Replace with your secret key

module.exports = {
    generateTokenForUser: function(userData) {
        return jwt.sign({
                id: userData.id,
                isAdmin: userData.isAdmin,
                username: userData.username
            },
            JWT_SIGN_SECRET, {
                expiresIn: '1h' // Token expiration time
            }
        )

    },
    parseAuthorization: function(authorization) {
        return (authorization != null) ? authorization.replace('Bearer ', '') : null;
    },
    getUser: function(authorization) {
        var token = this.parseAuthorization(authorization);
        var user = null;
        if (token != null) {
            try {
                var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
                if (jwtToken !== null && jwtToken.id != null) {
                    user = parseInt(jwtToken.id);
                }
            } catch (err) {
                console.error("JWT verification failed:", err);
            }
        }
        return user;
    },

}