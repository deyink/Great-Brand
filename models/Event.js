const { DataTypes } = require('sequelize');
const sequelize = require('../config')

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    eventName: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    totalTickets: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    availableTickets: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,  // Sequelize will increment this on updates
      }
    }, 
    {
      version: true  // Enable optimistic locking based on the version field

    }
);
module.exports = Event;