<script>
  import News from "../components/News.svelte";
  import Slider from "../components/Slider.svelte";
  import Section from "../components/Section.svelte"
  import NewsSection from '../components/NewsSection.svelte'
  import SliderSection from '../components/SliderSection.svelte'
  import {onMount} from 'svelte'
  import {SliderInfo , userLogged, settings} from '../store.js'
  import List from "../components/List.svelte"

  let items = [
    {component: SliderSection},
    {component: NewsSection},
    {component: Section}
  ]

  let setting = {}

  settings.subscribe(value => {console.log(value); 
    if(value.blocks == "Slider-News-Info"){
      items = [
    {component: SliderSection},
    {component: NewsSection},
    {component: Section}
  ]
    }else if(value.blocks == "News-Slider-Info"){
       items = [
    {component: NewsSection},
    {component: SliderSection},
    {component: Section}
  ]
    }else{
       items = [
    {component: Section},
    {component: SliderSection},
    {component: NewsSection}
  ]
    }
  })

  let userInfo = {}
  userLogged.subscribe(val => userInfo = val)
 

 
</script>



<div class="main-page-container">
  <List items={items}/>
</div>

<style>
  .main-page-container {
    text-align: center;
    margin: 0 auto;
    max-width: 80vw;
  }
 
</style>
