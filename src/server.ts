import { FinsClient } from 'omron-fins-es6';
import { config } from './config/config';
import sendMail from './mailer';
import chalk from 'chalk';
import moment from 'moment'


let express = require('express')
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);
//let moment = require('moment');
let mongoose = require('mongoose');

const PORT = 3001;


server.listen(
    { port: PORT },
    () => console.log(`Hola Mundo  http://localhost:${PORT}/`)
);


/**
 * 
 * CONEXIÓN BBDD
 * 
 */

let cliente = new FinsClient(9610, '10.10.10.10');
mongoose.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then(() => {
        console.log(chalk.greenBright('PLC CONNECT'))

        readData();
    })
    .catch((err) => {
        console.log('error: ', err);
        sendMail('D00000', moment(), "Error al conectar la base de datos")
    });

var db = mongoose.connection;

db.on('connecting', function () {
    console.log('connecting to MongoDB...');
});

db.on('error', function (error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});

db.on('connected', function () {
    console.log('MongoDB connected!');
});

db.once('open', function () {
    console.log('MongoDB connection opened!');
});

db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});

db.on('disconnected', function () {
    console.log('MongoDB disconnected!');
    mongoose.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', { useNewUrlParser: true });
});




/**
 * 
 *  MODELO DE DATOS
 * 
 */

var Schema = mongoose.Schema;

var bugSchema = new Schema({
    codigo: String,
    fecha: String,
    hora: String,
    temperatura: String,
    empresa: String
});


var ErrorSchema = mongoose.Schema;

var failSchema = new ErrorSchema({
    error: String,
    dm: String,
    fecha: String,
    hora: String,
    empresa: String
})

var regFail = mongoose.model('errores', failSchema);

var reg = mongoose.model('Temperatura', bugSchema);


/**
 * 
 * LECTURA Y REGISTRO EN BBDD
 * 
 */

// readData()

setInterval(() => {
    readData()
}, 60000)


async function writeData() {
    cliente.promiseWrite('AMACXASX:00', 0)
        .then(data => {
            console.log('darta: ', data);
        })
        .catch(err => console.log('error: ', err)
        )
    cliente.promiseRead('H10:00', 1).then(d => console.log('H10:00 after write', d))
    cliente.promiseRead('H11:00', 1).then(d => console.log('H11:00 after write', d))

}

async function readData() {
    let data = config;

    data.map((element, index) => {
        cliente.promiseRead(element.dm, 1)
            .then((d) => {
                let temp;

                if(element.dm === 'H10:00'){
                    temp = d.response.values[0];
                } else {
                    temp = d.response.values / 10;
                }
                console.log('temp: ', temp);
                
                if (element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])) {
                    sendMail(element.dm, moment().format('DD-MM-YYYY HH:mm:ss'), `${element.name} está fuera del rango ${element.range[0]} - ${element.range[1]}`)
                }

                var Inyection = new reg({
                    codigo: element.dm,
                    fecha:  moment().format('DD-MM-YYYY'),
                    hora: moment().format('HH:mm:ss'),
                    temperatura: String(temp),
                    empresa: 'Zunix'
                });

                Inyection.save((error, resp) => {
                    if (error) {
                        sendMail('No Inyected', moment(), error)
                    }
                })

                if (index + 1 === data.length) {
                    console.log('-----------------------------')
                }

            })
            .catch((error) => {
                console.log('error ', error)

                var errorInyection = new regFail({
                    dm: element.dm,
                    fecha:  moment().format('DD-MM-YYYY'),
                    hora: moment().format('HH:mm:ss'),                    error: error,
                    empresa: 'Zunix'
                })

                errorInyection.save((error, doc) => {
                    if (error) {
                        sendMail('No se ha podido guardar el error en bbdd', moment(), error)
                    }
                })

                sendMail(element.dm, moment(), `Lectura incorrecta en la llamada: ${error}`);
            })
    })
}