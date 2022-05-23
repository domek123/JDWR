<script>
    import {LinkList} from '../store.js'
    //import {onMount} from 'svelte'
    let Links = []
    LinkList.subscribe(value => Links = value)
    let FullName = ""
    let url = ""

    

    const send = () => {
        const headers = { "Content-Type": "application/json" };
        const body = JSON.stringify({FullName, url })
        fetch('http://localhost:3421/addLink' , {method: 'post' , body ,headers}).then(response => response.json()).then(data => {
            Links.push({FullName , url})
            LinkList.set(Links)
            window.location.href = "/#/"
            console.log("a")
        })
    }
</script>

<div>
    <div class="addPage-container">
        <div class="items">
            <div>Name</div>
            <input type="text" bind:value={FullName} />
        </div>
        
        <div class="items">
            <div>url</div>
            <input type="text" bind:value={url}  />
        </div>

        <button on:click={send}>Add</button>
    </div>
</div>
