'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: DataTypes.STRING,
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        bio: DataTypes.TEXT,
        isAdmin: DataTypes.BOOLEAN
    });

    User.associate = function(models) {
        // associations can be defined here
        User.hasMany(models.Message);
    };

    return User;
};