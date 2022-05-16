<script>
    import { userLogged } from "../store.js";
    import "./style/AddPage.css";
    let isUserAdmin = 0;
    userLogged.subscribe((val) => (isUserAdmin = val.isAdmin));

    let title;
    let img;
    let text;

    const send = () => {
        const data = new FormData();
        data.append("files", img[0]); // maybe it should be '{target}_cand'
        data.append("name", img[0].name);
        console.log(data.get("files"));

        fetch("http://localhost:3421/addToGalleryFile", {
            method: "post",
            body: data,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.info == "success") {
                    let PhotoID =
                        new Date().getTime().toString() +
                        Math.floor(Math.random() * 100000).toString();
                    const body = JSON.stringify({
                        PhotoID,
                        title,
                        text,
                        photoName: img[0].name,
                    });
                    const headers = { "Content-Type": "application/json" };
                    fetch("http://localhost:3421/addToGallery", {
                        method: "post",
                        body,
                        headers,
                    })
                        .then((response) => response.json())
                        .then((res) => {
                            console.log(res);
                            window.location.href = "/#/gallery";
                        });
                }
            });
    };
</script>

<div>
    <div class="addPage-container">
        <div class="items">
            <div>title</div>
            <input type="text " bind:value={title} />
        </div>
        <div class="items">
            <div>image</div>
            <input type="file" bind:files={img} />
        </div>
        <div class="items">
            <div>text</div>
            <textarea bind:value={text} cols="30" rows="10" />
        </div>

        <button on:click={send}>Add</button>
    </div>
</div>
