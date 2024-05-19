const db = require('../data/database')

class User {
    constructor(email, password){
        this.email = email;
        this.password = password;
    }

    async fetch () {
        const result = await db.getDb().collection("users").findOne({ email: this.email });
        return result;
    }

    async create () {
        const result = await db.getDb().collection("users").insertOne({email : this.email, password : this.password});
        return result;
    }
}



module.exports = User;