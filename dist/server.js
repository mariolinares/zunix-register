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
cliente.on('reply', function (msg) {
    console.log("Reply from: ", msg.remotehost);
    console.log("Transaction SID: ", msg.sid);
    console.log("Replying to issued command of: ", msg.command);
    console.log("Response code of: ", msg.code);
    console.log("Data returned: ", msg.values);
});
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
    fecha: String,
    hora: String,
    date: String,
    temperatura: Number,
    empresa: String
});
var ErrorSchema = mongoose.Schema;
var failSchema = new ErrorSchema({
    error: String,
    dm: String,
    fecha: String,
    hora: String,
    date: String,
    empresa: String
});
var regFail = mongoose.model('errores', failSchema);
var reg = mongoose.model('Temperatura', bugSchema);
function readTemperature(element) {
    return __awaiter(this, void 0, void 0, function* () {
        return cliente.promiseRead(element, 1);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let temperatura = yield readTemperature('D1100');
        console.log(temperatura);
    });
}
main();
