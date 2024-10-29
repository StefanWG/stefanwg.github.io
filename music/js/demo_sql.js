var mysql = require('mysql');
var fs = require('fs');

function getArtistChartData() {
    var con = mysql.createConnection({
        host: "34.95.35.104",
        user: "root",
        password: "musicfun",
        database: "music",
        ssl: {
            ca: fs.readFileSync(__dirname + '/../ssl/server-ca.pem'),
            key: fs.readFileSync(__dirname + '/../ssl/client-key.pem'),
            cert: fs.readFileSync(__dirname + '/../ssl/client-cert.pem')
        }
    });
      
    con.connect(function(err) {
        if (err) throw err;
    });
    var sql = 'SELECT price, DATE_FORMAT(date, "%m/%d/%Y") as date FROM prices WHERE date > CURDATE() - INTERVAL 1 WEEK';
      
    con.query(sql, function(error, results, fields) {
        if (error) throw error;
        const prices = []
        const dates = []
        console.log(fields)
        for (var i = 0; i < results.length; i++) {
            prices.push(results[i].price)
            let date = results[i].date
            dates.push(date.substring(0, date.length - 5))
        }
        // console.log(prices)
        // console.log(dates)
    });

    return prices;
}

console.log(getArtistChartData())