const sequelize = require('../config/database');

const User = require('./User')(sequelize);
const Customer = require('./Customer')(sequelize);
const Address = require('./Address')(sequelize);
const ScreenType = require('./ScreenType')(sequelize);
const ServiceRequest = require('./ServiceRequest')(sequelize);
const MeasurementVisit = require('./MeasurementVisit')(sequelize);
const RequestItem = require('./RequestItem')(sequelize);

Customer.hasMany(Address, { foreignKey: 'customer_id', as: 'addresses' });
Address.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Customer.hasMany(ServiceRequest, { foreignKey: 'customer_id', as: 'service_requests' });
ServiceRequest.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Address.hasMany(ServiceRequest, { foreignKey: 'address_id', as: 'service_requests' });
ServiceRequest.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });

ServiceRequest.hasMany(MeasurementVisit, { foreignKey: 'service_request_id', as: 'measurement_visits' });
MeasurementVisit.belongsTo(ServiceRequest, { foreignKey: 'service_request_id', as: 'service_request' });

User.hasMany(MeasurementVisit, { foreignKey: 'professional_id', as: 'measurement_visits' });
MeasurementVisit.belongsTo(User, { foreignKey: 'professional_id', as: 'professional' });

ServiceRequest.hasMany(RequestItem, { foreignKey: 'service_request_id', as: 'items' });
RequestItem.belongsTo(ServiceRequest, { foreignKey: 'service_request_id', as: 'service_request' });

ScreenType.hasMany(RequestItem, { foreignKey: 'screen_type_id', as: 'request_items' });
RequestItem.belongsTo(ScreenType, { foreignKey: 'screen_type_id', as: 'screen_type' });

ServiceRequest.belongsToMany(ScreenType, {
  through: RequestItem,
  foreignKey: 'service_request_id',
  otherKey: 'screen_type_id',
  as: 'screen_types'
});

ScreenType.belongsToMany(ServiceRequest, {
  through: RequestItem,
  foreignKey: 'screen_type_id',
  otherKey: 'service_request_id',
  as: 'service_requests'
});

module.exports = {
  sequelize,
  User,
  Customer,
  Address,
  ScreenType,
  ServiceRequest,
  MeasurementVisit,
  RequestItem
};
