 <script>
     import {settings} from '../store.js'

     let setting = {}
     settings.subscribe(value => setting = value)
 </script>
 
 
 <section class="main-section">
    <h1 class="news-head " style="--headersColor: {setting.headersColor};
    --headersFSize: {setting.headersFSize}; --headerDecoration: {setting.headerDecoration}">{setting.sectionName}</h1>
    <article class="main-article">
      <div class=" p-6 main-info" style="--sectionColor: {setting.sectionColor};--sectionFSize: {setting.sectionFSize}">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </div>
      <div class=" p-6 main-image">
        <img src="./slider/galaxy.jpg" alt="galaxy image" class="main-img" />
      </div>
    </article>

    <article class="main-article">
      <div class=" p-6 main-image">
        <img src="./slider/galaxy.jpg" alt="galaxy image" class="main-img" />
      </div>
      <div class=" p-6 main-info" style="--sectionColor: {setting.sectionColor};--sectionFSize: {setting.sectionFSize}">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard dummy text ever
        since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book. It has survived not only five
        centuries, but also the leap into electronic typesetting, remaining
        essentially unchanged. It was popularised in the 1960s with the release
        of Letraset sheets containing Lorem Ipsum passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions
        of Lorem Ipsum.
      </div>
    </article>
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
    font-size: var(--sectionFSize);
    min-height: 500px;
    height: auto;
    color: var(--sectionColor)
  }
  .main-image {
    width: 50%;
    margin-left: 3%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height:100%;
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
