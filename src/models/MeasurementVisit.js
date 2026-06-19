const { DataTypes, Model } = require('sequelize');

class MeasurementVisit extends Model {}

module.exports = (sequelize) => {
  MeasurementVisit.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      service_request_id: { type: DataTypes.INTEGER, allowNull: false },
      professional_id: { type: DataTypes.INTEGER, allowNull: false },
      scheduled_date: { type: DataTypes.DATE, allowNull: false },
      status: { type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
      notes: { type: DataTypes.TEXT, allowNull: true }
    },
    { sequelize, tableName: 'measurement_visits', modelName: 'MeasurementVisit' }
  );

  return MeasurementVisit;
};
