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
const moment_1 = __importDefault(require("moment"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mutation = {
    Mutation: {
        register(_, { user }, { db }) {
            return __awaiter(this, void 0, void 0, function* () {
                const lastUser = yield db.collection('users').find().limit(1).sort({ registerDate: -1 }).toArray();
                const existEmail = yield db.collection('users').findOne({ "email": user.email });
                if (existEmail !== null) {
                    return {
                        status: false,
                        message: `Este email ya fue registrado el día ${existEmail.registerDate}`,
                        user: null
                    };
                }
                if (lastUser.length === 0) {
                    user.id = 82394238492384;
                }
                else {
                    user.id = lastUser[0].id + 1;
                }
                user.password = bcryptjs_1.default.hashSync(user.password, 10);
                user.registerDate = String(moment_1.default().format('DD-MM-YYYY HH:mm'));
                return yield db.collection('users').insertOne(user)
                    .then((result) => {
                    return {
                        status: true,
                        message: `Usuario ${user.name} ${user.lastname} añadido correctamente`,
                        user
                    };
                })
                    .catch((error) => {
                    return {
                        status: false,
                        message: `Usuario NO añadido correctamente`,
                        user: null
                    };
                });
            });
        }
    }
};
exports.default = mutation;
