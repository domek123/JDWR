<script>
    import User from "../components/User.svelte"
    import { onMount } from 'svelte';

    let usersList = []

    onMount(() => {
        fetch("http://localhost:3421/getUsers").then(response => response.json()).then(data => {
            data.Users.forEach(element => {
                usersList.push({id: element[4] , fullName: element[0], login: element[1] , password: element[2]})
            });
            usersList = usersList
        })
    })

</script>


<div class="UserDiv">
    {#each usersList as user}
        <User id={user.id} fullName={user.fullName} login={user.login} password={user.password} />
    {/each}
</div>

<style>
    .UserDiv{
        margin: 0 auto;
    }
    main  .UserDiv{
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>