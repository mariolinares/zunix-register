import { IResolvers } from "graphql-tools";
import Jwt from "../lib/jwt";
import bcryptjs from 'bcryptjs';

const query : IResolvers = {
    Query : {
        async users(_: void, __:any, { db }): Promise<any> {
            return await db.collection('users').find().toArray()
        },
        async login(_: void, { email, password } , { db }): Promise<any> {

            const user = await db.collection('users').findOne({ email })

            if (user === null){
                return {
                    status: false,
                    message: "El usuario no existe. Compruebe de nuevo",
                    user: null
                }
            }

            if (!bcryptjs.compareSync(password, user.password)) {
                return {
                    status: false,
                    message: "Contraseña incorrecta",
                    user: null
                }
            }

            delete user.password;

            return {
                status: true,
                message: "Usuario logueado correctamente",
                token: new Jwt().sign({ user })
            }
            
        },
        async temperaturas(_: void, { codigo, temperatura, fechaRegistro }, { db }): Promise<any> {
                return await db.collection('temperaturas').find().filter().sort( { fechaRegistro: -1 } ).limit(12).toArray()
        },
        me(_: void, __:any , { token }) {
            let info: any = new Jwt().verify(token)

            if ( info === 'No autorizado. Por favor, inicia sesión' ) {
                return {
                    status: false,
                    message: info,
                    user: null
                }
            }
            return {
                status: true,
                message: 'Token correcto',
                user: info.user
            }
        }
    }
}

export default query;