const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    const Modification = sequelize.define("Modification", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        modificationDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        version: {
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
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    });
    return Modification;
};