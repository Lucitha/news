//imports
var bcrypt = require('bcrypt');
var jwt = require('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');


const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/; // At least 6 characters, at least one letter and one number
const USERNAME_REGEX = /^[a-zA-Z0-9]{3,10}$/; // Between 3 and 10 alphanumeric characters
const BIO_REGEX = /^[a-zA-Z0-9\s.,!?-]{0,255}$/; // Up to 255 characters, alphanumeric and some punctuation



module.exports = {
    // User registration function
    register: function(req, res) {
        // console.log('req.body =', req);return;
        var email = req.body.email
        var username = req.body.username
        var password = req.body.password
        var bio = req.body.bio || null;
        if (email == null || username == null || password == null) {
            return res.status(400).json({ error: "Email, username and password are required." });
        }
        // Validate email, username, and password formats
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }
        if (!USERNAME_REGEX.test(username)) {
            return res.status(400).json({ error: "Username must be between 3 and 10 alphanumeric characters." });
        }
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ error: "Password must be between 6 and 12 characters, and contain at least one letter and one number." });
        }
        if (bio && !BIO_REGEX.test(bio)) {
            return res.status(400).json({ error: "Bio can only contain alphanumeric characters and some punctuation, up to 255 characters." });
        }
        asyncLib.waterfall([
                function(done) {
                    models.User.findOne({
                            attributes: ['email'],
                            where: { email: email }
                        })
                        .then(function(userFound) {
                            done(null, userFound);
                        })
                        .catch(function(err) {
                            return res.status(500).json({ error: "Unable to verify user." });
                        });
                },

                function(userFound, done) {
                    if (!userFound) {
                        bcrypt.hash(password, 5, function(err, bcryptPassword) {
                            done(null, userFound, bcryptPassword);
                        });
                    } else {
                        return res.status(409).json({ error: "Email already exists." });
                    }

                },
                function(userFound, bcryptPassword, done) {
                    var newUser = models.User.create({
                            email: email,
                            username: username,
                            password: bcryptPassword,
                            bio: bio,
                            isAdmin: false
                        })
                        .then(function(newUser) {
                            done(newUser);
                        })
                        .catch(function(err) {
                            console.error(err);
                            return res.status(500).json({ error: "Unable to create user." });
                        });
                },


            ],
            function(newUser) {
                if (newUser) {
                    return res.status(201).json({
                        'userId': newUser.id,
                        'message': 'User created successfully'
                    });
                } else {
                    return res.status(500).json({ error: "Unable to create user." });
                }
            }
        );

    },

    login: function(req, res) {
        var email = req.body.email
        var password = req.body.password
        if (email == null || password == null) {
            return res.status(400).json({ error: "Email and password are required." });
        }
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['id', 'email', 'username', 'password', 'bio', 'isAdmin'],
                    where: { email: email }
                }).then(function(userFound) {
                    done(userFound);
                }).catch(function(err) {
                    return res.status(500).json({ error: "Unable to verify user." });
                });
            },
        ], function(userFound) {
            // console.log('userFound =', userFound);
            if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBycryptr, resBycrypt) {
                    if (resBycrypt) {
                        var token = jwt.generateTokenForUser(userFound);
                        return res.status(200).json({
                            'userId': userFound.id,
                            "token": token,
                            'message': 'Login successful'
                        });
                    } else {
                        return res.status(401).json({ error: "Invalid password." });
                    }

                });

            } else {
                return res.status(404).json({ error: "User not found." });
            }
        });

    },

    profil: function(req, res) {

        // This function is not implemented in the original code
        //return res.status(501).json({ error: "Profil function not implemented." });
        var headerAuth = req.headers['authorization'];
        var userId = jwt.getUser(headerAuth);
        // console.log('userId =', userId);
        if (userId == null) {
            return res.status(401).json({ error: "Invalid user ID." });
        }
        models.User.findOne({
            attributes: ['id', 'email', 'username', 'bio', 'isAdmin'],
            where: { id: userId }
        }).then(function(user) {
            if (user) {
                return res.status(200).json(user);
            } else {
                return res.status(404).json({ error: "User not found." });
            }
        }).catch(function(err) {
            // console.error(err);
            return res.status(500).json({ error: "Internal server error." });
        });
    },

    updateProfil: function(req, res) {
        var headerAuth = req.headers['authorization'];
        var userId = jwt.getUser(headerAuth);
        if (userId == null) {
            return res.status(401).json({ error: "Invalid user ID." });
        }

        // var email = req.body.email;
        var username = req.body.username;
        // var password = req.body.password;
        var bio = req.body.bio || null;
        // if (email == null || username == null || password == null) {
        //     return res.status(400).json({ error: "Email, username and password are required." });
        // }
        // Validate email, username, and password formats

        // if (!EMAIL_REGEX.test(email)) {
        //     return res.status(400).json({ error: "Invalid email format." });
        // }    
        if (!USERNAME_REGEX.test(username)) {
            return res.status(400).json({ error: "Username must be between 3 and 10 alphanumeric characters." });
        }
        // if (!PASSWORD_REGEX.test(password)) {
        //     return res.status(400).json({ error: "Password must be between 6 and 12 characters, and contain at least one letter and one number." }); 
        // }
        if (bio && !BIO_REGEX.test(bio)) {
            return res.status(400).json({ error: "Bio can only contain alphanumeric characters and some punctuation, up to 255 characters." });
        }
        // Here you would typically update the user's profile in the database
        asyncLib.waterfall([
                function(done) {
                    models.User.findOne({
                        attributes: ['id', 'email', 'username', 'bio', 'isAdmin'],
                        where: { id: userId }
                    }).then(function(userFound) {
                        done(null, userFound);
                    }).catch(function(err) {
                        return res.status(500).json({ error: "Unable to verify user." });
                    });
                },
                function(userFound, done) {

                    if (userFound) {
                        userFound.update({
                            // email: (email !== null) ? email : userFound.email,   
                            username: (username !== null) ? username : userFound.username,
                            bio: (bio !== null) ? bio : userFound.bio,
                        }).then(function() {
                            done(userFound);
                        }).catch(function(err) {
                            return res.status(500).json({ error: "Unable to update profile." });
                        });

                    } else {
                        return res.status(404).json({ error: "User not found." });
                    }
                },

            ],
            function(userFound) {
                // Assuming the update was successful
                if (!userFound) {
                    return res.status(404).json({ error: "User not found." });
                }
                return res.status(200).json({ message: "Profile updated successfully." });
            }
        );
    },
}