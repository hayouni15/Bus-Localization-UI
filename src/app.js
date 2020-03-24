const path = require('path')
const express = require('express')
const hbs = require('hbs')

const app = express()
const publicDirectoryPath = path.join(__dirname, '../public')
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(publicDirectoryPath))
app.use(express.json())
const partialsPath = path.join(__dirname, '../views/partials')
hbs.registerPartials(partialsPath)

const mysqlHost = process.env.MYSQL_HOST || 'localhost';
const mysqlUser = process.env.MYSQL_USER || 'root';
const mysqlPassword = process.env.MYSQL_PASSWORD || '';
const mysqlDatabase = process.env.MYSQL_DATABASE || 'BRITE';

//Mysql
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: mysqlHost,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase
});

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Brite'
    });
})

app.get('/index', (req, res) => {
    res.render('index', {
        title: 'Brite'
    });
})

// get the possible locations string from the database
app.get('/getPossibleLocations', (req, res) => {
    if (!connection._connectCalled) {
        connection.connect();
    }

    connection.query('SELECT * From possible_locations', function(error, results, fields) {
        if (error) throw error;
        console.log('Possible locations: ', results);
        res.send(results)
    });

})

// get all the anchors 
app.get('/getAnchors', (req, res) => {
    if (!connection._connectCalled) {
        connection.connect();
    }

    connection.query('SELECT * From anchors2', function(error, results, fields) {
        if (error) throw error;
        console.log('current position is: ', results);
        res.send(results)
    });

})

app.get('/getAnchorWithID/:id', (req, res) => {
    const _id = req.params.id // Access the id provided
    if (!connection._connectCalled) {
        connection.connect();
    }

    connection.query(`SELECT * From anchors2 where id = ${_id}`, function(error, results, fields) {
        if (error) throw error;
        console.log('current position is: ', results);
        res.send(results)
    });

})




// 1) Read GPS txt file for each route
// 2) Append each line of data to the array GPS 
// 3) Send the GPS array as a response when the route is requested
async function processFile(inputFile, callback) {
    var GPS = []
    var fs = require('fs'),
        readline = require('readline'),
        instream = fs.createReadStream(inputFile),
        outstream = new(require('stream'))(),
        rl = readline.createInterface(instream, outstream);

    await rl.on('line', function(line) {
        console.log(line);
        GPS.push(line)
    });

    rl.on('close', function(line) {
        console.log(line);
        console.log('done reading file.');
        callback(GPS)
    });


}
// return the GPS coordinates of truck 801
app.get('/801', async(req, res) => {

    processFile('All-gps-Data.txt', (GPS) => {
        res.send(GPS)
    });

})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('running on port ', port)
})
