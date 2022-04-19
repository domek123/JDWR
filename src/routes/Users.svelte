<script>
    import User from "../components/User.svelte"
    import {userUpdated} from "../store.js"
    import { onMount } from 'svelte';

    let usersList = []
    let isMounted = false

    

    const getUsers = () => {
        
         fetch("http://localhost:3421/getUsers").then(response => response.json()).then(data => {
            data.Users.forEach(element => {
                usersList.push({id: element[4] , fullName: element[0], login: element[1] , password: element[2], isAdmin: element[3]})
            });
            usersList = usersList
        })
    }

    userUpdated.subscribe(val => {
        console.log("a" , val)
        usersList = []
        if(isMounted){
            getUsers()
        }
        
    })

    onMount(() => {
        console.log("A")
        usersList = []
       getUsers()
       isMounted = true
    })

</script>


<div class="UserDiv">
    <div class="UsrDiv">
    {#each usersList as user}
        <User id={user.id} fullName={user.fullName} login={user.login} password={user.password} isAdmin={user.isAdmin} />
    {/each}
    </div>
</div>



<style>
    .UserDiv{
        display: flex;
        align-items: center;
        justify-content: center;
        

    }
   
    
</style>