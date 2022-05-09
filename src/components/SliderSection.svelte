<script>
  import Slider from "./Slider.svelte";
  import "../routes/style/ButtonsAdd.css";
  import { SliderInfo, userLogged, settings } from "../store.js";

  let userInfo = {};
  userLogged.subscribe((val) => (userInfo = val));

  let setting = {};
  settings.subscribe((value) => {
    setting = value;
  });
</script>

<div>
  <div class="header-Slider">
    <h1
      class="news-head "
      style="--headersColor: {setting.headersColor};
    --headersFSize: {setting.headersFSize}; --headerDecoration: {setting.headerDecoration}"
    >
      Slider
    </h1>
  </div>
  <Slider />
  {#if userInfo.isAdmin}
    <a href="/#/editSlider" class="add center">Edytuj Slider</a>
  {/if}
</div>

<style>
  .news-head {
    display: block;
    font-size: var(--headersFSize);
    color: var(--headersColor);
    text-decoration: var(--headerDecoration);
    font-weight: 700;
    padding-bottom: 10px;
  }

  .header-Slider {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
</style>
