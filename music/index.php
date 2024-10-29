<?php 
function includeMenu($curPage) {
    include("menu.php");
}
?>
<html>
    <head>
        <title>MusicStonks</title>
        <link rel="apple-touch-icon" sizes="180x180" href="icon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
        <style>
            <?php include 'css/menu.css'; ?>
            <?php include 'css/home.css'; ?>
            body {
                background-image: url('background.jpeg');
                background-size: 100% 100%;
            }
        </style>
    </head>
    <body>
        <?php 
            includeMenu("index");
        ?>
        <?php 
            $command = escapeshellcmd('python3 python/test.py');
            $output = shell_exec($command);
            echo $output;
        ?>
    </body>
</html>