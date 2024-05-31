const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const register = async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).send({ error: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, password: hashedPassword });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.status(201).send({ userId: user.id, token, name: user.name });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: "Invalid login credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.send({ userId: user.id, token, name: user.name });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const logout = (req, res) => {
  // Handle logout logic here (e.g., token blacklisting if necessary)
  res.send({ message: "Logout successful" });
};

module.exports = {
  register,
  login,
  logout,
};
