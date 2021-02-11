"use strict";
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
const jwt_1 = __importDefault(require("../lib/jwt"));
const query = {
    Query: {
        users(_, __, { db }) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield db.collection('users').find().toArray();
            });
        },
        login(_, { email, password }, { db }) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield db.collection('users').findOne({ email });
                if (user === null) {
                    return {
                        status: false,
                        message: "El usuario no existe. Compruebe de nuevo",
                        user: null
                    };
                }
                delete user.password;
                return {
                    status: true,
                    message: "Usuario logueado correctamente",
                    token: new jwt_1.default().sign({ user })
                };
            });
        },
        temperaturas(_, { codigo, temperatura, fechaRegistro }, { db }) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield db.collection('temperaturas').find().filter().sort({ fechaRegistro: -1 }).limit(12).toArray();
            });
        },
        me(_, __, { token }) {
            let info = new jwt_1.default().verify(token);
            if (info === 'No autorizado. Por favor, inicia sesión') {
                return {
                    status: false,
                    message: info,
                    user: null
                };
            }
            return {
                status: true,
                message: 'Token correcto',
                user: info.user
            };
        }
    }
};
exports.default = query;
