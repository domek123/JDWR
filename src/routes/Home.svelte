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
  <h1 class="news-head text-white">News</h1>
  <div class="news-content">
    {#each newsArray as news}
      <News info={news} />
    {/each}
  </div>
</section>
<div class="white-line" />
<section class="main-section">
  <article class="main-article">
    <div class="text-white p-6 main-info">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s, when an unknown printer took a galley of type and scrambled it to
      make a type specimen book. It has survived not only five centuries, but
      also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1960s with the release of Letraset
      sheets containing Lorem Ipsum passages, and more recently with desktop
      publishing software like Aldus PageMaker including versions of Lorem
      Ipsum.
    </div>
    <div class=" p-6 main-image">
      <img src="./img/galaxy.jpg" alt="galaxy image" class="main-img" />
    </div>
  </article>

  <article class="main-article">
    <div class=" p-6 main-image">
      <img src="./img/galaxy.jpg" alt="galaxy image" class="main-img" />
    </div>
    <div class="text-white p-6 main-info">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s, when an unknown printer took a galley of type and scrambled it to
      make a type specimen book. It has survived not only five centuries, but
      also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1960s with the release of Letraset
      sheets containing Lorem Ipsum passages, and more recently with desktop
      publishing software like Aldus PageMaker including versions of Lorem
      Ipsum.
    </div>
  </article>
</section>

<style>
  .news-content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .news-head {
    display: block;
    font-size: 40px;
    font-weight: 700;
    padding-bottom: 10px;
  }
  .white-line {
    margin: 0 auto;
    margin-bottom: 50px;
    height: 10px;
    background-color: white;
    border-radius: 10px;
    width: 98%;
  }
  .main-article {
    display: flex;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }
  .main-info {
    width: 45%;
    margin-left: 1%;
    font-size: 23px;
    height: 500px;
  }
  .main-image {
    width: 50%;
    margin-left: 3%;
    height: 500px;
  }
  .main-img {
    width: 99%;
    height: 460px;
    border: 4px solid gray;
    border-radius: 30px;
  }
</style>
