const nodemailer = require("nodemailer");
import { userMail } from '../config/config';

async function sendMail(codigo, fechaRegistro, mensaje, name?) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "mariolinares1984@gmail.com", // generated ethereal user
        pass: "Mario7241370", // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `Zunix Alertas Temperatura`, // sender address
      to: userMail, // list of receivers
      subject: `${mensaje} en ${codigo}`, // Subject line
      text: `${mensaje} en ${codigo}`, // plain text body
      html: ` <img src="https://zunix.es/images/2020/06/04/logo.png" />
              <h2> Registro: ${codigo} </h2> 
              <p> Fecha: ${fechaRegistro} </p>
              <p> Mensaje: ${mensaje} </p> `, // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

export default sendMail;