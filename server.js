require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const articleRoutes = require("./routes/articleRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/articles", articleRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await sequelize.sync({ force: false });
  console.log("Database connected!");
});
