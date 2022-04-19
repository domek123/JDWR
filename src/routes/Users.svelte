<script>
    import User from "../components/User.svelte"
    import {userUpdated} from "../store.js"
    import { onMount } from 'svelte';

    let usersList = []
    let isMounted = false

    const change = event => {

  let files = event.target.files
  let fileName = files[0].name
  
  // your code start here
  var data = new FormData()
  data.append('files', files[0]) // maybe it should be '{target}_cand'
  data.append('name', fileName)
  console.log(data.get('files'))

  // let url = "http://localhost:5001/v1/cand"
  let url = "http://localhost:3421/file"
  fetch(url,{
    method:"POST",
    // body: {files:files[0]}, // wrong
    body: data,
  })
  .then(function(response){
    return response.json()
  })
  // .then(function(data){ // use different name to avoid confusion
  .then(function(res){
    console.log('success')
    console.log(res)
  })

}

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

<input type="file" id="fileUpload" on:change={(e) => change(e)} />

<style>
    .UserDiv{
        display: flex;
        align-items: center;
        justify-content: center;
        

    }
   
    
</style>