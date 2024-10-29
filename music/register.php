<html>
    <head>
        <link rel="apple-touch-icon" sizes="180x180" href="icon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
        <title>Register</title>
        <style>
            <?php include 'css/menu.css' ?>
            <?php include 'utils.php' ?>
            <?php include 'css/registerForm.css' ?>


        </style>
        <script type="text/javascript" src='js/validateRegistration.js'></script>
    </head>
    <body>
        <?php includeMenu("")?>
        <div id="formDiv">
            <form method="POST" action="handleRegister.php">
                <div class="inputElem"> 
                    <input type="text" name="username" id="username" class="item" placeholder="User Name" onkeyup="checkInputs()" oninvalid="setCustomValidity(' ')">
                    <label class="err invalid">Must be at least 1 letter</label>
                </div>
                <div class="inputElem">
                    <input type="email" name="email" id="email" class="item" placeholder="Email" onkeyup="checkInputs()" oninvalid="setCustomValidity(' ')">
                    <label class="err invalid">Must be a valid email</label>
                </div>
                <div class="inputElem">
                    <input type="text" name="password" id="password" class="item" placeholder="Password" onkeyup="checkInputs()" oninvalid="setCustomValidity(' ')">
                    <label id="passwordLabel" class="err invalid">Must be at least 8 letters</label>
                </div>
                <div class="inputElem">
                    <input type="text" name="passwordCorf" id="passwordConf" class="item" placeholder="Confirm password" onkeyup="checkInputs()" oninvalid="setCustomValidity(' ')">
                    <label class="err invalid">Must match password</label>
                </div>
                <div class="inputElem">
                    <input type="date" name="birthdate" id="birthdate" class="item" onkeyup="checkInputs()" onchange="checkInputs()" oninvalid="setCustomValidity(' ')">
                    <label class="err invalid">Invalid date</label>
                </div>
                <div class="inputElem" id="submitDiv">
                    <input class="btn item" type="submit" value="Register" disabled id="submitButton">
                </div>
                <!-- <script> checkInputs()</script> -->
            </form>
        </div>
    </body>
</html>