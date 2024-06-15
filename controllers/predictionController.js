const {Prediction, User} = require("../models");
const tf = require("@tensorflow/tfjs-node");
const fetch = require("node-fetch");
const sastrawijs = require("sastrawijs");
const sw = require("stopword");
const fs = require("fs");
const path = require("path");
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();

// const tokenizers = require("tokenizers");

class L2 {
    static className = "L2";

    constructor(config) {
        return tf.regularizers.l1l2(config);
    }
}

tf.serialization.registerClass(L2);

let model;

const loadModel = async () => {
    try {
        model = await tf.loadLayersModel(
            "https://storage.googleapis.com/c241-ps499-fraud-guard-storage/model_new/model.json"
        );
        console.log("Model loaded successfully");
    } catch (error) {
        console.error("Error loading model:", error);
    }
};

loadModel();

const checkSpam = async (req, res) => {
    try {
        const {message} = req.body;

        const processedMessage = preprocessMessage(message);

        // Prediksi
        const predictionTensor = model.predict(processedMessage);

        // Ambil skor prediksi dan confidence score
        const score = await predictionTensor.data();
        const confidenceScore = Math.max(...score) * 100;

        // Debug: cetak skor prediksi untuk memastikan nilainya benar
        console.log("Score:", score);
        console.log("Confidence Score:", confidenceScore);

        // Kelas yang sesuai dengan output model
        const classes = ["normal", "penipuan", "promo"];

        // Ambil indeks kelas prediksi
        const prediction = tf.argMax(predictionTensor, 1).dataSync()[0];

        // Debug: cetak indeks kelas prediksi
        console.log("Prediction Index:", prediction);

        // Ambil label berdasarkan indeks prediksi
        const label = classes[prediction];

        // Simpan prediksi ke database
        const newPrediction = await Prediction.create({
            message,
            label,
            prediction: confidenceScore,
            UserId: req.user.id,
        });

        res.status(201).send(newPrediction);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
};

function padSequences(arr, maxLength) {
    if (arr.length > maxLength) {
        return arr;
    }
    while (arr.length < maxLength) {
        arr.push(0);
    }
    return arr;
}

const preprocessMessage = (message) => {
    const maxLength = 120; // Panjang yang diharapkan oleh model
    const lowerText = message.toLowerCase();
    console.log("lowertext: " + lowerText);
    const emojiPattern =
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}\u{1F926}-\u{1F937}\u{10000}-\u{10FFFF}\u{1F601}]+/gu;
    const textNoEmoji = lowerText.replace(emojiPattern, "");
    console.log("no emoji: " + textNoEmoji);
    const textNoNumber = textNoEmoji.replace(/\d+/g, "");
    console.log("no number: " + textNoNumber);
    const textNoPunctuation = textNoNumber.replace(
        /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g,
        ""
    );
    console.log("no punct: " + textNoPunctuation);
    const textNoSpace = textNoPunctuation.trim();
    console.log("no space: " + textNoSpace);
    const textClear = textNoSpace.replace(/\s+/g, " ");
    console.log("clear Text: " + textClear);
    const wordRepetition = textClear.replace(/(.)\1+/g, "$1$1");
    console.log("no repetition: " + wordRepetition);

    const idStopwords = sw.ind;
    const words = wordRepetition.split(" ");
    const filteredWords = sw.removeStopwords(words, idStopwords);

    const bannedWords = [
        "uqjy",
        "dehdje",
        "jwdnmb",
        "wxvlezuvws",
        "ircel",
        "swjjw",
        "dmv",
        "dxrgz",
        "qjtajuq",
        "zzhwntdft",
        "xywrfw",
        "fztnmdrrduy",
        "xsezuz",
        "kbyv",
        "iyyveyzqkdgm",
        "arlrmdjy",
        "sfarif",
        "sfomar",
        "nzxx",
        "mtsco",
        "wkwk",
        "wkwkw",
        "wkwkwk",
        "hihi",
        "hihihii",
        "hihihi",
        "hehehe",
        "hehehehe",
        "hehe",
        "huhu",
        "huhuu",
        "ancok",
        "guak",
        "cokcok",
        "hhmm",
        "annya",
        "huftt",
    ];

    const reBannedWords = new RegExp(
        "\\b(" + bannedWords.join("|") + ")\\b",
        "gi"
    );
    const filteredWordsString = filteredWords.join(" ");
    const removeBannedWordsString = filteredWordsString.replace(
        reBannedWords,
        ""
    );
    const removeBannedWords = removeBannedWordsString.split(" ");

    const slangFile = path.join(__dirname, 'slang.txt');
    const slangs = fs.readFileSync(slangFile, "utf8").split("\n");

    let dictSlangs = {};
    slangs.forEach((line) => {
        const [key, value] = line.split(":").map((str) => str.trim());
        dictSlangs[key] = value;
    });

    console.log("dictSlangs: " + dictSlangs);
    let cleanText = [];

    for (let word of removeBannedWords) {
        let wordList = tokenizer.tokenize(word);
        for (let i = 0; i < wordList.length; i++) {
            if (dictSlangs[wordList[i]]) {
                wordList[i] = dictSlangs[wordList[i]];
            }
        }
        cleanText.push(wordList.join(" "));
    }

    console.log("cleanText: " + cleanText);

    const cleanTextString = cleanText.join(" ");
    console.log("cleanTextString: " + cleanTextString);
    const stemmer = new sastrawijs.Stemmer();
    const preWords = cleanTextString.split(" ");
    console.log("preWords: " + preWords);
    const stemmedWords = preWords.map((word) => stemmer.stem(word));
    console.log("stemmedWords: " + stemmedWords);
    const stemmedText = stemmedWords.join(" ");
    console.log("stemmedText: " + stemmedText);
    let stemmedTextArray = stemmedText.split(" ");
    console.log("stemmedTextArray: " + stemmedTextArray);

    let tokenizedText = stemmedTextArray.map(sentence => tokenizer.tokenize(sentence));
    console.log("tokenizedText: " + tokenizedText);

    let sequences = tokenizedText.map(tokens => tokens.map(token => token.charCodeAt(0)));
    console.log("sequences: " + sequences);

    const maxlen = 120

    const paddedSequences = padSequences(sequences, maxlen);
    console.log("paddedSequences: " + paddedSequences);
    const flattenedSequences = [].concat(...paddedSequences);
    console.log("flattenedSequences: " + flattenedSequences);

    return tf.tensor2d([flattenedSequences]);
};

const getPredictionHistory = async (req, res) => {
    try {
        const predictions = await Prediction.findAll({
            where: {UserId: req.user.id, deletedAt: null},
            order: [["timestamp", "DESC"]],
        });
        res.send(predictions);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
};

const getPredictionDetail = async (req, res) => {
    try {
        const {id} = req.params;
        const prediction = await Prediction.findOne({
            where: {id, UserId: req.user.id},
        });
        if (!prediction) {
            return res.status(404).send({error: "Prediction not found"});
        }
        res.send(prediction);
    } catch (error) {
        res.status(500).send({error: error.message});
    }
};

const softDeletePredictions = async (req, res) => {
    try {
        await Prediction.update(
            {deletedAt: new Date()},
            {where: {UserId: req.user.id}}
        );
        res.send({message: "All predictions deleted"});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
};

module.exports = {
    checkSpam,
    getPredictionHistory,
    getPredictionDetail,
    softDeletePredictions,
};
