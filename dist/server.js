"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const omron_fins_es6_1 = require("omron-fins-es6");
const config_1 = require("./config/config");
const mailer_1 = __importDefault(require("./mailer"));
const chalk_1 = __importDefault(require("chalk"));
const moment_1 = __importDefault(require("moment"));
let express = require('express');
let app = express();
let http = require('http');
let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
let mongoose = require('mongoose');
const PORT = 3001;
server.listen({ port: PORT }, () => console.log(`Hola Mundo  http://localhost:${PORT}/`));
let cliente = new omron_fins_es6_1.FinsClient(9610, '10.10.10.10');
mongoose.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then(() => {
    console.log(chalk_1.default.greenBright('PLC CONNECT'));
    readData();
})
    .catch((err) => {
    console.log('error: ', err);
    mailer_1.default('D00000', moment_1.default(), "Error al conectar la base de datos");
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
var Schema = mongoose.Schema;
var bugSchema = new Schema({
    codigo: String,
    fechaRegistro: String,
    temperatura: String,
    empresa: String
});
var ErrorSchema = mongoose.Schema;
var failSchema = new ErrorSchema({
    error: String,
    dm: String,
    fechaRegistro: String,
    empresa: String
});
var regFail = mongoose.model('errores', failSchema);
var reg = mongoose.model('Temperatura', bugSchema);
setInterval(() => {
    readData();
}, 60000);
function writeData() {
    return __awaiter(this, void 0, void 0, function* () {
        cliente.promiseWrite('AMACXASX:00', 0)
            .then(data => {
            console.log('darta: ', data);
        })
            .catch(err => console.log('error: ', err));
        cliente.promiseRead('H10:00', 1).then(d => console.log('H10:00 after write', d));
        cliente.promiseRead('H11:00', 1).then(d => console.log('H11:00 after write', d));
    });
}
function readData() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = config_1.config;
        data.map((element, index) => {
            cliente.promiseRead(element.dm, 1)
                .then((d) => {
                let temp;
                if (element.dm === 'H10:00') {
                    temp = d.response.values[0];
                }
                else {
                    temp = d.response.values / 10;
                }
                console.log('temp: ', temp);
                if (element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])) {
                    mailer_1.default(element.dm, moment_1.default().format('DD-MM-YYYY HH:mm:ss'), `${element.name} está fuera del rango ${element.range[0]} - ${element.range[1]}`);
                }
                var Inyection = new reg({
                    codigo: element.dm,
                    fechaRegistro: moment_1.default().unix(),
                    temperatura: String(temp),
                    empresa: 'Zunix'
                });
                Inyection.save((error, resp) => {
                    if (error) {
                        mailer_1.default('No Inyected', moment_1.default(), error);
                    }
                });
                if (index + 1 === data.length) {
                    console.log('-----------------------------');
                }
            })
                .catch((error) => {
                console.log('error ', error);
                var errorInyection = new regFail({
                    dm: element.dm,
                    fechaRegistro: moment_1.default().unix(),
                    error: error,
                    empresa: 'Zunix'
                });
                errorInyection.save((error, doc) => {
                    if (error) {
                        mailer_1.default('No se ha podido guardar el error en bbdd', moment_1.default(), error);
                    }
                });
                mailer_1.default(element.dm, moment_1.default(), `Lectura incorrecta en la llamada: ${error}`);
            });
        });
    });
}
