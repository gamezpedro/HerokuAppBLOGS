let mongoose = require('mongoose');

let blogSchema = mongoose.Schema({
    title : {type : String},
    author : {type : String},
    content : {type : String},
    date : {type : String},
    id : {type : Number, required : true, unique: true}
});

let BlogMod = mongoose.model('blog', blogSchema);

let BlogList = {
    getAll: function(){
        return BlogMod.find()
        .then(blog => {
            return blog;
        })
        .catch(err => {
            throw Error(err);
        });
    },

    create : function( newblog ) {
        return BlogMod.create( newblog )
        .then(blog => {
            return blog;
        })
        .catch(err => {
            throw Error(err);
        });
    },

    getByAuthor: function(autor) {
        return BlogMod.find({ autor })
        .then(blog => {
            return blog;
        })
        .catch(err => {
            throw Error(err);
        });
    },


    update: function(id, update) {
        return BlogMod.findByIdAndUpdate(id, update, { new: true })
       .then(newObject => {
            return newObject;
       })
       .catch(err => {
            throw Error(err);
       });
    },

    delete: function(id) {
        return BlogMod.findByIdAndDelete(id)
        .then(blog => {
            return blog
        })
        .catch(err => {
            throw Error(err);
        });
    },
}

module.exports = { BlogList };