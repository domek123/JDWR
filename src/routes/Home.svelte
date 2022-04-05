<script>
  import News from "../components/News.svelte";
  let newsArray = [
    {
      url: "https://kuyou.id/content/images/ctc_2020021605150668915.jpg",
      title: "Chichen Itza",
      text: "Fingerstache flexitarian street art 8-bit waistcoat.Distillery hexagon disrupt edison bulbche.",
    },
    {
      url: "https://asset.kompas.com/crops/Pk_pN6vllxXy1RshYsEv74Q1BYA=/56x0:1553x998/750x500/data/photo/2021/06/16/60c8f9d68ff4a.jpg",
      title: "Colosseum Roma",
      text: "Fingerstache flexitarian street art 8-bit waistcoat.Distillery hexagon disrupt edison bulbche.",
    },
    {
      url: "https://images.immediate.co.uk/production/volatile/sites/7/2019/07/33-GettyImages-154260931-216706f.jpg?quality=90&resize=768%2C574",
      title: "Great Pyramid of Giza",
      text: "Fingerstache flexitarian street art 8-bit waistcoat.Distillery hexagon disrupt edison bulbche.",
    },
  ];
</script>

<section class="news">
  <h1 class="news-head">News</h1>
  <div class="news-content">
    {#each newsArray as news}
      <News info={news} />
    {/each}
  </div>
</section>
<section class="main-section">
  <div>
    <h1>main section</h1>
  </div>
</section>

<style>
  .news-content {
    display: flex;
    flex-wrap: wrap;
  }
  .news-head {
    display: block;
    font-size: 40px;
    font-weight: 700;
    padding-bottom: 10px;
  }
</style>
