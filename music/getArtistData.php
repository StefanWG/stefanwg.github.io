<?php 
#TODO: CACHE
function getArtistData($artistID) {
    $DB_HOST = '34.95.35.104';
    $DB_USERNAME = 'root';
    $DB_PASSWORD = 'musicfun';
    $DB_NAME = 'music';
    
    $mysqli = mysqli_init();
    $mysqli -> ssl_set("./ssl/client-key.pem", "./ssl/client-cert.pem", "./ssl/server-ca.pem", NULL, NULL);
    $mysqli -> real_connect($DB_HOST, $DB_USERNAME, $DB_PASSWORD, $DB_NAME, 3306, NULL, MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT);
    $res = getName_Image($artistID, $mysqli);
    $data["price"] = getPrice($artistID, $mysqli);
    $data["name"] = $res[0];
    $data["imageUrl"] = $res[1];
    $data["genres"] = mb_convert_case(str_replace("**", ", ", $res[2]), MB_CASE_TITLE, "UTF-8");
    // $myfile = fopen("testfile.txt", "w");
    // fwrite($myfile, $data["name"]);
    // fwrite($myfile, $data["price"]);

    return $data;
}

function getPrice($artistID, $mysqli) {
    $sql = "SELECT price FROM prices WHERE artistID='".$artistID."' ORDER BY date DESC LIMIT 1";
    if ($result = $mysqli -> query($sql)) {
        $row = $result -> fetch_row();
        if ($row) {
            return $row[0];
        }
    }
}

function getName_Image($artistID, $mysqli) {
    $sql = "SELECT artistName, imageUrl, genres FROM artists WHERE artistID='".$artistID."'LIMIT 1";
    if ($result = $mysqli -> query($sql)) {
        $row = $result -> fetch_row();
        if ($row) {
            return $row;
        }
    }
}

?>
