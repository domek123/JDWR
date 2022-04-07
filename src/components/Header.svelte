<script>
    import {userName , userLogged} from '../store.js'

    let userNameValue = ""
    let userLoggedValue 

    userName.subscribe(value => userNameValue= value)

    const handleLogOut = () => {
        userName.set("")
        userLogged.set({})
    }
</script>


<div class="header-container bg-gray-900">
    <div class="page-links">
        <a href="/">Strona główna</a>
        <a href="/gallery">Galeria</a>
        <a href="/article">Article</a>
        <a href="/comments">Komentarze</a>
    </div>
    
    <div class="cms-links">
        {#if userNameValue == ""}
        <a href="#/login">Login</a>
        <a href="#/Register">Register</a>
        {:else }
            <button on:click={handleLogOut}>Log out</button>
        {/if}
    </div>
</div>

<style>
    .header-container {
        position: relative;
        z-index: 10;
        top: 0;
        width: 100%;

        display: flex;
        justify-content: space-between;
        align-items: center;

        height: 50px;
        padding: 0 10%;

        font-size: 25px;
        color: white;
    }

    .page-links,
    .cms-links {
        display: flex;
        justify-content: space-evenly;
        width: 40%;
    }
    .cms-links {
        width: 20%;
    }
    .page-links a,
    .cms-links a {
        display: block;
    }
</style>
