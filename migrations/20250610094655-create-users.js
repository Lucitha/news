'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
         allowNull: false,
        type: Sequelize.STRING
      },
      username: {
         allowNull: false,
        type: Sequelize.STRING
      },
      password: {
         allowNull: false,
        type: Sequelize.STRING
      },
      bio: {
         allowNull: true,
        type: Sequelize.STRING
      },
      isAdmin: {
         allowNull: false,
        defaultValue: 0,
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('users');
  }
};