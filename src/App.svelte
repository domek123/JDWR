<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import Router from "svelte-spa-router";
 import {wrap} from 'svelte-spa-router/wrap'

  import Header from "./components/Header.svelte";
  import Slider from "./components/Slider.svelte";
  import Footer from "./components/Footer.svelte";
  import Contact from "./routes/Contact.svelte";
  import Home from "./routes/Home.svelte";
  import Gallery from "./routes/Gallery.svelte";
  import NotFound from "./routes/NotFound.svelte";
  import Register from './routes/Register.svelte'

  export let num 
  $: userName = "zzz"
  const handle = (event) => userName = event
</script>

<Tailwindcss />
<div class="flex flex-col">
  <header>
    {userName}
    <Header />
    <Slider />
  </header>

  <div class="main-container">
    <Router
     
      routes={{
        "/": Home,
        "/contact": Contact,
        "/gallery": Gallery,
        "/Register": wrap({
          component:Register,
          props: {
            userName: userName,
            handle: ()=>{handle}
          }
        }),
        "*": NotFound,
      }}
    />
  </div>
  <Footer />
</div>

<style>
  .main-container {
    text-align: center;
    margin: 0 auto;
    max-width: 1200px;
  }
</style>
