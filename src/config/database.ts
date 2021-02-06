import { MongoClient } from "mongodb"
import chalk from 'chalk';

class Database {


    async init() {
        const MONGODB = String(process.env.DATABASE)
        const client = await MongoClient.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', { useNewUrlParser: true });

        const db = await client.db();

         

        return new Promise((resolve, reject) => {
            if( client.isConnected() ){
                console.log('=======DATABASE=======')
                console.log(`STATUS: ${chalk.greenBright('ONLINE')}`);
                console.log(`DATABASE: ${chalk.greenBright(db.databaseName)}`);
                
                resolve(db)
            } else {
                reject('Error al conectar la base de datos')
            }


            
        })
    }
}

export default Database