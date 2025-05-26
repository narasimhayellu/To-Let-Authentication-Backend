const express = require("express");
const { userRegistration, userLogin, userPass, passReset } = require("../controllers/userControllers");
const router = express.Router();
const requireSignIn = require("../middleware/authMiddleware");

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.post("/forgot-password", userPass);
router.patch("/forgot-password/:token", passReset)
router.get("/protected", requireSignIn, (req, res) => {
    res.status(200).send({ message: "Protected route accessed", user: req.user });
  });

module.exports = router;