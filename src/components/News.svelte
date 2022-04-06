<script>
    export let info;
    const handleTest = () => {
        const body = JSON.stringify({a: "123455"})
         const headers = { "Content-Type": "application/json" };
        fetch("http://localhost:3421/Register",{method: 'post', body, headers}).then(response => response.json()).then(data => console.log(data))
    }
</script>

<div class="xl:w-1/3 md:w-1/2 p-4">
    <div
        class="gray text-white p-6 rounded-lg border-gray-100 border-2 opacity-70"
    >
        <img
            class="lg:h-60 xl:h-56 md:h-64 sm:h-72 xs:h-72 h-72  rounded w-full object-cover object-center mb-6"
            src={info.url}
            alt="Image Size 720x400"
        />
        <h2 class="text-lg text-white font-medium title-font mb-4 underline">
            {info.title}
        </h2>
        <p class="leading-relaxed text-base">
            {info.text}
        </p>
        <button id="check" on:click={handleTest}>sprawdz</button>
    </div>
</div>

<style>
    .gray {
        background-color: rgb(2, 2, 5);
    }
</style>
