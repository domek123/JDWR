<script>
  import Photo from "../components/gallery/Photo.svelte";
  let tab = [
    {
      src: "./img/Merkury.jpg",
      title: "Merkury",
      text: "Planeta porusza się tak szybko, że w ciągu zaledwie 88 dni tworzy kompletną pętlę wokół Słońca. Merkury to mały, skalisty świat. Jest on tylko tak szeroki, jak Ocean Atlantycki.  ",
    },
    {
      src: "./img/venus.jpg",
      title: "Wenus",
      text: "Uważa się, że miliardy lat temu Wenus mogła mieć podobny klimat jak ten na Ziemi. Naukowcy uważają, że mogły istnieć duże ilości wody, nawet wystarczająco duże, aby stworzyć oceany na Wenus. Jednak wysokie temperatury na Wenus, które wywołują ekstremalny efekt cieplarniany, pozwoliły na odparowanie wody.",
    },
    {
      src: "./img/ziemia.jpg",
      title: "Ziemia",
      text: "Wokół Ziemi krąży naturalny satelita Księżyc. Możemy go ujrzeć po zmroku. Gdyby nagle zniknął nocą księżyc, byłoby tak ciemno, że nie moglibyśmy się kompletnie poruszać, niestety gwiazdy nie byłyby w stanie oświetlić naszej planety.",
    },
    {
      src: "./img/mars.jpeg",
      title: "Mars",
      text: "Najwyższy szczyt na Marsie to wulkan o nazwie Góra Olimp. Ma 25 km wysokości i jest to prawdopodobnie również najwyższe wzniesienie w całym Układzie Słonecznym.",
    },
    {
      src: "./img/jowisz.jpg",
      title: "Jowisz",
      text: "Jowisz jest czwartym najjaśniejszym obiektem w Układzie Słonecznym widzianym z Ziemi. Tylko Słońce, Księżyc i Wenus są jaśniejsze. Jowisz ma najwięcej księżyców w układzie słonecznym na 67 potwierdzonych. Galileo znalazł pierwsze cztery w 1610 roku.",
    },
    {
      src: "./img/saturn.jpg",
      title: "Saturn",
      text: "Pierścienie Saturna są zrobione z kawałków skał i lodu. Saturn jest najlżejszą planetą w naszym układzie słonecznym.",
    },
  ];
</script>

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
