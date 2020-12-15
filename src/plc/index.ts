import { FinsClient } from 'omron-fins-es6';
import mongoose from 'mongoose';
import * as config from '../config/config';
import db from '../db';
import moment from 'moment';
import sendMail from '../mailer';
import chalk from 'chalk';

let cliente = new FinsClient(9610,'10.10.10.10');
mongoose.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority',  { useNewUrlParser: true })
        .then(() => {
            console.log(chalk.greenBright('PLC CONNECT'))
        })
        .catch((err) => {
            console.log('error: ', err);
            sendMail('D00000', moment(), "Error al conectar la base de datos")
        });

var db = mongoose.connection;

db.on('connecting', function() {
    console.log('connecting to MongoDB...');
});
  
db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
  
db.on('connected', function() {
    console.log('MongoDB connected!');
});
  
db.once('open', function() {
    console.log('MongoDB connection opened!');
});
  
db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});

db.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', {useNewUrlParser: true});
});


/**
 * 
 *  Modelo de datos
 * 
 */

var Schema = mongoose.Schema;
 
var bugSchema = new Schema({
     codigo: String,
     fechaRegistro: String,
     temperatura: String
});


var ErrorSchema = mongoose.Schema;

var failSchema = new ErrorSchema({
    error: String,
    dm: String,
    fechaRegistro: String
})

var regFail = mongoose.model('errores', failSchema);

var reg = mongoose.model('temperaturas', bugSchema);

/**
 * 
 * Lectura y registro en bbdd
 * 
 */


 

async function readTemperature(){
    
    

    
    let data = config.default.config;
    
   /*  var fn = function asyncFN(dm) {
        return cliente.promiseRead(dm, 1)
    }

    var actions = data.map((item) => {
        return fn(item.dm)
    })

    var results = Promise.all(actions);

    var tempera = []

    results
        .then(temp => {
            temp.map((t) => {
                let value = {
                    registro: t['address'],
                    temperatura: String(t['response'].values / 10),
                    fechaRegistro: moment().format('DD-MM-YYYY HH:mm:ss')
                }

                tempera.push(value)
            })

            console.log('tempera: ',  tempera)

        })
        .catch(error => {
            console.log('error: ', error)
        }) */


    data.map(element => {
        cliente.promiseRead(element.dm, 1)
            .then((data) => {
                let temp = data.response.values / 10;
                
                if(element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])){
                    sendMail(element.dm, moment().format('DD-MM-YYYY HH:mm:ss'), `${element.name} está fuera del rango ${element.range[0]} - ${element.range[1]}`)
                }

                
                var Inyection = new reg({
                    codigo: element.dm,
                    fechaRegistro: moment().format('DD-MM-YYYY HH:mm:ss'),
                    temperatura: String(data.response.values / 10)
                });

                Inyection.save((error, data) => {
                    if (error) {
                        sendMail('No Inyected', moment(), error)
                    } 
                })
                
            })
            .catch((error) => {
  
                console.log('error ', error)

                var errorInyection  = new regFail({
                    dm: element.dm,
                    fechaRegistro: moment().format('DD-MM-YYYY HH:mm:ss'),
                    error: error
                })

                errorInyection.save((error, doc) => {
                    
                    if (error) {
                        sendMail('No se ha podido guardar el error en bbdd', moment(), error)
                    } else {
                        
                    }
                })

                sendMail(element.dm, moment(), `Lectura incorrecta en la llamada: ${error}`);
            })
        })
}


export default readTemperature;
