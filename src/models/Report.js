const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    const Report = sequelize.define('Report', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        totalSold: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        totalEarnings: {
            type: Sequelize.DOUBLE,
            defaultValue: 0,
            allowNull: false
        },
        startDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        endDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        generatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });

    return Report;
};
