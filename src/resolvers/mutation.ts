import { IResolvers } from "graphql-tools";
import moment from 'moment';
import bcryptjs from 'bcryptjs';

const mutation : IResolvers = {
    Mutation : {
        async register(_: void, { user }, { db }): Promise<any> {
            
            const lastUser = await db.collection('users').find().limit(1).sort({ registerDate: -1 }).toArray()

            const existEmail = await db.collection('users').findOne({"email": user.email})

            if(existEmail !== null){
                return {
                    status: false, 
                    message: `Este email ya fue registrado el día ${existEmail.registerDate}`,
                    user: null
                }
            }

            if(lastUser.length === 0){
                user.id = 82394238492384
            } else {
                user.id = lastUser[0].id + 1
            }

            user.password = bcryptjs.hashSync(user.password, 10)

            user.registerDate = String(moment().format('DD-MM-YYYY HH:mm'))

            return await db.collection('users').insertOne(user)
                .then((result:any) => {
                    return {
                        status: true,
                        message: `Usuario ${user.name} ${user.lastname} añadido correctamente`,
                        user
                    }
                })
                .catch((error: any) => {
                    return {
                        status: false,
                        message: `Usuario NO añadido correctamente`,
                        user: null
                    }
                })
        }
    }
}

export default mutation;