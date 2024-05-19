const db = require('../data/database')
const bcrypt = require("bcrypt");


class User {
    constructor(email, password){
        this.email = email;
        this.password = password;
    }

    async userAlreadyExists() {
        const result = await db.getDb().collection("users").findOne({ email: this.email });
        if (result){
            this.hashedPassword = result.password
            return true;
        } else {
            return false;
        }
    }

    async create () {
        const hashedPassword = await bcrypt.hash(this.password, 12);
        const result = await db.getDb().collection("users").insertOne({email : this.email, password : hashedPassword});
        return result;
    }
    
    async checkPassword(){
        const result = await bcrypt.compare(
            this.password,
            this.hashedPassword
        );
        if (result){
            return true;
        } else {
            return false
        }
    }
}



module.exports = User;