<script>
    let info = ""
    import { userName , userLogged } from '../store.js'
    
   
    const registerUser = () => {
       
        const login = document.getElementById("Login").value
        const password = document.getElementById("Password").value

        const body = JSON.stringify( {login, password})
        const headers = { "Content-Type": "application/json" };
        fetch("http://localhost:3421/Login",{method: 'post', body, headers}).then(response => response.json()).then(data => {
            if(typeof data.Objects== "string"){
                info = "Niepoprawne dane logowania"
            }else{
                info = ""
                console.log(data)
                userName.set(data.Objects[1])
                userLogged.set({
                    "fullName": data.Objects[0],
                    "isAdmin": data.Objects[3],
                    "id": data.Objects[4]
                })
                window.location.href = "/#"
            }
            console.log(data)
        })
    }
</script>

<main>
   
   
     <label for="login">Login
    <input type="text" name="login" id="Login" autocomplete="off" />
    </label>
     <label for="password">Password
    <input type="text" name="password" id="Password" autocomplete="off" />
    </label>
    <button on:click={registerUser}>Log In</button>
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