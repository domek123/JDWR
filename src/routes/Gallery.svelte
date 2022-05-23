<script>
  import Photo from "../components/gallery/Photo.svelte";
  import Photo2 from "../components/gallery/Photo2.svelte";
  import { userLogged } from "../store.js";
  import { onMount } from "svelte";
  import "./style/ButtonsAdd.css";
  let isUserAdmin = 0;
  userLogged.subscribe((val) => (isUserAdmin = val.isAdmin));
  let tab = [];

  const getGallery = () => {
    fetch("http://localhost:3421/getGallery")
      .then((response) => response.json())
      .then((data) => {
        data.records.forEach((item) => {
          tab.push({
            PhotoID: item[0],
            title: item[1],
            text: item[2],
            src: "./gallery/" + item[3],
          });
        });
        tab = tab;
      });
  };
  let flag = true
  const zmien = ()=>{
    flag = !flag
  }
  onMount(() => getGallery());
</script>
<button on:click={()=>zmien()}>zmien</button>
{#if flag == true}
<section class="mt-10">
  <div class="container mx-auto">
    <div class="flex flex-col text-center w-full mb-20">
      <h1
        class="sm:text-6xl font-medium title-font mb-1 text-white border-white border-b-2 pb-5"
      >
        Galeria
      </h1>
    </div>
    <div class="flex flex-wrap -m-4">
      {#each tab as photo}
        <Photo photoInfo={photo} />
      {/each}
    </div>
  </div>
</section>
{:else}
<section class="mt-10">
  <div class="container mx-auto">
    <div class="flex flex-col text-center w-full mb-20">
      <h1
        class="sm:text-6xl font-medium title-font mb-1 text-white border-white border-b-2 pb-5"
      >
        Galeria
      </h1>
    </div>
    <div class="flex flex-wrap -m-4">
      {#each tab as photo}
        <Photo2 photoInfo={photo}/>
      {/each}
    </div>
  </div>
</section>
{/if}

{#if isUserAdmin == 1}
  <a href="/#/AddPhoto" class="add">Dodaj zdjęcie</a>
{/if}
