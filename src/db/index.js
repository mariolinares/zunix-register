import * as mongoose from 'mongoose';

var db = mongoose.connection;

db.on('connecting', function() {
    console.log('connecting to MongoDB...');
});
  
db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
  
db.on('connected', function() {
    console.log('MongoDB connected!');
});
  
db.once('open', function() {
    console.log('MongoDB connection opened!');
});
  
db.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});

db.on('disconnected', function() {
    console.log('pasas por aqui al desconectar');
    console.log('MongoDB disconnected!');
    mongoose.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', {useNewUrlParser: true}, {server:{auto_reconnect:true}});
});
  
mongoose.connect('mongodb+srv://maco_user:Mario12345@cluster0.aim95.mongodb.net/zunix?retryWrites=true&w=majority', {useNewUrlParser: true}, {server:{auto_reconnect:true}});
  




export default db;