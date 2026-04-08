const express = require("express");
const { createContact,getAllContacts } = require("../../Controller/AdminController/AdminContactController");
const { authMiddleware, authorizeRole } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");
const router = express.Router();

router.post("/", createContact);
router.use(authMiddleware, activityTracker)
router.get("/", authMiddleware, authorizeRole("admin", "sub-admin"), getAllContacts);

module.exports = router;
