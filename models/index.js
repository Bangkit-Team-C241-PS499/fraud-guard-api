const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize, Sequelize);
const Prediction = require('./prediction')(sequelize, Sequelize);

User.hasMany(Prediction, { as: 'predictions' });
Prediction.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Prediction,
};
