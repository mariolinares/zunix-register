"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constans_1 = require("../config/constans");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Jwt {
    constructor() {
        this.secretKey = constans_1.SECRET_KEY;
    }
    sign(data) {
        return jsonwebtoken_1.default.sign({ user: data.user }, this.secretKey, { expiresIn: 24 * 60 * 60 });
    }
    verify(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.secretKey);
        }
        catch (e) {
            return 'No autorizado. Por favor, inicia sesión';
        }
    }
}
exports.default = Jwt;
