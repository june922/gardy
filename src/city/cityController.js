const City = require('./city.model');

const jwt = require("jsonwebtoken");
const config = require("../../config/auth.config");


exports.createCity = async (req, res) => {

    const authHeader = req.headers['authorization'];
    const accessToken = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(accessToken, config.secret);
    const userId = decodedToken.id;

    if (!req.body.name) {
        return res.status(400).send({
            message: "name is required!"
        });
    }

    if (!req.body.country_id) {
        return res.status(400).send({
            message: "Country is required!"
        });
    }

    try {

        // Check if country exists
        const countryExists = await Country.query()
            .where({
                id: req.body.country_id
            }).first();

        if (!countryExists) {
            return res.status(400).send({
                message: "Failed! Country provided does not exist!"
            });
        }

        // Check if city exists
        const cityExists = await City.query()
            .where({
                name: req.body.name,
                country_id: req.body.country_id
            }).first();

        if (cityExists) {
            return res.status(400).send({
                message: "Failed! City already exists!"
            });
        }

        const payload = {
            name: req.body.name,
            country_id: req.body.country_id,
            created_by: parseInt(userId)
        }

        const city = await City.query().insert(payload);

        return res.status(201).send({
            message: "City was created successfully!",
            data: {
                id: city.id,
                name: city.name,
                country_id: city.country_id
            }
        });

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

exports.getCityById = async (req, res) => {
    const { id } = req.params;

    try {
        const city = await City.query().findById(id);

        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }

        res.status(200).json(city);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

exports.getAllCities = async (req, res) => {

    try {
        const allcities = await City.query();

        res.status(200).json(allcities);

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }

}

// TODO : Update
// TODO : Delete