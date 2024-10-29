<html>
    <head>

    </head>
    <body>
        
        <?php
            $command = escapeshellcmd('python3 python/sqlSetup.py registerUser '.$_POST["username"]." ".$_POST["password"]);
            $output = shell_exec($command);

            if ($output == 1) {
                header("Location: login.php");
            } else {
                echo $output;
                // header("Location: register.php");
            }

            # If output is bad redirect to register with error message

            // header("Location: home.php")
        ?>
    </body>
</html>