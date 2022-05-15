<script>
    import { userName, userLogged, settings } from "../store.js";

    let userNameValue = "";
    let userLoggedValue;

    userName.subscribe((value) => (userNameValue = value));
    userLogged.subscribe((value) => (userLoggedValue = value));

    const handleLogOut = () => {
        userName.set("");
        userLogged.set({});
    };
    let setting = {};
    settings.subscribe((value) => {
        setting = value;
    });
    let val = 0;
    const changeVal = () => {
        val = val == 0 ? 1 : 0;
        console.log(val);
    };
    const handleShowUsers = () => {
        window.location.href = "/#/Users";
    };
</script>

{#if val == 0}
    <div class="header-container" style="--bg-nav: {setting.navFooterColor}">
        <div class="page-links">
            <a href="/#">Home</a>
            <a href="#/gallery">Galeria</a>
            <a href="/#/Articles">Artykuły</a>
        </div>

        <div class="cms-links">
            {#if userNameValue == ""}
                <a href="#/login">Login</a>
                <a href="#/Register">Register</a>
                <button class="btn" on:click={changeVal}>Left</button>
            {:else}
                <a href="/#" on:click={handleLogOut}>Log out</a>
                {#if userLoggedValue.isAdmin == 1}
                    <a href="/#/Users">Users</a>
                    <a href="/#/settings">Settings</a>
                {/if}
                <button class="btn" on:click={changeVal}>Left</button>
            {/if}
        </div>
    </div>
{:else}
    <div class="nav" style="--bg-nav: {setting.navFooterColor}">
        <div class="nav-list">
            <div class="links">
                <a href="/#">Home</a>
                <a href="#/gallery">Galeria</a>
                <a href="/#/Articles">Artykuły</a>
            </div>

            <div class="links">
                {#if userNameValue == ""}
                    <a href="#/login">Login</a>
                    <a href="#/Register">Register</a>
                {:else}
                    <a href="/#" on:click={handleLogOut}>Log out</a>
                    {#if userLoggedValue.isAdmin == 1}
                        <a href="/#/Users">Users</a>
                        <a href="/#/settings">Settings</a>
                    {/if}
                {/if}
                <button class="btn btn2" on:click={changeVal}>top</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .header-container {
        position: relative;
        z-index: 10;
        top: 0;
        width: 100%;
        background-color: var(--bg-nav);
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
        width: 40%;
    }
    .page-links a,
    .cms-links a {
        display: block;
    }

    .nav {
        width: 250px;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2;

        transform: translate3d(-200px, 0, 0);
    }
    .nav-list {
        width: 200px;
        height: 100vh;

        background-color: var(--bg-nav);
        box-shadow: 0 0 25px 0;

        display: flex;
        flex-direction: column;
        justify-content: center;

        transition: all 0.2s ease-out;
    }

    .nav-list .links {
        width: 180px;

        margin: 20px 0;
        padding: 0 0 0 20px;

        background-color: var(--bg-nav);

        display: flex;
        flex-direction: column;
        align-items: center;

        transition: all 0.4s;
        transform: translateX(-150px);
        opacity: 0;
    }

    .nav-list a {
        color: white;
        text-decoration: none;
        font-size: 24px;
        font-weight: bold;

        transition: all 0.2s;
    }

    .nav:hover .nav-list {
        transform: translate3d(200px, 0, 0);
    }

    .nav:hover .nav-list .links:nth-child(1) {
        transition-delay: 0.1s;
    }

    .nav:hover .nav-list .links:nth-child(2) {
        transition-delay: 0.2s;
    }

    .nav:hover .nav-list .links {
        background-color: var(--bg-nav);
        transform: translateX(0px);
        opacity: 1;
    }

    .nav-list li a:hover {
        color: #8b79cd;
    }
    .btn {
        border: 1px solid rgba(28, 28, 28, 0.3);
        border-radius: 10px;
        width: 100px;
    }
    .btn2 {
        margin-left: 0;
        margin-top: 100px;
    }
</style>
