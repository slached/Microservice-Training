require("dotenv").config()

const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const cors  = require('cors');

const { products } = require('./api');
const HandleErrors = require('./utils/error-handler')

const StartServer = async() => {

    const app = express();
    
    await databaseConnection();
    
    app.use(express.json({ limit: '1mb'}));
    app.use(express.urlencoded({ extended: true, limit: '1mb'}));
    app.use(cors());
    app.use(express.static(__dirname + '/public'))

    //api
    products(app);
    
    // error handling
    app.use(HandleErrors);

    app.listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    })
}

StartServer();