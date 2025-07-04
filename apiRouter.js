var express = require('express');
var userControl = require('./routes/userControl');
var messageControl = require('./routes/messageControl');
var likeControl = require('./routes/likeControl');


exports.router = (function() {
    var apiRouter = express.Router();
    // User registration route
    apiRouter.route('/user/register/').post(userControl.register);
    // User login route
    apiRouter.route('/user/login/').post(userControl.login);
    // User profile route
    apiRouter.route('/user/profil/').get(userControl.profil);
    // User update profile route
    apiRouter.route('/user/updateProfil/').put(userControl.updateProfil);

    apiRouter.route('/message/new/').post(messageControl.createMessage);
    // Get all user message route
    apiRouter.route('/message/user/').get(messageControl.getUserMessages);

    apiRouter.route('/message/all/').get(messageControl.getMessages);

    apiRouter.route('/message/:messageId/reaction/like').post(likeControl.likePost);

    return apiRouter;
})();