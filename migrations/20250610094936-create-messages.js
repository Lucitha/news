'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('messages', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                allowNull: false,
                type: Sequelize.STRING
            },
            content: {
                allowNull: false,
                type: Sequelize.STRING
            },
            attachement: {
                type: Sequelize.STRING
            },
            likes: {

                type: Sequelize.INTEGER
            },
            userId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'users', // Assuming the users table is already created
                    key: 'id'
                },

            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('messages');
    }
};