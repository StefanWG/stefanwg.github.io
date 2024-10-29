<?php 
  session_start() ;
  if (empty($_SESSION["username"])) {
    // header("Location: login.php");
    echo "EMPTU";
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

      #graph-container {
        width: 400px;
        height: 500px;
      }
      #graph-canvas {
        width: 100%;
        height: 400px;
        background-color: lightblue;
        margin-bottom: 30px;
      }
      #graph-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        justify-items: center;
        gap: 20px;
        height: 50px;
      }

      #graph-buttons button {
        height: 100%;
        width: 80%;
        border-radius: 100%;
        border: none;
      }

      #graph-buttons button:active {
        box-shadow: inset 0px 0px 5px greenyellow;
      }
      
      #graph-buttons button.active {
        background-color: lightgreen;
      }
    </style>
  </head>
  <body>
    <div>
      <?php includeMenu("home")?>
    </div>
    <?= $_SESSION["username"]?>
    <div id="graph-container">
      <canvas id="graph-canvas"></canvas>
      <div id="graph-buttons">
        <button class="active graph-button" onclick="buttonClicked(this)">1D</button>
        <button class="graph-button" onclick="buttonClicked(this)">1W</button>
        <button class="graph-button" onclick="buttonClicked(this)">1M</button>
        <button class="graph-button" onclick="buttonClicked(this)">3M</button>
      </div>
    </div>

    <script>
      var xValues = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
      var yValues = [1,2,3,2,3,3,4,5,6,5,4,3,4,3,2,5]

      var chart = new Chart("graph-canvas", {
        type: "line",
        data: {
          fill: false,
          labels: xValues,
          datasets: [{
            backgroundColor: "rgba(30, 100, 30, 1)",
            borderColor: "rgba(30, 100, 30, .3)",
            data: yValues
          }]
        },
        options: {
          responsive:true,
          maintainAspectRatio: false,
          plugins: {
            legend: {display: false},
            title: {
              text:"Your Earnings",
              display: true
            }
          },
          scales: {
            yAxes: [{ticks: {min: 0, max:6}}],
          }

        }
      });
    </script>

    <script>
      var buttons = document.getElementsByClassName("graph-button");
      function buttonClicked(button) {
        // Update Buttons
        if (button.classList.contains("active")) {return}
        for (i=0; i < buttons.length; i++) {
          var b = buttons[i];
          if (b.classList.contains("active")) {b.classList.remove("active")}
        }
        button.classList.add("active");

        // Update Graph
        var chart = Chart.getChart("graph-canvas");
        chart.options.plugins.title.text = "update";
        chart.update();
      }
    </script>

  </body>
</html>