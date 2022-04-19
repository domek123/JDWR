<script>
    import { userName, userLogged } from "../store.js";

    let userNameValue = "";
    let userLoggedValue;

    userName.subscribe((value) => (userNameValue = value));
    userLogged.subscribe((value) => (userLoggedValue = value));

    const handleLogOut = () => {
        userName.set("");
        userLogged.set({});
        window.location.href = "/#";
    };

    const handleShowUsers = () => {
        window.location.href = "/#/Users";
    };
</script>

<div class="header-container bg-gray-900">
    <div class="page-links">
        <a href="/#">Home</a>
        <a href="#/gallery">Galeria</a>
        <a href="/#/Articles">Artykuły</a>
        <a href="/contact">Kontakt</a>
    </div>

    <div class="cms-links">
        {#if userNameValue == ""}
            <a href="#/login">Login</a>
            <a href="#/Register">Register</a>
        {:else}
            <button on:click={handleLogOut}>Log out</button>
            {#if userLoggedValue.isAdmin == 1}
                <button on:click={handleShowUsers}>Users</button>
            {/if}
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
