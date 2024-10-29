<?php 
#TODO: USE CACHING! https://www.technouz.com/4429/simple-way-cache-mysql-query-results/
    $interval = $_POST["curr_timeframe"];


    $DB_HOST = '34.95.35.104';
    $DB_USERNAME = 'root';
    $DB_PASSWORD = 'musicfun';
    $DB_NAME = 'music';
    
    $mysqli = mysqli_init();
    $mysqli -> ssl_set("./ssl/client-key.pem", "./ssl/client-cert.pem", "./ssl/server-ca.pem", NULL, NULL);
    $mysqli -> real_connect($DB_HOST, $DB_USERNAME, $DB_PASSWORD, $DB_NAME, 3306, NULL, MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT);
    
    $prices = Array();
    $dates = Array();

    $sql = "SELECT price, DATE_FORMAT(date, '%m/%d') as date FROM prices WHERE date > CURDATE() - INTERVAL "; 
    $interval = "";
    if ($_POST["curr_timeframe"] == "1D") {$interval="1 WEEK";}
    else if ($_POST["curr_timeframe"] == "1W") {$interval="1 WEEK";}
    else if ($_POST["curr_timeframe"] == "1M") {$interval="1 MONTH";}
    else if ($_POST["curr_timeframe"] == "3M") {$interval="3 MONTH";}
    $sql = $sql.$interval." AND artistID='".$_POST["artistID"]."'";

 
    if ($result = $mysqli -> query($sql)) {
        while ($row = $result -> fetch_row()) {
            array_push($prices, $row[0]);
            array_push($dates, $row[1]);
        }
    }
    $data['prices'] = $prices;
    $data["dates"] = $dates;
    $data["change"] = $prices[count($prices) - 1] - $prices[0];
    echo json_encode($data);
    exit;
?>