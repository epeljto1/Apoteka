const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const Invoice = sequelize.define("Invoice", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        issueDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        totalAmount: {
            type: Sequelize.DOUBLE,
            allowNull: false
        },
        paymentMethod: {
            type: Sequelize.STRING,
            allowNull: false
        },
        deliveryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Deliveries',
                key: 'id'
            }
        }
    });
    return Invoice;
};