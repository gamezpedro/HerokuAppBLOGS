let express = require ('express');
let morgan = require ('morgan');
let uuid = require('uuid/v4');
let mongoose = require('mongoose');

let {BlogList} = require('./model.js');
let {DATABASE_URL, PORT} = require('./config');

let app = express();
let bodyParser = require( "body-parser" );
let jsonParser = bodyParser.json();

app.use(express.static('public'));
app.use( morgan( 'dev' ) );

//Es para habilitar los CORs y permitir que otras personas accedan al servidor
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
});

/*
let blogs = [
    {
        id : uuid(),
        title : "Title#1",
        content : "content#1",
        author : "author#1",
        date : new Date('December 23, 1997 04:20:00')
    },
    {
        id : uuid(),
        title : "Title#2",
        content : "content#2",
        author : "author#2",
        date : new Date('December 24, 1997 04:20:00')
    },
    {
        id : uuid(),
        title : "b#3",
        content : "content#3",
        author : "author#3",
        date : new Date('December 25, 1997 04:20:00')
    },
];
*/


app.get( '/blog-api/comentarios', (req, res) =>{
    //Gets all the Blogs
    BlogList.get()
		.then( blogs => {
			return res.status( 200 ).json( blogs );
		})
		.catch( error => {
			res.statusMessage = "Can't Access Database";
			return res.status( 500 ).json({
				status : 500,
				message : "Can't Access Database"
			})
		});
});


app.post('/blog-api/nuevo-comentario', jsonParser, (req, res) => {

    let title = req.body.title;
    let author = req.body.author;
    let content = req.body.content;
    let date = req.body.date;
    let id = req.body.id;

    if(!title || !content || !id){
        res.statusMessage = "There is a Missing Field in body";
        return res.status(406).json({
            "error" : "Missing field",
            "status" : 406
        });
    }
    let newBlog = {
        title,
        content,
        author,
        date,
        id
     };
    BlogList.post(newBlog)
        .then(blog => {
            res.status(201).json(blog);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the Database";
            return res.status(501).json({
                "error" : "Something went wrong with the Database",
                "status" : 501
            });
        });
});



app.delete( '/blog-api/remover-comentario/:id', (req, res) => {
    let filter = req.params.id;
    if(!filter){
        res.statusMessage = "Missing id";
        return res.status(406).json({
           "error" : "Missing id",
           "status" : 406
       });
    }
    BlogList.delete({ id : filter })
       .then(blog => {
           res.status(201).json(blog);
       })
       .catch(err => {
           res.statusMessage = "Missing field in body";
           return res.status(500).json({
               "error" : "Something went wrong with the data base",
               "status" : 500
           });
       });
});


app.put( '/blog-api/actualizar-comentario/:id', jsonParser, (req, res) => {
    let filter = req.params.id;
    if(!filter || !req.body){
        res.statusMessage = "There is no ID in Field";
        return res.status(406).json({
           "error" : "Missing ID",
           "status" : 406
       });
    }
    BlogList.put({ id : filter }, req.body)
       .then(blog => {
           res.status(201).json(blog);
       })
       .catch(err => {
           res.statusMessage = "Missing field in body";
           return res.status(500).json({
               "error" : "Something went wrong with the data base",
               "status" : 500
           });
       });
});

let server;

function runServer(port, databaseUrl){
	return new Promise( (resolve, reject ) => {
		mongoose.connect(databaseUrl, response => {
			if ( response ){
				return reject(response);
			}
			else{
				server = app.listen(port, () => {
					console.log( "App is running on port " + port );
					resolve();
				})
				.on( 'error', err => {
					mongoose.disconnect();
					return reject(err);
				})
			}
		});
	});
}

function closeServer(){
	return mongoose.disconnect()
		.then(() => {
			return new Promise((resolve, reject) => {
				console.log('Closing the server');
				server.close( err => {
					if (err){
						return reject(err);
					}
					else{
						resolve();
					}
				});
			});
		});
}
runServer( PORT, DATABASE_URL );

module.exports = { app, runServer, closeServer }