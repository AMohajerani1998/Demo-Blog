const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient;

let database;
async function connect(){
    const client = await mongoClient.connect('mongodb://localhost:27017')
    database = client.db('final-blog')
}

function getDb(){
    if (!database){
        throw {message: 'database connection not established!'}
    }
    return database;
}

module.exports = {
    connectToDatabase:connect,
    getDb:getDb,
}