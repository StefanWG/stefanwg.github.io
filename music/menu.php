<?php 
    function activeClass($curPage, $page) {
        if ($curPage == $page) {
            echo 'class="active"';
        }
    }
?>


<div>
  <div id="menu">
    <div class="menu-item">
      <a <?php activeClass($curPage, "home")?> href="home.php">Home</a>
    </div>
    <div class="menu-item">
      <a <?php activeClass($curPage, "news")?> href="news.php">News</a>
    </div>
    <div class="title">
      <p>Music Stonks</p>
    </div>
    <div class="menu-item">
      <a <?php activeClass($curPage, "search")?> href="search.php">Search</a>
    </div>
    <div class="dropdown menu-item">
      <a class="prof" href="profile.php">
        <?php 
          if (!empty($_SESSION["username"])) {
            echo $_SESSION["username"];
          } else {
            echo "Profile";
          }
        ?>
      </a>
      <div class="dropdown-content">
          <a class="d" href="test.php">Settings</a>
          <a class="d" href="logout.php">Log Out</a>
        </div>
    </div>
  </div>