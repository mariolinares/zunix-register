import chalk from 'chalk';
const mongoose = require('mongoose');
const URL = 'mongodb+srv://maco_user:Mario12345@cluster0.6vlmw.mongodb.net/zunix?retryWrites=true&w=majority';

let db = mongoose.connection;
db.on('disconnected', function () {
    console.log(`${chalk.redBright('DB DISCONNECTED')}`);

});

db.on('connecting', function () {
    console.log(`${chalk.yellowBright('Connecting...')}`);
});

class Database {

    async init() {
        return mongoose.connect(URL, { useNewUrlParser: true })
            .then(() => {
                console.log(`${chalk.greenBright('ONLINE')}`);

            })
            .catch((err) => {
                console.log(`${chalk.redBright('OFFLINE')}`);
                console.log('error: ', err);
            });
    }

    async close() {
        mongoose.disconnect()
    }
}

export default Database