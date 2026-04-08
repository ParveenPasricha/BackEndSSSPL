const express = require('express')
const { getNotifications, createNotification, toggleNotificationStatus, deleteNotification } = require('../../Controller/AdminController/PushNotificationController')
const activityTracker = require('../../middleware/activityTracker')
const { authMiddleware } = require('../../middleware/authMiddleware')
const router = express.Router();

router.get('/', getNotifications)
router.use(authMiddleware, activityTracker)
router.post('/',createNotification)
router.put('/:id', toggleNotificationStatus)
router.delete('/:id', deleteNotification)

module.exports = router