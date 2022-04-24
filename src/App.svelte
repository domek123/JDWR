<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import Router from "svelte-spa-router";
  import { userName, userLogged } from "./store.js";

  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import Home from "./routes/Home.svelte";
  import Gallery from "./routes/Gallery.svelte";
  import Contact from "./routes/Contact.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import Register from "./routes/Register.svelte";
  import Login from "./routes/Login.svelte";
  import Users from "./routes/Users.svelte";
  import EditUser from './routes/EditUser.svelte'
  import Articles from './routes/Articles.svelte'
  import AddArticle from './routes/AddArticle.svelte'
  import AddPhoto from './routes/AddPhoto.svelte'
  import ArticleFile from './routes/ArticleFile.svelte'

  let userNameValue;
  let userLoggedValue;

  userLogged.subscribe((value) => {
    console.log(value);
    userLoggedValue = value;
  });

  userName.subscribe((value) => {
    console.log(value);
    userNameValue = value;
  });
</script>

<Tailwindcss />
<div class="flex flex-col page-container">
  <header>
    {userNameValue}
    <Header />
  </header>
  <div class="main-container">
    <main>
      <Router
        routes={{
          "/": Home,
          "/gallery": Gallery,
          "/contact": Contact,
          "/Register": Register,
          "/login": Login,
          "/Users": Users,
          "/EditUser": EditUser,
          "/Articles": Articles,
          "/AddArticle": AddArticle,
          '/AddPhoto': AddPhoto,
          '/Article/:bound': ArticleFile,
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
  
</style>
