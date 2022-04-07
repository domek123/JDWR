<script>
    export let photoInfo;
</script>

<div class="lg:w-1/3 sm:w-1/2 p-4 mb-10 ">
    <div class="flex relative image-container">
        <img
            alt="gallery"
            class="absolute inset-0 w-full h-full object-cover object-center"
            src={photoInfo.src}
        />
        <div
            class="px-8 py-10 relative z-10 w-full border-4 bg-gray-200 opacity-0 hover:opacity-90"
        >
            <h1 class="title-font font-medium text-gray-900 mb-3">
                {photoInfo.title}
            </h1>
            <p class="leading-relaxed">
                {photoInfo.text}
            </p>
        </div>
    </div>
</div>

<style>
    .image-container {
        height: 300px;
        border: 2px solid gray;
    }
    .image-container h1 {
        font-size: 24px;
    }
</style>
