const { Prediction, User } = require("../models");

const checkSpam = async (req, res) => {
  try {
    const { message, label } = req.body;
    const prediction = await Prediction.create({
      message,
      label,
      UserId: req.user.id,
    });
    res.status(201).send(prediction);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getPredictionHistory = async (req, res) => {
  try {
    const predictions = await Prediction.findAll({
      where: { UserId: req.user.id, deletedAt: null },
      order: [["timestamp", "DESC"]],
    });
    // res.send(req.user.id);
    res.send(predictions);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getPredictionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const prediction = await Prediction.findOne({
      where: { id, UserId: req.user.id },
    });
    if (!prediction) {
      return res.status(404).send({ error: "Prediction not found" });
    }
    res.send(prediction);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const softDeletePredictions = async (req, res) => {
  try {
    await Prediction.update(
      { deletedAt: new Date() },
      { where: { UserId: req.user.id } }
    );
    res.send({ message: "All predictions deleted" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  checkSpam,
  getPredictionHistory,
  getPredictionDetail,
  softDeletePredictions,
};
