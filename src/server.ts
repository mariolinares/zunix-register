import { FinsClient } from 'omron-fins-es6';
import { config, registerTime } from './config/config';
import sendMail from './mailer';
import moment from 'moment'
import Database from './config/database';
import { reg, regFail } from './schemas/';
import chalk from 'chalk';

let express = require('express')
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);
//let moment = require('moment');

const PORT = 3001;


server.listen(
    { port: PORT },
    () => {
        console.log(`Server was created http://localhost:${PORT}/`)
    }
);


/************************************************/


let cliente = new FinsClient(9610, '10.10.10.10');

async function readTemperature(element) {
    return cliente.promiseRead(element, 1)
}

async function main() {
    let database = new Database();
    let db = await database.init();
    let index = 0

    for (const file of config) {
        index++
        try {
            let temperatura = await readTemperature(file.dm)
            let temp = temperatura['response']['values'] / 10;
            
            if(checkRanges(file, temp)){
                console.log('file: ', file, temp)
                //await sendMail(file.dm, moment().format('DD-MM-YYYY HH:mm:ss'), `${file.name} está fuera del rango ${file.range[0]} - ${file.range[1]}`)
            }
            // Save Register
            await createRegister(file, temp)

            if (index === config.length) {
                setTimeout(() => {
                    console.log(chalk.green('All registers was completed'))
                    database.close().then(() => {
                        database = null
                    });
                }, 1000);
            }
        } catch (ex) {
            await createRegisterError(file, ex)
        }
    }
}

async function createRegister(element, temp) {
    var Inyection = new reg({
        codigo: element.dm,
        fecha: moment().format('DD-MM-YYYY'),
        hora: moment().format('HH:mm:ss'),
        date: moment(),
        temperatura: String(temp),
        empresa: 'Zunix'
    });

    Inyection.save((error, resp) => {
        if (error) {
            console.log('Error al guardar datos');
        }
        //console.log(Inyection)
    })
}

async function createRegisterError(element, error) {
    var injectionError = new regFail({
        dm: element.dm,
        fecha: moment().format('DD-MM-YYYY'),
        hora: moment().format('HH:mm:ss'),
        date: moment(),
        error: error,
        empresa: 'Zunix'
    })

    injectionError.save((error, doc) => {
        if (error) {
            //sendMail('No se ha podido guardar el error en bbdd', moment(), error)
        }
        console.log('Error guardado en base de datos', injectionError);
    })
}

function checkRanges(element, temp) {
    if (element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])) {
        return true;
    }
    return false
}


setInterval(() => {
    main()
}, registerTime);

// async function readData() {
//     let data = config;
//     data.map((element, index) => {
//         cliente.promiseRead(element.dm, 1)
//             .then((d) => {
//                 let temp;

//                 if(element.dm === 'H10:00'){
//                     temp = d.response.values[0];
//                 } else {
//                     temp = d.response.values / 10;
//                 }

//                 /* if (element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])) {
//                     sendMail(element.dm, moment().format('DD-MM-YYYY HH:mm:ss'), `${element.name} está fuera del rango ${element.range[0]} - ${element.range[1]}`)
//                 }

//                 var Inyection = new reg({
//                     codigo: element.dm,
//                     fecha:  moment().format('DD-MM-YYYY'),
//                     hora: moment().format('HH:mm:ss'),
//                     date: moment(),
//                     temperatura: String(temp),
//                     empresa: 'Zunix'
//                 });                

//                 Inyection.save((error, resp) => {
//                     if (error) {
//                         sendMail('No Inyected', moment(), error)
//                     }
//                 })

//                 if (index + 1 === data.length) {
//                     console.log('-----------------------------')
//                 } */

//             })
//             .catch((error) => {
//                 console.log('error ', error)

//                 var errorInyection = new regFail({
//                     dm: element.dm,
//                     fecha:  moment().format('DD-MM-YYYY'),
//                     hora: moment().format('HH:mm:ss'), 
//                     date: moment(),
//                     error: error,
//                     empresa: 'Zunix'
//                 })

//                 errorInyection.save((error, doc) => {
//                     if (error) {
//                         sendMail('No se ha podido guardar el error en bbdd', moment(), error)
//                     }
//                 })

//                 sendMail(element.dm, moment(), `Lectura incorrecta en la llamada: ${error}`);
//             })
//     })
// }