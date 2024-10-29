<?php session_start() ?>
<html>
    <head>
        <link rel="apple-touch-icon" sizes="180x180" href="icon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
        <style>
            <?php include 'css/menu.css' ?>
            <?php include 'utils.php' ?>
            <?php include 'css/registerForm.css' ?>
        </style>
    </head>
    <body>
        <?php 
            if ($_SERVER["REQUEST_METHOD"] == "POST") {
                $command = escapeshellcmd('python3 python/sqlSetup.py login '.$_POST["username"]." ".$_POST["password"]);
                $output = shell_exec($command);

                if ($output == 1) {
                    $_SESSION["username"] = $_POST["username"];
                    header("Location: home.php");
                } else {
                    header("Location: login.php");
                }
            }
        ?>
        <?php includeMenu("")?>
        <br>
        <div id="formDiv">
            <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>">
                <div class="inputElem"> 
                    <input type="text" name="username" class="item" placeholder="User Name" required oninvalid="setCustomValidity('Enter a username')">
                    <!-- <label class="err invalid">Must be at least 1 letter</label> -->
                </div>
                <div class="inputElem">
                    <input type="password" name="password" class="item" placeholder="Password" required oninvalid="setCustomValidity('Enter a password')">
                    <!-- <label id="passwordLabel" class="err invalid">Must be at least 8 letters</label> -->
                </div>
                <div class="inputElem" id="submitDiv">
                    <input class="btn item" type="submit" value="Login" id="submitButton">
                </div>
            </form>
        </div>
    </body>
</html>