var models = require('../models');
var asyncLib = require('async');
var jwt = require('../utils/jwt.utils');

module.exports = {

    createMessage: function(req, res) {
        var user = jwt.getUser(req.headers.authorization);
        if (user == null) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        var content = req.body.content;
        var title = req.body.title;
        if (content == null || content.length < 1 || content.length > 500) {
            return res.status(400).json({ error: "Message content must be between 1 and 500 characters." });
        }
        if (title == null || title.length < 1 || title.length > 100) {
            return res.status(400).json({ error: "Message title must be between 1 and 100 characters." });
        }
        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    attributes: ['id', 'username'],
                    where: { id: user }
                }).then(function(userFound) {
                    done(null, userFound);
                }).catch(function(err) {
                    return res.status(500).json({ error: "Unable to verify user." });
                })
            },
            function(userFound, done) {
                if (userFound) {
                    // console.log('userFound =', userFound.id);
                    // return;
                    var newMessage = models.Message.create({
                        title: title,
                        content: content,
                        likes: 0,
                        UserId: userFound.id,
                    }).then(function(newMessage) {
                        done(newMessage);
                    }).catch(function(err) {
                        console.log(err);
                        return res.status(404).json({ error: 'Can not add message.' })
                    })
                } else {
                    return res.status(404).json({ error: "User not found." });
                }
            },
        ], function(newMessage) {
            if (newMessage) {
                return res.status(201).json({
                    'messageId': newMessage.id,
                    'content': newMessage.content,
                    'title': newMessage.title,
                    'userId': newMessage.UserId,
                    'createdAt': newMessage.createdAt
                });
            } else {
                return res.status(500).json({ error: "Unable to create message." });
            }
        })
    },
    // Function to get user messages
    getMessages: function(req, res) {
        var userId = jwt.getUser(req.headers.authorization);
        if (userId == null) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        var fields = req.query.fields;
        var limits = req.query.limit;
        var offset = req.query.offset;
        var order = req.query.order;


        var messages = models.Message.findAll({
            //order: [(order != null) ? order.split(':') : ['createdAt', 'DESC']],
            //attributes: (fields !== '*') ? fields.split(',') : null,
            limits: (limits !== null && !isNaN(limits)) ? parseInt(limits) : 10,
            offset: (offset !== null && !isNaN(offset)) ? parseInt(offset) : null,
            where: { UserId: userId },
            include: [{
                model: models.User,
                attributes: ['id', 'username']
            }]
        }).then(function(messages) {
            if (messages.length > 0) {
                return res.status(200).json(messages);
            } else {
                return res.status(404).json({ error: "No messages found for this user." });
            }
        }).catch(function(err) {
            console.log(err);
            return res.status(500).json({ error: "Unable to fetch messages." });
        });
    }

};