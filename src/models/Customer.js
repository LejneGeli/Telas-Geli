const { DataTypes, Model } = require('sequelize');

class Customer extends Model {}

module.exports = (sequelize) => {
  Customer.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(140), allowNull: false },
      email: { type: DataTypes.STRING(180), allowNull: true, validate: { isEmail: true } },
      phone: { type: DataTypes.STRING(30), allowNull: false },
      document: { type: DataTypes.STRING(20), allowNull: true, unique: true }
    },
    { sequelize, tableName: 'customers', modelName: 'Customer' }
  );

  return Customer;
};
