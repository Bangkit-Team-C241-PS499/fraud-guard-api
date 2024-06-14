const { Prediction, User } = require("../models");
const tf = require('@tensorflow/tfjs-node');
const fetch = require('node-fetch');

let model;

const loadModel = async () => {
  try {
    model = await tf.loadLayersModel('https://storage.googleapis.com/c241-ps499-fraud-guard-storage/tfjs_model/model.json');
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Error loading model:', error);
  }
};

loadModel();

const checkSpam = async (req, res) => {
  try {
    const { message, label } = req.body;

    const processedMessage = preprocessMessage(message);
    
    const predictionTensor = model.predict(processedMessage);
    const prediction = predictionTensor.dataSync()[0];

    const newPrediction = await Prediction.create({
      message,
      label,
      UserId: req.user.id,
      prediction,
    });
    res.status(201).send(newPrediction);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const preprocessMessage = (message) => {
  return tf.tensor([message.split('').map(char => char.charCodeAt(0))]);
};

const getPredictionHistory = async (req, res) => {
  try {
    const predictions = await Prediction.findAll({
      where: { UserId: req.user.id, deletedAt: null },
      order: [["timestamp", "DESC"]],
    });
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
