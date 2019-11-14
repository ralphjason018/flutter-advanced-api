var http = require("http");
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');

//start mysql connection
var connection = mysql.createConnection({
  host: '172.16.3.189', //mysql database host name
  user: 'root', //mysql database user name
  password: 'toor', //mysql database password
  database: 'doh_workshop' //mysql database name
});

connection.connect(function (err) {
  if (err) throw err
  console.log('You are now connected with mysql database...')
})
//end mysql connection

//start body-parser configuration
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
//end body-parser configuration

//create app server
var server = app.listen(process.env.PORT || 5000, "0.0.0.0", function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});

app.get('/', function (req, res) {
  res.send({
    app: 'doh-api'
  });
});

app.get('/auth', function (req, res) {
  const {
    email,
    pass
  } = req.query

  let emailResponse = null
  let passwordResponse = null

  connection.query(`SELECT email from patients WHERE email='${email}'`, (error, result, fields) => {
    if (error) throw error;
    emailResponse = result
    connection.query(`SELECT password from patients WHERE password=sha('${pass}')`, (error, result, fields) => {
      if (error) throw error;
      passwordResponse = result
      // res.send({
      //   result: {result:{emailResponse, passwordResponse}, validation: (Object.keys(emailResponse).length == 1 && Object.keys(passwordResponse).length == 1)}
      // })
      res.send({
        result: {
          validation: (Object.keys(emailResponse).length == 1 && Object.keys(passwordResponse).length == 1)
        }
      })

      // beb0427
    })
  })

});


//rest api to get all patients
app.get('/patients', function (req, res) {
  connection.query('select * from patients', function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});
//rest api to get a single patients data
app.get('/patients/:id', function (req, res) {
  connection.query('select * from patients where Id=?', [req.params.id], function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

//rest api to create a new patients record into mysql database
app.post('/patients', function (req, res) {
  var params = req.body;
  console.log(params);
  connection.query('INSERT INTO patients SET ?', params, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

//rest api to update record into mysql database
app.put('/patients', function (req, res) {
  connection.query('UPDATE `patients` SET `Name`=?,`Address`=?,`Country`=?,`Phone`=? where `Id`=?', [req.body.Name, req.body.Address, req.body.Country, req.body.Phone, req.body.Id], function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
});

//rest api to delete record from mysql database
app.delete('/patients', function (req, res) {
  console.log(req.body);
  connection.query('DELETE FROM `patients` WHERE `Id`=?', [req.body.Id], function (error, results, fields) {
    if (error) throw error;
    res.send('Record has been deleted!');
  });
});
