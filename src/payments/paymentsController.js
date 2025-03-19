const Payments = require ('./payments.model');
const jwt = require ("jsonwebtoken");
const config = require ("../../config/auth.config");


//add payment
const addPayment = async (req, res) => {
    // Check if all attributes are provided
    const {subscription_id,amount,status_id,payment_date,transaction_id,payment_method} = req.body;
    const requiredAttributes = ['subscription_id','amount','status_id','payment_date','transaction_id','payment_method'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).send({ message: `Missing attributes: ${missingAttributes.join(', ')}` });
    }

    const hasUndefinedAttributes = requiredAttributes.some(attr => req.body[attr] === undefined);
    if (hasUndefinedAttributes) {
        return res.status(400).send({ message: 'All attributes must have values.' });
    }

    try {
        const authHeader = req.headers['authorization'];
        let userId = "";
        if (authHeader) {
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(accessToken, config.secret);
            userId = decodedToken.id;
        }
        const parsedAmount = parseFloat(amount); // Ensure  is a float
        const parsedStatusId = parseInt(status_id); // Ensure is an integer
        const parsedSubscriptionStatusId = parseInt(subscription_id); // Ensure is a integer
        const parsedTransactionId = parseInt(transaction_id); // Ensure is an integer
        
        // Validate that the parsed values are valid numbers
        if (isNaN(parsedStatusId) || isNaN(parsedSubscriptionStatusId) || isNaN(parsedTransactionId) || isNaN(parsedAmount) )  {
            return res.status(400).send({ message: 'Invalid data types' });
        }

        // Check if payment exists
        const paymentExists = await Payments.query()
            .where({
                subscription_id,
                transaction_id
                  
            }).first();

        if (paymentExists) {
            return res.status(400).send({
                message: "Failed! payment already exists!"
            });
        }

        // Insert the new payment with parsed values
        const newPayment = await Payments.query().insert({
        
            status_id:parsedStatusId,
            subscription_id:parsedSubscriptionStatusId,
            transaction_id:parsedTransactionId,
            amount:parsedAmount,
            payment_date:payment_date,
            payment_method:payment_method
        });

        return res.status(201).send({
            message: "Payment added successfully!",
            data: {
                status_id: newPayment.status_id,
                subscription_id: newPayment.subscription_id,
                transaction_id: newPayment.transaction_id,
                amount:newPayment.amount,
                payment_method:newPayment.payment_method,
                payment_date:newPayment.payment_date
                
            }   
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};


//get payment by Id
const getPaymentById = async (req, res) => {
    const { Id } = req.params;

    try {

        const authHeader = req.headers['authorization'];
        let userId = "";
        if (authHeader) {
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(accessToken, config.secret);
            userId = decodedToken.id;
        }
        const payments = await Payments.query().findById(Id);

        if (!payments) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.status(200).json(payments);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

// get all 
const getAllPayments = async (req, res) => {

    try {

        const authHeader = req.headers['authorization'];
        let userId = "";
        if (authHeader) {
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(accessToken, config.secret);
            userId = decodedToken.id;
        }

        const getAllPayments = await Payments.query();

        res.status(200).json(getAllPayments);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

// Update payment details

const updatePaymentDetails = async (req, res) => {
    const { Id } = req.params;
    const editables = ['status_id'];//This should be updatable because payment statuses (e.g., Pending, Completed, Failed) can change based on transaction events.

    // Filter out any keys that are not allowed to be updated
    const invalidKeys = Object.keys(req.body).filter(key => !editables.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).json({ error: `Not allowed to update: ${invalidKeys.join(', ')}` });
    }

    const updates = {};
    const { status_id } = req.body;

    // Parse and validate only if the fields are present in req.body
    if (status_id!== undefined) {
        const parsedStatusId = parseFloat(status_id);
        if (isNaN(status_id)) {
            return res.status(400).send({ message: 'Invalid!' });
        }
        updates.status_id= parsedStatusId;
    }

   
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid updates provided!' });
    }

    try {
        // Check if the payment exists
        const paymentExists = await Payments.query().where({ id: Id }).first();
        if (!paymentExists) {
            return res.status(404).json({ message: "Failed! Payment does not exist!" });
        }
    
        // Perform the upddate
        await Payments.query().patch(updates).where({ id: Id });
        res.status(200).json({ message: "Payment updated successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//Delete 

const deletePaymentsById = async (req, res) => {
    const { Id } = req.params;

    try {

        const authHeader = req.headers['authorization'];
        let userId = "";
        if (authHeader) {
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(accessToken, config.secret);
            userId = decodedToken.id;
        }
        //check if payments exists

        const paymentExists = await Payments.query().findById(Id);
        if (!paymentExists) {
            return res.status(404).json({ message: "payment not found" });
        }

        // Delete the payment
        await Payments.query().deleteById(Id);
        res.status(200).json({ message: "Payment deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    addPayment,
    getAllPayments,
    getPaymentById,
    updatePaymentDetails,
    deletePaymentsById,
}
