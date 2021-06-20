let mongoose = require('mongoose');

var Schema = mongoose.Schema;

var bugSchema = new Schema({
    codigo: String,
    fecha: String,
    hora: String,
    date: String,
    temperatura: Number,
    empresa: String
});

var ErrorSchema = mongoose.Schema;

var failSchema = new ErrorSchema({
    error: String,
    dm: String,
    fecha: String,
    hora: String,
    date: String,
    empresa: String
})

export var regFail = mongoose.model('errores', failSchema);
export var reg = mongoose.model('Temperatura', bugSchema);
