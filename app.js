const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const indexRouter = require('./src/index');
const cors = require("cors");

const corsOptions = {
    origin: '*',
    credentials: true, // access-control-allow-credentials:true
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json({ limit: '50mb' }));
app.use(cors(corsOptions));


// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const elapsed = Date.now() - start;
        let statusCodeColor;
        switch (Math.floor(res.statusCode / 100)) {
            case 2:
                statusCodeColor = '\x1b[32m'; // Green for 2xx status codes
                break;
            case 4:
                statusCodeColor = '\x1b[33m'; // Yellow for 4xx status codes
                break;
            case 5:
                statusCodeColor = '\x1b[31m'; // Red for 5xx status codes
                break;
            default:
                statusCodeColor = '\x1b[0m'; // Default color (reset)
        }
        console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${statusCodeColor}${res.statusCode}\x1b[0m ${elapsed} ms - -`);
    });
    next();
});

app.use('/garde/api', indexRouter);

module.exports = app;
