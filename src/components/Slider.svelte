<script>
  import Carousel from "svelte-carousel";
  let colors = ["green", "blue"];
</script>

<Carousel autoplay autoplayDuration={5000} autoplayProgressVisible pauseOnFocus>
  {#each colors as color}
    <div style="width:100%;height:200px;background-color:{color};" />
  {/each}
</Carousel>
