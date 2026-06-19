const { DataTypes, Model } = require('sequelize');

class Address extends Model {}

module.exports = (sequelize) => {
  Address.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      street: { type: DataTypes.STRING(160), allowNull: false },
      number: { type: DataTypes.STRING(20), allowNull: false },
      neighborhood: { type: DataTypes.STRING(100), allowNull: false },
      city: { type: DataTypes.STRING(100), allowNull: false },
      state: { type: DataTypes.STRING(2), allowNull: false },
      zip_code: { type: DataTypes.STRING(12), allowNull: false },
      complement: { type: DataTypes.STRING(160), allowNull: true }
    },
    { sequelize, tableName: 'addresses', modelName: 'Address' }
  );

  return Address;
};
