<script>
    export let photoInfo;

    
</script>

<div class="p-4 mb-10 alls">
    <div class="flex relative image-container" >
        <img
            alt="gallery"
            class="absolute inset-0 w-full h-full object-cover object-center"
            src={photoInfo.src}
        />
    </div>
</div>

<style>
    .alls{
        width: 100%;
        height: 900px;
        overflow: hidden;
    }
    .image-container {
        width: 100%;
        height: 900px;
        border: 2px solid gray;
    }
    
</style>
