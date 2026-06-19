const { DataTypes, Model } = require('sequelize');

class ServiceRequest extends Model {}

module.exports = (sequelize) => {
  ServiceRequest.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customer_id: { type: DataTypes.INTEGER, allowNull: false },
      address_id: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM('pending', 'waiting_measurement', 'measured', 'budget_sent', 'approved', 'rejected', 'scheduled', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      measurement_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      preferred_date: { type: DataTypes.DATEONLY, allowNull: true },
      total_estimated_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }
    },
    { sequelize, tableName: 'service_requests', modelName: 'ServiceRequest' }
  );

  return ServiceRequest;
};
