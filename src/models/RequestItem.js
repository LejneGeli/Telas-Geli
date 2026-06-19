const { DataTypes, Model } = require('sequelize');

class RequestItem extends Model {}

module.exports = (sequelize) => {
  RequestItem.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      service_request_id: { type: DataTypes.INTEGER, allowNull: false },
      screen_type_id: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      width: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      height: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      room: { type: DataTypes.STRING(80), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
    },
    { sequelize, tableName: 'request_items', modelName: 'RequestItem' }
  );

  return RequestItem;
};
