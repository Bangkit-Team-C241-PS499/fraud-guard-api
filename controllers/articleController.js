const axios = require("axios");

const getArticles = async (req, res) => {
  try {
    const response = await axios.get("https://api.medium.com/v1/articles", {
      params: {
        tag: "spam, penipuan",
      },
      headers: {
        Authorization: `Bearer ${process.env.MEDIUM_API_KEY}`,
      },
    });

    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getArticleDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://api.medium.com/v1/articles/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MEDIUM_API_KEY}`,
        },
      }
    );

    res.send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleDetail,
};
