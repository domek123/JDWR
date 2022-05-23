<script>
  import Carousel from "svelte-carousel";
  import {onMount} from 'svelte'
  import {settings, userLogged} from '../store.js'
  let colors = ["./slider/a.jpg", "./slider/galaxy.jpg"];
  let itemsSlider = [{photoName:'./slider/galaxy.jpg'},{photoName:'./slider/galaxy.jpg'},{photoName:'./slider/galaxy.jpg'}]
  let duration = 5000
  let isLoaded = false

  let setting = {}
  let user = 0
  settings.subscribe(value => {setting = value; duration = value.SliderDuration})
  userLogged.subscribe(value => {user = value.isAdmin})
  
  onMount(() => {
     getSlider()
  })

  const removeSlide = (header , content) => {
    const headers = { "Content-Type": "application/json" };
    const body = JSON.stringify({content, header })
    fetch('http://localhost:3421/deleteSlide' , {method:'post' , body , headers}).then(response => response.json()).then(data => {
      window.location.href = "/#/info"
      //window.location.href = "/#/"
    })
  }

  const getSlider = () => {
    fetch('http://localhost:3421/getSlider').then(response => response.json()).then(data => {
      duration = parseInt(data.duration[1]);
      console.log(data.duration)
      itemsSlider = []
      data.records.forEach(item => {itemsSlider.push({photoName: item[0] , header: item[1] , content: item[2] , idSlide: item[3]})})
      itemsSlider = [...itemsSlider]
      console.log(itemsSlider)
      isLoaded = true
    })
  }

  

 // console.log(items, duration)
</script>

<div>
  {#if isLoaded}
  <Carousel autoplay autoplayDuration={duration} pauseOnFocus>
  {#each itemsSlider as item}
     <!-- <img src={`./slider/${item.photoName}`} alt={item.photoName} class="slider-img" />   -->
    <!-- <div class="opis"><h1>AAAA</h1></div> -->
   <div class="slide" style="--bg: url({`/slider/${item.photoName}`}); --sliderFlex: {setting.sliderFlex}; --sliderAlign: {setting.sliderAlign}">
     
     <div class="header-car" style="--sliderHeaderFSize: {setting.sliderHeaderFSize}; --sliderHeaderColor: {setting.sliderHeaderColor}">{item.header}</div>
     <div class="content-car" style="--sliderContentFSize: {setting.sliderContentFSize};--sliderContentColor: {setting.sliderContentColor}">{item.content}</div>
     {#if user==1}
        <button on:click={() => removeSlide(item.header,item.content)}>Usuń slajd</button>
     {/if}
   </div>
    

    
    

  {/each}
</Carousel>
  {/if}
</div>

<style>
  
  .slide{
    width:100%;
    height: 500px;
    background: var(--bg);
     background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items:var(--sliderAlign);
    justify-content: var(--sliderFlex);
  }
  .header-car{
    z-index: 15;
    color: var(--sliderHeaderColor);
    font-size: var(--sliderHeaderFSize);
    text-align: center;
  }
  .content-car{
    font-size: var(--sliderContentFSize);
    color: var(--sliderContentColor);
  }
  /* .opis {
    z-index: 10;
    font-size: 60px;
    position: absolute;
    color: White;
  } */
</style>
