<script>
    let info = ""
    
    export let handle
    const registerUser = () => {
        const fullName = document.getElementById("fullName").value
        const login = document.getElementById("Login").value
        const password = document.getElementById("Password").value

        const body = JSON.stringify({fullName, login, password})
        const headers = { "Content-Type": "application/json" };
        fetch("http://localhost:3421/Register",{method: 'post', body, headers}).then(response => response.json()).then(data => {
            if(typeof data.Objects== "string"){
                info = "taki login już istnieje"
            }else{
                info = ""
                handle(data.Objects.login)
                window.location.href = "/#"
            }
        })
    }
</script>

<main>
    <label for="fullname">Imie
    <input type="text" name="fullname" id="fullName" autocomplete="off" />
    </label>
     <label for="login">Login
    <input type="text" name="login" id="Login" autocomplete="off" />
    </label>
     <label for="password">Password
    <input type="text" name="password" id="Password" autocomplete="off" />
    </label>
    <button on:click={registerUser}>Register</button>
    <p>{info}</p>

</main>

<style>
   label{
       color:aliceblue;
   }
   input{
       color: black;
   }
   p{
       color: red;
   }

</style>