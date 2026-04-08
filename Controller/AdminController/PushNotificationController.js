const Notification = require('../../Schema/AdminSchema/PushNotificationSchema')

const getNotifications = async (req, res) =>{
    try{
        const notifications = await Notification.find().sort({createdAt: -1}) 
        res.status(201).json(notifications)
    }
    catch(error){
        res.status(500).json({msg: "Error Message", error})
    }
}

const createNotification = async (req, res)=>{
    const {title, message} = req.body
    try {
        const notification = await Notification.create({
            title, message
        })
        // Return the created notification object
        res.status(201).json(notification) // Changed this line
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const toggleNotificationStatus = async (req, res)=>{
    try {
        const notification = await Notification.findById(req.params.id) // Changed variable name
        if(!notification){
            return res.status(404).json({msg: "Not Found"})
        }
        notification.status = notification.status === "Active" ? "Inactive" : "Active";
        await notification.save() // Now this matches the variable name
        res.json(notification)
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
}

const deleteNotification = async (req, res)=>{
    try {
        await Notification.findByIdAndDelete(req.params.id)
        res.status(200).json({msg: "Notification Deleted"}) 
    } catch (error) {
        console.log("Error Found in Deleted", error)
        res.status(500).json({msg: "Not Delete Try Again", error})
    }
}

module.exports = {getNotifications, createNotification, toggleNotificationStatus, deleteNotification}