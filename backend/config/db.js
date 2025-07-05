const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // à adapter
  database: 'bibliotheque'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connecté à la base de données MySQL!');
});

module.exports = db;
