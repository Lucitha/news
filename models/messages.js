'use strict';
module.exports = (sequelize, DataTypes) => {
    var Message = sequelize.define('Message', {
        title: DataTypes.STRING,
        content: DataTypes.STRING,
        attachment: DataTypes.STRING,
        likes: DataTypes.INTEGER,
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            },
        }
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here

                models.Message.belongsTo(models.User, {
                    foreignKey: {
                        allowNull: false
                    }
                })
            }
        }
    });
    return Message;
};