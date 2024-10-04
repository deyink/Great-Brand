const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ticket_db', 'root', 'Akanji@222', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;
