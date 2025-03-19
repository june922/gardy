// const jwt = require("jsonwebtoken");
// const config = require("../../config/auth.config");
const Notification = require('./notifications.model'); // Import the Notification model

const createNotification = async (req, res) => {
    // const authHeader = req.headers['authorization'];
    // const accessToken = authHeader.split(' ')[1];
    // const decodedToken = jwt.verify(accessToken, config.secret);
    // const userId = decodedToken.id; // Extract user ID from the token

    try {
        // Validate the request body for required fields
        if (!req.body.message || !req.body.receiver || !req.body.title) {
            return res.status(400).send({
                message: "message, receiver, and title are required!"
            });
        }

        // Check if notification type exists (optional step, assuming you have a table for notification types)
        if (!req.body.notification_type_id) {
            return res.status(400).send({
                message: "notification_type_id is required!"
            });
        }

        // Check if priority_id and status_id are provided (optional, could be nullable)
        const notificationData = {
            sender: userId,  // Sender is the current user
            receiver: req.body.receiver, // The receiver from the request body
            title: req.body.title, // Title of the notification
            message: req.body.message, // Message content
            notification_type_id: req.body.notification_type_id, // Notification type
            link: req.body.link || null, // Optional link
            priority_id: req.body.priority_id || null, // Optional priority
            status_id: req.body.status_id || null, // Optional status
            created_at: new Date().toISOString(), // Timestamp of creation
            updated_at: new Date().toISOString() // Timestamp of creation (set same as created_at initially)
        };

        // Insert notification into the database
        const notification = await Notification.query().insert(notificationData);

        // Return success response with the created notification data
        return res.status(201).send({
            message: "Notification created successfully!",
            data: {
                id: notification.id,
                sender: notification.sender,
                receiver: notification.receiver,
                title: notification.title,
                message: notification.message,
                notification_type_id: notification.notification_type_id,
                link: notification.link,
                created_at: notification.created_at,
                updated_at: notification.updated_at
            }
        });

    } catch (error) {
        // Handle JWT token expiration
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                message: "Unauthorized! Token expired"
            });
        }

        // General server error
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.query(); // Fetch all notifications

        // Return a success response with the notifications data
        return res.status(200).json({
            message: "Notifications fetched successfully!",
            data: notifications
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};
const getNotificationById = async (req, res) => {
    const { id } = req.params;

    try {
        const notification = await Notification.query().findById(id); // Fetch notification by ID

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found!"
            });
        }

        // Return the notification data
        return res.status(200).json({
            message: "Notification fetched successfully!",
            data: notification
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};
module.exports = {
    createNotification,
    getAllNotifications,
    getNotificationById,
    };