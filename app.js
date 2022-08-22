const express = require('express');
const  morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

require('dotenv').config();

// loading swagger.yaml file
const swaggerDocument = YAML.load('swagger.yaml');

// import all route here
const home = require('./routes/homeRoutes');
const user = require('./routes/userRoutes');
const product = require('./routes/productRoutes');
const payment = require('./routes/paymentRoute')
const order = require('./routes/orderRoutes');

// creating express app
const app = express();

// for temp check
app.set('view engine', 'ejs');

// swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// morgan middleware
app.use(morgan("tiny"));

// regular middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// cookie and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// router middleware
app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);
app.use("/api/v1/payment", payment);
app.use("/api/v1", order)

app.get("/signuptest", (req, res) => {
    res.render("signuptest")
})

// export app js
module.exports = app;