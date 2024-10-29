<?php 
  session_start() ;
  if (empty($_SESSION["username"])) {
    header("Location: login.php");
  }
?>
<html>
  <head>
    <title>MusicStonks</title>
    <script type="text/javascript" src= "js/chart.min.js"></script>
    <link rel="apple-touch-icon" sizes="180x180" href="icon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
    <style>
        <?php include 'css/menu.css'; ?>
        <?php include 'css/home.css'; ?>
        <?php include 'utils.php'; ?>

        #container {
                display: inline-block;
                width: 90%;
        }
        table {
            border-collapse: collapse;
            font-family: Tahoma, Geneva, sans-serif;
            margin-top: 20px;
            /* height:90%; */
            width: 500px;
            float:left;
        }
        table td {
            padding-left: 9px;
            padding-right: 9px;
            padding-top: 3px;
            padding-bottom: 3px;
        }
        table thead td {
            background-color: #54585d;
            color: #ffffff;
            font-weight: bold;
            font-size: 13px;
            padding: 9px;
            border: 1px solid #54585d;
        }

        .scrollable {
            overflow: scroll;
            height: 200px;
        }

        table tbody td {
            color: #636363;
            border: 1px solid #dddfe1;
            font-size: 15;
        }
        table tbody tr {
            background-color: #f9fafb;
        }
        table tbody tr:nth-child(odd) {
            background-color: #ffffff;
        }
        table tbody td.genres {
            font-size: 10px;
        }

        form {
            background-color: green;
            float:right;
        }
    </style>
  </head>
  <body>
    <div>
      <?php includeMenu("search")?>
    </div>

    <div id="container">
        <table>
            <thead>
                <tr>
                    <td width=25%>Artist</td>
                    <td width=25%>Genres</td>
                    <td width=25%>Price</td>
                    <td width=25%>Popularity</td>
                </tr>
            </thead>
            <tbody>
                <tr><td colspan="4">
                <div class="scrollable"><table>
                <?php 
                // Get Data TODO: MOVE TO ANOTHER FILE
                $DB_HOST = '34.95.35.104';
                $DB_USERNAME = 'root';
                $DB_PASSWORD = 'musicfun';
                $DB_NAME = 'music';

                $mysqli = mysqli_init();
                $mysqli -> ssl_set("./ssl/client-key.pem", "./ssl/client-cert.pem", "./ssl/server-ca.pem", NULL, NULL);
                $mysqli -> real_connect($DB_HOST, $DB_USERNAME, $DB_PASSWORD, $DB_NAME, 3306, NULL, MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT);
                $sql = <<<eod
                SELECT a.artistID, a.artistName, a.popularity, a.genres, d.price from
                artists a 
                INNER JOIN(
                        (SELECT b.artistID, b.price FROM 
                        prices b
                        INNER JOIN (select artistID, max(date) as maxdate FROM prices GROUP BY artistID) as c ON
                        b.artistID = c.artistID AND b.date = c.maxdate)) as d on
                        a.artistID = d.artistID
                ORDER BY price DESC
                eod;
                // $sql = "SELECT artistID, artistName, popularity, genres FROM artists ORDER BY popularity DESC";
                if ($result = $mysqli -> query($sql)) {
                    while($row = $result -> fetch_row()) {
                        echo "<tr>";
                        echo "<td width=25%><a href='/artist.php?id=".$row[0]."'>".$row[1]."</a></td>";
                        echo "<td width=25% class='genres'>".mb_convert_case(str_replace("**", ", ", $row[3]), 2, "UTF-8")."</td>";
                        echo "<td width=25%>".$row[4]."</td>";
                        echo "<td width=25%>".$row[2]."</td></tr>";
                    }
                }
                ?>
                </table></div>
                </td></tr>
            </tbody>
 
        </table>
        <form>
            <!-- TODO use php to get list of genres -->
            <input type="checkbox" id="genre1" name="genre1" value="Latin">
            <label for="genre1">Latin</label><br>
        </form>
    </div>
  </body>
</html>