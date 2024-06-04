const express = require("express");
const {
    getProfile,
    updateProfile,
    changePassword,
    upload,
    uploadProfilePicture
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile/picture", authMiddleware, upload.single('file'), uploadProfilePicture);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
