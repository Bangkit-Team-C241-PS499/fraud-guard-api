const express = require("express");
const {
  checkSpam,
  getPredictionHistory,
  getPredictionDetail,
  softDeletePredictions,
} = require("../controllers/predictionController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, checkSpam);
router.get("/history", authMiddleware, getPredictionHistory);
router.get("/:id", authMiddleware, getPredictionDetail);
router.delete("/", authMiddleware, softDeletePredictions);

module.exports = router;
