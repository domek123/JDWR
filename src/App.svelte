<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import Router from "svelte-spa-router";
  import { userName, userLogged } from "./store.js";

  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import Contact from "./routes/Contact.svelte";
  import Home from "./routes/Home.svelte";
  import Gallery from "./routes/Gallery.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import Register from "./routes/Register.svelte";
  import Login from "./routes/Login.svelte";

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
          "/contact": Contact,
          "/gallery": Gallery,
          "/Register": Register,
          "/login": Login,
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
  .main-container {
    text-align: center;
  }
</style>
