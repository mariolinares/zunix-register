import schema from './schema';
import readTemperature from './plc'
import { FinsClient } from 'omron-fins-es6';
import mongoose from 'mongoose';
import * as config from './config/config';
import db from './db';
import moment from 'moment';
import sendMail from './mailer';
import chalk from 'chalk';





async function init() {
    

    let express = require('express')
    let app = express();

    let http = require('http');
    let server = http.Server(app);

    let socketIO = require('socket.io');
    let io = socketIO(server);

    const PORT = 3000;


    server.listen(
        { port: PORT },
        () => console.log(`Hola Mundo  http://localhost:${PORT}/`)
    );




    /**
     * 
     * CONEXIÓN BBDD
     * 
     */

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
     *  MODELO DE DATOS
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

    io.on('prueba', socket => {
        console.log('prueba: ', socket)
    })

    /**
     * 
     * LECTURA Y REGISTRO EN BBDD
     * 
     */
    
    setInterval(() => {
        let data = config.default.config;
    
        data.map((element, index) => {      
            cliente.promiseRead(element.dm, 1)
                .then((d) => {
                    let temp = d.response.values / 10;
                    console.log(temp)
                    
                    /* if(element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])){
                        sendMail(element.dm, moment().format('DD-MM-YYYY HH:mm:ss'), `${element.name} está fuera del rango ${element.range[0]} - ${element.range[1]}`)
                    }

                    db.collection.findOne('d2100').then(data => {
                        if(data === temp){
                            return
                        }
                    })
                    
                    var Inyection = new reg({
                        codigo: element.dm,
                        fechaRegistro: moment().format('DD-MM-YYYY HH:mm:ss'),
                        temperatura: String(d.response.values / 10)
                    });
    
                    Inyection.save((error, resp) => {
                        
                        if(index + 1 === data.length){
                            console.log('cuantas veces', index)
                            io.emit('new-message', `termino`);
                        }

                        if (error) {
                            sendMail('No Inyected', moment(), error)
                        } 
                    }) */

                    if(index + 1 === data.length){
                        console.log('-----------------------------')
                        
                    }
                    
                })
                .catch((error) => {
                    console.log('error ', error)
    
                    /* var errorInyection  = new regFail({
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
    
                    sendMail(element.dm, moment(), `Lectura incorrecta en la llamada: ${error}`); */
                })        
        })

        

        
       

    },4000)     
} 


    

    /* setInterval(() => {
        readTemperature()
    }, 10000); */


init()

