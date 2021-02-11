"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const omron_fins_es6_1 = require("omron-fins-es6");
const mongoose_1 = __importDefault(require("mongoose"));
const config = __importStar(require("../config/config"));
const moment_1 = __importDefault(require("moment"));
const mailer_1 = __importDefault(require("../mailer"));
const chalk_1 = __importDefault(require("chalk"));
let cliente = new omron_fins_es6_1.FinsClient(9610, '10.10.10.10');
mongoose_1.default.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then(() => {
    console.log(chalk_1.default.greenBright('PLC CONNECT'));
})
    .catch((err) => {
    console.log('error: ', err);
    mailer_1.default('D00000', moment_1.default(), "Error al conectar la base de datos");
});
var db = mongoose_1.default.connection;
db.on('connecting', function () {
    console.log('connecting to MongoDB...');
});
db.on('error', function (error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose_1.default.disconnect();
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
    mongoose_1.default.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', { useNewUrlParser: true });
});
var Schema = mongoose_1.default.Schema;
var bugSchema = new Schema({
    codigo: String,
    fechaRegistro: String,
    temperatura: String
});
var ErrorSchema = mongoose_1.default.Schema;
var failSchema = new ErrorSchema({
    error: String,
    dm: String,
    fechaRegistro: String
});
var regFail = mongoose_1.default.model('errores', failSchema);
var reg = mongoose_1.default.model('temperaturas', bugSchema);
function readTemperature() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = config.default.config;
        data.map(element => {
            cliente.promiseRead(element.dm, 1)
                .then((data) => {
                let temp = data.response.values / 10;
                if (element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])) {
                    mailer_1.default(element.dm, moment_1.default().format('DD-MM-YYYY HH:mm:ss'), `${element.name} está fuera del rango ${element.range[0]} - ${element.range[1]}`);
                }
                var Inyection = new reg({
                    codigo: element.dm,
                    fechaRegistro: moment_1.default().format('DD-MM-YYYY HH:mm:ss'),
                    temperatura: String(data.response.values / 10)
                });
                Inyection.save((error, data) => {
                    if (error) {
                        mailer_1.default('No Inyected', moment_1.default(), error);
                    }
                });
            })
                .catch((error) => {
                console.log('error ', error);
                var errorInyection = new regFail({
                    dm: element.dm,
                    fechaRegistro: moment_1.default().format('DD-MM-YYYY HH:mm:ss'),
                    error: error
                });
                errorInyection.save((error, doc) => {
                    if (error) {
                        mailer_1.default('No se ha podido guardar el error en bbdd', moment_1.default(), error);
                    }
                    else {
                    }
                });
                mailer_1.default(element.dm, moment_1.default(), `Lectura incorrecta en la llamada: ${error}`);
            });
        });
    });
}
exports.default = readTemperature;
