const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const Event = require('./Event');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    eventId: { 
        type: DataTypes.INTEGER,
        references:{
            model: Event,
            key: 'id'
        },
    },
    status: { 
        type: DataTypes.ENUM('booked', 'waiting', 'canceled'), 
        allowNull: false,
        defaultValue: 'booked' }
});

Event.hasMany(Booking, { foreignKey: 'eventId' });
Booking.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = Booking;