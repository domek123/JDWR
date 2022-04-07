<script>
  import Carousel from "svelte-carousel";
  let colors = ["./img/a.jpg", "./img/galaxy.jpg"];
  export let speed = 5000;
</script>

<Carousel autoplay autoplayDuration={speed} pauseOnFocus>
  {#each colors as color}
    <img src={color} alt={color} class="slider-img" />
  {/each}
</Carousel>

<style>
  .slider-img {
    height: 500px;
    border-bottom: 4px solid gray;
    border-top: 4px solid gray;
  }
</style>
