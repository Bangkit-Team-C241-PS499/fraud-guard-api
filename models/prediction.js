module.exports = (sequelize, DataTypes) => {
  const Prediction = sequelize.define("Prediction", {
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  });

  return Prediction;
};
