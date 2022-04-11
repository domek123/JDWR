<script>
    export let id
    export let fullName 
    export let login 
    export let password
</script>

<div class="user-elem">
    <div>{id}</div>
    <div>{fullName}</div>
    <div>{login}</div>
    <div>{password}</div>
</div>

<style>
    .user-elem{
        width: 60vw;
        color: azure;
        border: 2px solid azure;
        display: flex;
        justify-content: space-around;
        flex-direction: row;
        margin: 5px;
    }
    .user-elem > div{
        width: 15%;
    }
</style>