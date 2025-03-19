const paymentstatus = require('./paymentpaymentstatus.model');
// const jwt = require("jsonwebtoken");
// const config = require("../../config/auth.config");


const createPaymentStatus = async (req, res) => {

    // const authHeader = req.headers['authorization'];
    // const accessToken = authHeader.split(' ')[1];
    // const decodedToken = jwt.verify(accessToken, config.secret);
    // const userId = decodedToken.id;

    if (!req.body.name) {
        return res.status(400).send({
            message: "name is required!"
        });
    }

    try {

        // Check if paymentstatus exists
        const paymentStatusExists = await paymentstatus.query()
            .where({
                name: req.body.name
            }).first();

        if (paymentStatusExists) {
            return res.status(400).send({
                message: "Failed! paymentstatus already exists!"
            });
        }

        const payload = {
            name: req.body.name,
            created_by: parseInt(userId)
        }

        const paymentStatus = await paymentstatus.query().insert(payload);

        return res.paymentStatus(201).send({
            message: "Created successfully!",
            data: {
                id: paymentStatus.id,
                name: paymentStatus.name
            }
        });

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

const getPaymentStatusById = async (req, res) => {
    const { id } = req.params;

    try {
        const paymentStatus = await paymentstatus.query().findById(id);

        if (!paymentStatus) {
            return res.Status(404).json({ error: 'Not found' });
        }

        res.status(200).json(paymentstatus);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

const getAllPaymentStatus = async (req, res) => {

    try {
        const allPaymentStatus = await paymentstatus.query();

        res.status(200).json(allPaymentStatus);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

};

module.exports = {
    createPaymentStatus,
    getPaymentStatusById,
    getAllPaymentStatus,
}
// TODO : Update paymentstatus
// TODO : Delete paymentstatus