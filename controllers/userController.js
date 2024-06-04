const bcrypt = require("bcrypt");
const {User} = require("../models");
const multer = require("multer");
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).send({error: "User not found"});
        }
        res.send({email: user.email, name: user.name, photoUrl: user.photoUrl});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
};

const updateProfile = async (req, res) => {
    try {
        const {name, email, photoUrl} = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).send({error: "User not found"});
        }
        user.name = name || user.name;
        user.email = email || user.email;
        await user.save();
        res.send({message: "Profile updated successfully"});
    } catch (error) {
        res.status(500).send({error: error.message});
    }
};

const changePassword = async (req, res) => {
    try {
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).send({error: "Passwords do not match"});
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).send({error: "User not found"});
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).send({error: "Invalid old password"});
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.send({message: "Password changed successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).send({error: "Server error"});
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb
    },
});

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({error: "Please upload a file"});
        }

        const blob = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET).file(req.file.originalname);
        const blobStream = blob.createWriteStream();

        blobStream.on("error", (err) => {
            console.error(err);
            res.status(500).send({error: err.message});
        });

        blobStream.on("finish", async () => {
            const photoUrl = `https://storage.googleapis.com/${process.env.GCLOUD_STORAGE_BUCKET}/${blob.name}`;
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).send({error: "User not found"});
            }
            user.photoUrl = photoUrl;
            await user.save();
            res.status(200).send({url: photoUrl});
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send({error: error.message});
    }
}

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    upload,
    uploadProfilePicture,
};
