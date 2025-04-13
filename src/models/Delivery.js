const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const Delivery = sequelize.define("Delivery", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        deliveryDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: false
        },
        contractId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Contracts',
                key: 'id'
            }
        }
    });
    return Delivery;
};