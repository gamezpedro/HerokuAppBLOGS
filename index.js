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
    BlogList.getAll()
        .then(blogs =>{
            res.status(200).json(blogs)
        })
        .catch( error => {
			res.statusMessage = "Can't Access Database";
			return res.status( 500 ).send();
		});
});

app.get( '/blog-api/comentarios-por-autor', (req, res) =>{
    //Gets all the Blogs
    let author = req.query.author;
    if(!author){
        res.statusMessage = "Author is Missing in Field";
        return res.status(406).send();
    }
    BlogList.getByAuthor(author)
		.then( blogs => {
			return res.status( 200 ).json( blogs );
		})
		.catch( error => {
			res.statusMessage = "Can't Access Database";
			return res.status( 500 ).send();
		});
});


app.post('/blog-api/nuevo-comentario', jsonParser, (req, res) => {

    let title = req.body.title;
    let author = req.body.author;
    let content = req.body.content;

    console.log(title);
    console.log(author);
    console.log(content);


    if(!title || !content || !author){
        res.statusMessage = "There is a Missing Field in body";
        return res.status(406).send();
    }
    let newblog = {
        title,
        content,
        author,
        date,
        _id: uuid.v4()
     };
     
    BlogList.create(newblog)
        .then(_response => {
            res.status(201).json(newblog);
        })
        .catch(err => {
            res.statusMessage = "Something went wrong with the Database";
            return res.status(501).send();
        });
});



app.delete( '/blog-api/remover-comentario/:id', (req, res) => {
    let filter = req.params.id;
    if(!filter){
        res.statusMessage = "Missing id";
        return res.status(404).send()
    }
    BlogList.delete(filter)
       .then(deleted => {
           res.status(204).json({});
       })
       .catch(err => {
           res.statusMessage = "Missing field in body";
           return res.status(404).json();
       });
});


app.put( '/blog-api/actualizar-comentario/:id', jsonParser, (req, res) => {
    let filter = req.params.id;
    let title = req.params.title;
    let content = req.params.content;
    let author = req.params.author;
    let date = req.params.date;

    let id = req.body.id;
    if(!filter || !req.body){
        res.statusMessage = "There is no ID in Field";
        return res.status(406).send();
    }
    if(id !== filter){
        res.statusMessage = "Provided Id is not correct";
        return res.status(409).send();
    }
    
    const newO = {
        ...(title && { title }),
        ...(content && { content }),
        ...(author && { author }),
        ...(date && { date })
    };

    BlogList.update(id, newO)
       .then(blog => {
           if(blog){
            res.status(202).json(blog);
           }
       })
       .catch(err => {
           res.statusMessage = "We have encountered Server Problems";
           return res.status(500).send();
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