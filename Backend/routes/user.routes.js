const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { body } = require("express-validator");
const { authUser } = require("../middlewares/auth.middleware");

router.post("/register",
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    userController.registerUser
);

router.post("/login", 
    body("email").isEmail().withMessage("Invalid Email"),
    userController.loginUser
);

router.post("/update", authUser,
    body("fullname.firstname").isLength({min:2}).withMessage("First name must be at least 2 characters long"),
    body("fullname.lastname").isLength({min:2}).withMessage("Last name must be at least 2 characters long"),
    userController.updateUserProfile
);

router.get("/profile", authUser, userController.userProfile);

    
router.get("/logout", authUser, userController.logoutUser);

module.exports = router;
