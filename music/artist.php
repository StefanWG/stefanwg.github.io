<?php 
    setcookie("curr_timeframe", "1D", time()+86400, "/");
    session_start();
    if (empty($_GET["id"])) {
        header("Location: home.php");
    }
    include("getArtistData.php");
    $artistData = getArtistData($_GET["id"]);
?>
<script>console.log(<?= json_encode($artistData["genres"])?>)</script>
<html>
    <head>
        <title>MusicStonks</title>
        <script type="text/javascript" src= "js/chart.min.js"></script>
        <script type="text/javascript" src="js/jquery.min.js"></script>

        <link rel="apple-touch-icon" sizes="180x180" href="icon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
        <style>
            <?php include 'css/menu.css'; ?>
            <?php include 'css/graph.css'; ?>
            <?php include 'utils.php'; ?>
        </style>
  </head>
  <body>

    <div>
        <?php includeMenu("artist")?>
    </div>
    <div id="container">
        <div id="bio">
            <img id="artist-img" src=<?= $artistData["imageUrl"]?>>
            <div id="text">
                <h1 id="name"><?= $artistData["name"]?></h1>
                <h3 id="genres"><?= $artistData["genres"]?></h1>
            </div>
            <div id="price-container">
                <img id="price-change-img" src="none.png">
                <h1 id="price">$<?= $artistData["price"]?></h1>
            </div>
        </div>
        <div id="graph-container">
            <canvas id="graph-canvas"></canvas>
            <div id="graph-buttons">
                <button id="1D" class="active graph-button" onclick="buttonClicked(this)">1D</button>
                <button id="1W" class="graph-button" onclick="buttonClicked(this)">1W</button>
                <button id="1M" class="graph-button" onclick="buttonClicked(this)">1M</button>
                <button id="3M" class="graph-button" onclick="buttonClicked(this)">3M</button>
            </div>
        </div>

        <div id="right">
            <div id="buy">
                <div id="buy-tabs">
                    <button id="buy-button" class="tab active-tab" onclick="tabClicked('BUY')">BUY</button>
                    <button id="sell-button" class="tab" onclick="tabClicked('SELL')">SELL</button>
                </div>
                <div id="tab-content">
                    <form>
                        <div class="bsRow">
                            <p class="bsLeft">Number of Shares</p>
                            <input id="numShares" type="text"></input>
                        </div>
                        <div class="bsRow">
                            <p class="bsLeft">Total Cost</p>
                            <p>COST</p>
                        </div>
                        <div class="bsRow">
                            <p class="bsLeft">Account Balance</p>
                            <p>BALANCE</p>
                        </div>
                        <div class="bsRow">
                            <input id="btn" type="submit" value="Purchase"></input>
                        </div>
                    </form>
                </div>
            </div>
            <div id="news"></div>
        </div>
    </div>
    <!-- UPDATE BUTTONS AND CHART SCRIPT -->
    <script>
        var buttons = document.getElementsByClassName("graph-button");
        function buttonClicked(button) {
            // Update Buttons
            if (button.classList.contains("active")) {return}
            // document.cookie = "curr_timeframe="+button.id
            var values = {
                curr_timeframe : button.id,
                artistID : <?php echo json_encode($_GET["id"]); ?>
            };
            var res;
            $.post('getArtistChartData.php',values, function(data){
                res = $.parseJSON(data);
                var chart = Chart.getChart("graph-canvas");
                chart.options.plugins.title.text = "Price - " + button.id;
                chart.data = {
                    fill: true,
                    labels: res["dates"],
                    datasets: [{
                        backgroundColor: "rgba(30, 100, 30, 1)",
                        borderColor: "rgba(30, 100, 30, .3)",
                        data: res["prices"]
                    }]
                }
                chart.update();

                var elem = document.getElementById("price-change-img")
                if (res["change"] > 0) {
                    elem.setAttribute("src", "up.png")
                } else {
                    elem.setAttribute("src", "down.png")
                }
            });

            for (i=0; i < buttons.length; i++) {
                var b = buttons[i];
                if (b.classList.contains("active")) {b.classList.remove("active")}
            }
            button.classList.add("active");
        }
    </script>
    <!-- INITIAL CHART SCRIPT -->
    <!-- TODO: change COLOR based on up or down in price, add fill on bottom -->
    <script>
        var res;
        var values = {
            curr_timeframe : "1D",
            artistID : <?php echo json_encode($_GET["id"]); ?>
        };
        $.post('getArtistChartData.php',values, function(data){
            res = $.parseJSON(data);
            var chart = new Chart("graph-canvas", {
                type: "line",
                data: {
                    fill: true,
                    labels: res["dates"],
                    datasets: [{
                    backgroundColor: "rgba(30, 100, 30, 1)",
                    borderColor: "rgba(30, 100, 30, .3)",
                    data: res["prices"]
                    }]
                },
                options: {
                    responsive:false,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            text:"Price - 1D",
                            display: true
                        }
                    },
                    scales: {
                        display: true,
                        y: {
                            suggestedMin: 0,
                            suggestedMax: 2,
                            ticks: {
                                callback: function(value, index, ticks) {
                                    const str_spl = String(Number(value.toFixed(2))).split(".");
                                    if (str_spl.length == 1) {
                                        return '$'+str_spl[0]+'.00'
                                    } else {
                                        return '$' + str_spl[0]+"."+str_spl[1].padEnd(2, "0");
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: "Price"
                            }
                        },
            
                        x: {
                            title: {
                                display: true,
                                text: "Date"
                            }, 
                            ticks: {
                                autoSkip: true,
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
            
                    }
            
                }
            });
            var elem = document.getElementById("price-change-img")
            if (res["change"] > 0) {
                elem.setAttribute("src", "up.png")
            } else {
                elem.setAttribute("src", "down.png")
            }
        });
    </script>
    <!-- Script for update buy/sell tab -->
    <script>
        function tabClicked(state) {
            var content = document.getElementById("tab-content")
            // content.innerHTML = "Current tab: " + state;
            if (state == "BUY") {
                document.getElementById("buy-button").classList.add("active-tab")
                document.getElementById("sell-button").classList.remove("active-tab")
            } else if (state == "SELL") {
                document.getElementById("buy-button").classList.remove("active-tab")
                document.getElementById("sell-button").classList.add("active-tab")
            }
        }
    </script>


  </body>
</html>