"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
function sendMail(codigo, fechaRegistro, mensaje) {
    return __awaiter(this, void 0, void 0, function* () {
        let testAccount = yield nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "mariolinares1984@gmail.com",
                pass: "Mario7241370",
            },
        });
        let info = yield transporter.sendMail({
            from: '"Zunix Alertas" <mariolinares1984@gmail.com>',
            to: "mariolinaresparra@icloud.com",
            subject: `${mensaje} en ${codigo}`,
            text: `${mensaje} en ${codigo}`,
            html: ` <img src="https://zunix.es/images/2020/06/04/logo.png" />
              <h2> Registro: ${codigo} </h2> 
              <p> Fecha: ${fechaRegistro} </p>
              <p> Mensaje: ${mensaje} </p> `,
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    });
}
exports.default = sendMail;
