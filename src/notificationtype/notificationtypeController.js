
// const jwt = require("jsonwebtoken");
// const config = require("../../config/auth.config");
const NotificationType = require('./notificationtype.model');


const createNotificationType = async (req, res) => {
    // const authHeader = req.headers['authorization'];
    // const accessToken = authHeader.split(' ')[1];
    // const decodedToken = jwt.verify(accessToken, config.secret);
    // const userId = decodedToken.id;

    try {

        if (!req.body.name) {
            return res.status(400).send({
                message: "name is required!"
            });
        }

        // Check if exists
        const notificationTypeExists = await NotificationType.query()
            .where({ name: req.body.name })
            .first();

        if (notificationTypeExists) {
            return res.status(400).send({
                message: "Failed!Already exists!"
            });
        }

        const payload = {
            name: req.body.name,
            created_by: parseInt(userId)
        };

        const notificationType = await NotificationType.query().insert(payload);

        return res.status(201).send({
            message: "Created successfully!",
            data: {
                id: notificationType.id,
                name: notificationType.name
            }
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                message: "Unauthorized! Token expired"
            });
        }
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};

const getAllNotificationType = async (req, res) => {
    try {
        const allNotificationType = await NotificationType.query(); // Fixed query here
        res.status(200).json(allNotificationType);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};


const getNotificationTypeById = async (req, res) => {
    const { id } = req.params;

    try {
        const notificationType = await NotificationType.query().findById(id);

        if (!notificationType) {
            return res.status(404).json({ error: 'Schedule Type not found' });
        }

        res.status(200).json(NotificationType);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}


// Update Schedule Type
const updateNotificationType = async (req, res) => {
    const { id } = req.params;



    if (!req.body.name) {
        return res.status(400).send({
            message: "name is required!"
        });
    }

    try {
        // Check if schedule type exists
        const notificationType = await NotificationType.query().findById(id);

        if (!notificationType) {
            return res.status(404).send({
                message: "Not found!"
            });
        }

        const updates = req.body;
        await NotificationType.query().patch(updates).where({ id });


        const updatedNotificationType = await NotificationType.query().findById(id);
        res.status(200).send({
            message: "Updated successfully!",
            data: updatedNotificationType
        });

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};

// Delete Schedule Type
const deleteNotificationType = async (req, res) => {
    const { id } = req.params;


    try {
        // Check if schedule type exists
        const notificationType = await NotificationType.query().findById(id);

        if (!NotificationType) {
            return res.status(404).send({
                message: "Not found!"
            });
        }

        // Delete the schedule type
        await notificationType.query().deleteById(id);

        res.status(200).send({
            message: "Deleted successfully!"
        });

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};
module.exports = {
    createNotificationType,
    getAllNotificationType,
    updateNotificationType,
    getNotificationTypeById,
    deleteNotificationType,
}