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
        prediction: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });

    return Prediction;
};
