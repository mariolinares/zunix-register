import schema from './schema';
import readTemperature from './plc'
import { FinsClient } from 'omron-fins-es6';
import mongoose from 'mongoose';
import * as config from './config/config';
import db from './db';
import moment from 'moment';
import sendMail from './mailer';
import chalk from 'chalk';
import Database from './config/database';


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
    
    connectDatabase()
} 

async function connectDatabase(){
    const database = await new Database();
    database.init()
        .then(() => {
            readData()
        })
        .catch((err) => {
            console.log(err);
        });
}

async function readData(){
    const cliente = await new FinsClient(9610,'10.10.10.10');
        
    let data = config.default.config;
    
    data.map((element, index) => {      
        cliente.promiseRead(element.dm, 1)
            .then((d) => {
                let temp = d.response.values / 10;
                console.log(element.dm, temp)
                
                if(element.sendMail && element.range && (temp < element.range[0] || temp > element.range[1])){
                    //console.log(element)
                }


        })           
    })

    
}


init()