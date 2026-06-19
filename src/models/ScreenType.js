const { DataTypes, Model } = require('sequelize');

class ScreenType extends Model {}

module.exports = (sequelize) => {
  ScreenType.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    { sequelize, tableName: 'screen_types', modelName: 'ScreenType' }
  );

  return ScreenType;
};
