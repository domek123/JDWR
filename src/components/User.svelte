<script>
    export let id;
    export let fullName;
    export let login;
    export let password;
    export let isAdmin;

    import { userUpdated, userToEdit } from "../store.js";

    const EditUser = () => {
        userToEdit.set({ fullName, login, password, isAdmin, id });
        window.location.href = "/#/EditUser";
    };

    const removeUser = () => {
        const body = JSON.stringify({
            id: id,
        });
        const headers = { "Content-Type": "application/json" };
        fetch("http://localhost:3421/removeUser", {
            method: "post",
            body,
            headers,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                userUpdated.set(data);
            });
    };
</script>

<div class="user-elem">
    <div>{isAdmin == 1 ? "👑" : ""}</div>
    <div>{id}</div>
    <div>{fullName}</div>
    <div>{login}</div>
    <div>{password}</div>
    <div on:click={EditUser} class="editBtn">Edytuj</div>
    <div on:click={removeUser} class="removeBtn">Usuń</div>
</div>

<style>
    .user-elem {
        width: 80vw;
        height: 50px;
        background-color: azure;
        border-radius: 4px;
        display: flex;
        justify-content: space-around;
        flex-direction: row;
        align-items: center;
        margin: 10px;
        font-size: 1.5em;
        font-weight: 600;
    }
    .user-elem > div {
        width: 15%;
        text-align: center;
    }
    .user-elem > div:nth-child(1),
    .user-elem > div:nth-child(2) {
        width: 7%;
    }
    .editBtn,
    .removeBtn {
        background-color: rgb(255, 64, 0);
        border-radius: 6px;
        cursor: pointer;
    }
</style>
