
// // const jwt = require("jsonwebtoken");
// // const config = require("../../config/auth.config");
// const NotificationStatus = require('./notificationstatus.model');


// const createNotificationStatus = async (req, res) => {
//     // const authHeader = req.headers['authorization'];
//     // const accessToken = authHeader.split(' ')[1];
//     // const decodedToken = jwt.verify(accessToken, config.secret);
//     // const userId = decodedToken.id;

//     try {

//         if (!req.body.name) {
//             return res.status(400).send({
//                 message: "name is required!"
//             });
//         }

//         // Check if  exists
//         const notificationStatusExists = await NotificationStatus.query()
//             .where({ name: req.body.name })
//             .first();

//         if (notificationStatusExists) {
//             return res.status(400).send({
//                 message: "Failed! schedule type already exists!"
//             });
//         }

//         const payload = {
//             name: req.body.name,
//             created_by: parseInt(userId)
//         };

//         const notificationStatus = await NotificationStatus.query().insert(payload);

//         return res.status(201).send({
//             message: "Created successfully!",
//             data: {
//                 id: notificationStatus.id,
//                 name: notificationStatus.name
//             }
//         });

//     } catch (error) {
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).send({
//                 message: "Unauthorized! Token expired"
//             });
//         }
//         return res.status(500).send({
//             message: "Internal server error"
//         });
//     }
// };

// const getAllNotificationStatus = async (req, res) => {
//     try {
//         const allNotificationStatus = await NotificationStatus.query(); // Fixed query here
//         res.status(200).json(allNotificationStatus);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({
//             message: "Internal server error"
//         });
//     }
// };


// const getNotificationStatusById = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const notificationStatus = await NotificationStatus.query().findById(id);

//         if (!notificationStatus) {
//             return res.status(404).json({ error: 'Schedule Type not found' });
//         }

//         res.status(200).json(notificationStatus);

//     } catch (error) {
//         return res.status(500).send({
//             message: "Internal server error"
//         });
//     }

// }


// // Update 
// const updateNotificationStatus = async (req, res) => {
//     const { id } = req.params;



//     if (!req.body.name) {
//         return res.status(400).send({
//             message: "name is required!"
//         });
//     }

//     try {
//         // Check if exists
//         const notificationStatus = await NotificationStatus.query().findById(id);

//         if (!notificationStatus) {
//             return res.status(404).send({
//                 message: "Not found!"
//             });
//         }

//         const updates = req.body;
//         await notificationStatus.query().patch(updates).where({ id });


//         const updatedNotificationStatus = await NotificationStatus.query().findById(id);
//         res.status(200).send({
//             message: "updated successfully!",
//             data: updatedNotificationStatus
//         });

//     } catch (error) {
//         return res.status(500).send({
//             message: "Internal server error"
//         });
//     }
// };

// // Delete 
// const deleteNotificationStatus = async (req, res) => {
//     const { id } = req.params;


//     try {
//         // Check  exists
//         const notificationStatus = await NotificationStatus.query().findById(id);

//         if (!notificationStatus) {
//             return res.status(404).send({
//                 message: "Not found!"
//             });
//         }

//         // Delete 
//         await notificationStatus.query().deleteById(id);

//         res.status(200).send({
//             message: "Deleted successfully!"
//         });

//     } catch (error) {
//         return res.status(500).send({
//             message: "Internal server error"
//         });
//     }
// };

// module.export= {
//     createNotificationStatus,
//     getAllNotificationStatus,
//     getNotificationStatusById,
//     updateNotificationStatus,
//     deleteNotificationStatus,

// }