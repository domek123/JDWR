 
 <script>
     import News from './News.svelte'
     import {settings} from '../store.js'
     import ArticleSmall from '../routes/ArticleSmall.svelte'
      let newsArray = [];

  let setting = {}
  settings.subscribe(value => {

    setting = value;
    setTimeout(() => {
      fetch('http://localhost:3421/getNews' , {method: 'post' ,body: JSON.stringify({number: parseInt(value.numberOfArticles)}) , headers: { "Content-Type": "application/json" }}).then(response => response.json()).then(data => {
      newsArray = []
      data.records.forEach(item => {
               newsArray.push({ArticleID: item[0] , header: item[1] , content: item[2] , photoName: "./news_img/" + item[3]})
                
            })
            newsArray = newsArray
    })
    }, 2000);
    
  })
 </script>
 
 <section class="news">
    <h1 class="news-head " style="--headersColor: {setting.headersColor};
    --headersFSize: {setting.headersFSize}; --headerDecoration: {setting.headerDecoration}">{setting.newsName}</h1>
    <div class="news-content">
      {#each newsArray as news}
        <ArticleSmall info={news} />
      {/each}
    </div>
  </section>

<style>
      .main-page-container {
    text-align: center;
    margin: 0 auto;
    max-width: 1200px;
  }
  .news-content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .news-head {
    display: block;
     font-size: var(--headersFSize);
    color: var(--headersColor);
    text-decoration: var(--headerDecoration);
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
  .header-Slider{
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
</style>