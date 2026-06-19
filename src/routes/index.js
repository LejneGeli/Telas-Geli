const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const customerController = require('../controllers/customerController');
const addressController = require('../controllers/addressController');
const screenTypeController = require('../controllers/screenTypeController');
const serviceRequestController = require('../controllers/serviceRequestController');
const requestItemController = require('../controllers/requestItemController');
const measurementVisitController = require('../controllers/measurementVisitController');
const crudRoutes = require('./crudRoutes');

const router = express.Router();

router.post('/login', authController.login);

router.use(authMiddleware);
router.use('/users', crudRoutes(userController));
router.use('/customers', crudRoutes(customerController));
router.use('/addresses', crudRoutes(addressController));
router.use('/screen-types', crudRoutes(screenTypeController));
router.use('/service-requests', crudRoutes(serviceRequestController));
router.use('/request-items', crudRoutes(requestItemController));
router.use('/measurement-visits', crudRoutes(measurementVisitController));

module.exports = router;
