const Subscriptions = require ('./subscriptions.model');
const jwt = require ("jsonwebtoken");
const config = require ("../../config/auth.config");


//add subcription
exports.createSubscription = async (req, res) => {
    // Check if all attributes are provided
    const {users_id,plan_id,subscription_status_id} = req.body;
    const requiredAttributes = ['users_id', 'plan_id','subscription_status_id'];
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

        const parsedSubscriptionStatusId = parseInt(subscription_status_id); // Ensure is an integer
        const parsedPlanId = parseInt(plan_id); // Ensure is a integer
        const parsedUsersId = parseInt(users_id); // Ensure is an integer
        
        // Validate that the parsed values are valid numbers
        if (isNaN(parsedPlanId) || isNaN(parsedUsersId) || isNaN(parsedSubscriptionStatusId) )  {
            return res.status(400).send({ message: 'Invalid data types' });
        }

        // Check if subscription exists
        const subscriptionExists = await Subscriptions.query()
            .where({
                plan_id,
                users_id,
                subscription_status_id
                
            }).first();

        if (subscriptionExists) {
            return res.status(400).send({
                message: "Failed! subscription already exists!"
            });
        }

        // Insert the new subscription with parsed values
        const newSubscription = await Subscriptions.query().insert({
        
            plan_id:parsedPlanId,
            subscription_status_id:parsedSubscriptionStatusId,
            users_id:parsedUsersId
        });

        return res.status(201).send({
            message: "Subscription added successfully!",
            data: {
                users_id: newSubscription.users_id,
                plan_id: newSubscription.plan_id,
                subscription_status_id: newSubscription.subscription_status_id
                
            }   
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Internal server error"
        });
    }
};


//get subscripiton by Id
exports.getSubscriptionById = async (req, res) => {
    const { Id } = req.params;

    try {

        const authHeader = req.headers['authorization'];
        let userId = "";
        if (authHeader) {
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(accessToken, config.secret);
            userId = decodedToken.id;
        }
        const subscription = await Subscriptions.query().findById(Id);

        if (!subscription) {
            return res.status(404).json({ error: 'Shift not found' });
        }

        res.status(200).json(subscription);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

// get all 
exports.getAllSubscriptions = async (req, res) => {

    try {

        const authHeader = req.headers['authorization'];
        let userId = "";
        if (authHeader) {
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(accessToken, config.secret);
            userId = decodedToken.id;
        }

        const allSubscriptions = await Subscriptions.query();

        res.status(200).json(allSubscriptions);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

// Update subcription details

exports.updateSubscriptionDetails = async (req, res) => {
    const { Id } = req.params;
    const editables = ['plan_id', 'subscription_status_id'];

    // Filter out any keys that are not allowed to be updated
    const invalidKeys = Object.keys(req.body).filter(key => !editables.includes(key));
    if (invalidKeys.length > 0) {
        return res.status(400).json({ error: `Not allowed to update: ${invalidKeys.join(', ')}` });
    }

    const updates = {};
    const { subscription_status_id, plan_id } = req.body;

    // Parse and validate only if the fields are present in req.body
    if (subscription_status_id!== undefined) {
        const parsedSubscriptionStatusId = parseFloat(subscription_status_id);
        if (isNaN(subscription_status_id)) {
            return res.status(400).send({ message: 'Invalid!' });
        }
        updates.subscription_status_id= parsedSubscriptionStatusId;
    }

    if (plan_id !== undefined) {
        const parsedPlanId= parseInt(plan_id);
        if (isNaN(parsedPlanId)) {
            return res.status(400).send({ message: 'Invalid input' });
        }
        updates.plan_id = parsedPlanId;

        }


    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid updates provided!' });
    }

    try {
        // Check if the subcription exists
        const subscriptionExists = await Subscriptions.query().where({ id: Id }).first();
        if (!subscriptionExists) {
            return res.status(404).json({ message: "Failed! Subscription does not exist!" });
        }
    
        // Perform the update
        await Subscriptions.query().patch(updates).where({ id: Id });
        res.status(200).json({ message: "Subscription updated successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//Delete 

exports.deleteSubscriptionById = async (req, res) => {
    const { Id } = req.params;

    try {

        const authHeader = req.headers['authorization'];
        let userId = "";
        if (authHeader) {
            const accessToken = authHeader.split(' ')[1];
            const decodedToken = jwt.verify(accessToken, config.secret);
            userId = decodedToken.id;
        }
        //check if subcription exists

        const subscriptionExists = await Subscriptions.query().findById(Id);
        if (!subscriptionExists) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        // Delete the subcription
        await Subscriptions.query().deleteById(Id);
        res.status(200).json({ message: "Subscription deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
