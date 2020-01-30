let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let blogSchema = mongoose.Schema({
    title : {type : String},
    author : {type : String},
    content : {type : String},
    date : {type : String},
    id : {type : Number, required : true, unique: true}
});

let Blog = mongoose.model('Blog', blogSchema);

let BlogList = {
    get : function(){
		return Blog.find()
				.then( blogs => {
					return blogs;
				})
				.catch( error => {
					throw Error( error );
				});
	},
    post : function(newBlog){
        return Blog.create(newBlog)
                .then( blog => {
                    return blog;
                })
                .catch( err=> {
                    throw Error(err);   
                });
    },
    put : function(filter, updInfo){
        return Blog.updateOne(filter, updInfo)
                .then( blog => {
                    return blog;
                })
                .catch( err=> {
                    throw Error(err);   
                });
    },
    delete :  function(filter){
        return Blog.deleteOne(filter)
            .then( blog => {
                return blog;
            })
            .catch( err=> {
                throw Error(err);   
            });
    }
}

module.exports = { BlogList };