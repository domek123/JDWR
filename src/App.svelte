<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import Router from "svelte-spa-router";
  import { userName, userLogged, settings } from "./store.js";
  import { onMount } from "svelte";

  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import Home from "./routes/Home.svelte";
  import Gallery from "./routes/Gallery.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import Register from "./routes/Register.svelte";
  import Login from "./routes/Login.svelte";
  import Users from "./routes/Users.svelte";
  import EditUser from "./routes/EditUser.svelte";
  import Articles from "./routes/Articles.svelte";
  import AddArticle from "./routes/AddArticle.svelte";
  import AddPhoto from "./routes/AddPhoto.svelte";
  import ArticleFile from "./routes/ArticleFile.svelte";
  import EditSlider from "./routes/EditSlider.svelte";
  import SettingsHome from "./routes/SettingsHome.svelte";

  let userNameValue;
  let userLoggedValue;

  userLogged.subscribe((value) => {
    console.log(value, "aaaa");
    userLoggedValue = value;
  });

  userName.subscribe((value) => {
    console.log(value);
    userNameValue = value;
  });

  settings.subscribe((val) => console.log(val, "BYBYBYBBY"));

  onMount(() => {
    fetch("http://localhost:3421/getConfig")
      .then((response) => response.json())
      .then((data) => {
        let obj = {};
        data.records.forEach((item) => (obj[item[0]] = item[1]));
        console.log(obj);
        settings.set(obj);
      });
  });
</script>

<Tailwindcss />
<div class="flex flex-col page-container">
  <header>
    <div id="user-name">{userNameValue}</div>
    <Header />
  </header>
  <div class="main-container">
    <main>
      <Router
        routes={{
          "/": Home,
          "/gallery": Gallery,
          "/settings": SettingsHome,
          "/Register": Register,
          "/login": Login,
          "/Users": Users,
          "/EditUser": EditUser,
          "/Articles": Articles,
          "/AddArticle": AddArticle,
          "/AddPhoto": AddPhoto,
          "/Article/:bound": ArticleFile,
          "/editSlider": EditSlider,
          "/settings": SettingsHome,
          "*": NotFound,
        }}
      />
    </main>
  </div>
  <Footer />
</div>

<style>
  .page-container {
    justify-content: space-between;
    height: 100%;
  }
  #user-name {
    font-size: 23px;
    color: white;
    display: flex;
    align-items: center;
    padding-left: 5px;
    background-color: rgb(6, 9, 14);
  }
</style>
