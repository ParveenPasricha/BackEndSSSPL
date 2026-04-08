const express = require("express");
const router = express.Router();
const sliderController = require('../../Controller/AdminController/SliderController');
const upload = require("../../middleware/upload");
const { authMiddleware, authorizeRole, checkPermission } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker")

router.get("/active", sliderController.getActiveSliders);

router.use(authMiddleware, activityTracker);

router.post("/", authorizeRole("admin", "sub-admin"), checkPermission("create_slider"), upload.single("image"), sliderController.createSlider);
router.get("/", sliderController.getAllSliders);
router.put("/:id", authorizeRole("admin", "sub-admin"), checkPermission("edit_slider"), upload.single("image"), sliderController.updateSlider);
router.patch("/status/:id", authorizeRole("admin"), sliderController.updateSliderStatus);
router.delete("/:id", authorizeRole("admin"), sliderController.deleteSlider);

module.exports = router;