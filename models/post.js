const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId;
const db = require('../data/database')

class Post {
    constructor(title, content, id){
        this.title = title;
        this.content = content;
        if (id){
            this.id = new ObjectId(id)
        }
    }

    static async fetchall(){
        return await db.getDb().collection('posts').find().toArray()
    }

    async save (){
        let result;
        if (this.id){
            if (!this.id){
                return;
            }
            result = await db.getDb().collection('posts').updateOne({_id: this.id}, {$set: {title: this.title, content: this.content}})
            return;
        }
        result = await db.getDb().collection('posts').insertOne({title: this.title, content: this.content})
        return result;
    }

    async delete(){
        if (!this.id){
            return;
        }
        console.log(this.id)
        const result = await db.getDb().collection('posts').deleteOne({_id: this.id})
        return result
    }

    async fetch(){
        if (!this.id){
            return;
        }
        const result = await db.getDb().collection('posts').findOne({_id: this.id})
        if (result){
            this.title = result.title;
            this.content = result.content;
        }
        return result;
    }
}

module.exports = Post;