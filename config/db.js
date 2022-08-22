const mongoose = require('mongoose');

const connectWithDB = () => {
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("Connected TO DB"))
    .catch(error => {
        console.log("DB connection issue");
        console.log(error);
        process.exit(1);
    })
}

module.exports = connectWithDB;