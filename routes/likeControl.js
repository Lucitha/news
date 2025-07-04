var models = require('../models');
var asyncLib = require('async');
var jwt = require('../utils/jwt.utils');

const LIKED = 1;
const DISLIKED = 0;

module.exports = {
    likePost: function(req, res) {
        var user = jwt.getUser(req.headers.authorization);
        //recupération depuis l'url
        var message = parseInt(req.params.messageId);
        // console.log(req.params.messageId);
        // return;
        if (message <= 0) {
            return res.status(400).json({ error: "Message not found" });
        }
        asyncLib.waterfall([
            function(done) {
                var userFound = models.User.findOne({
                    attributes: ['id', 'username'],
                    where: { id: user }
                }).then(function(userFound) {
                    done(null, userFound);
                }).catch(function(err) {
                    return res.status(500).json({ error: "Unable to verify user." });
                });
            },
            function(userFound, done) {
                var messageFound = models.Message.findOne({
                    where: { id: message }
                }).then(function(messageFound) {
                    done(null, userFound, messageFound);
                }).catch(function(error) {
                    console.log(error);
                    return;
                    return res.status(401).json({ error: "Message not found" });
                });

            },
            function(userFound, messageFound, done) {
                var likeFound = models.like.findOne({
                    where: { messageId: messageFound.id, userId: userFound.id }
                }).then(function(likeFound) {
                    done(null, messageFound, userFound, likeFound);
                }).catch(function(error) {
                    return res.status(401).json({ error: "Message not found" });
                });

            },
            function(userFound, messageFound, likeFound, done) {
                if (!likeFound) {


                    // var like = models.Like.create({
                    //     messageId: messageFound.id,
                    //     userId: userFound.id
                    // })
                    messageFound.addUser(userFound, { isLike: LIKED }).then(function(like) {
                        done(like);
                    }).catch(function(error) {
                        return res.status(500).json({ error: "An error occurred, please try again later" });
                    });
                } else {
                    if (likeFound.isLike === LIKED) {
                        likeFound.update({
                            isLike: DISLIKED,
                        }).then(function() {
                            done(null, userFound, messageFound);
                        }).catch(function(err) {
                            res.status(500).json({ error: 'cannot update user reaction' });
                        });
                    } else {
                        res.status(409).json({ 'error': 'message already disliked' });
                    }
                }
            },
            function(userFound, messageFound, done) {

                messageFound.update({
                    likes: messageFound.likes - 1,
                }).then(function() {
                    done(messageFound);
                }).catch(function(err) {
                    res.status(500).json({ 'error': 'cannot update message like counter' });
                });


            }

        ], function(like) {
            if (like) {
                return res.status(201).json({ 'reaction': messageFound });
            } else {
                return res.status(500).json({ error: "An error occurred" });
            }
        })
    }
}