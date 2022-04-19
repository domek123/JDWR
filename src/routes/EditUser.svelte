<script>
    import './Form.css'
    import {userToEdit} from "../store.js"
    let fullName = ""
    let password = ""
    let login = ""
    let isAdmin = false
    let id 

    userToEdit.subscribe(value => {
        console.log(value)
        fullName = value.fullName 
        password = value.password
        login = value.login 
        isAdmin = value.isAdmin
        id = value.id
    })

    const Edit = () => {
        const body = JSON.stringify({
            fullName: document.getElementById('Fullname').value,
            login: document.getElementById('Login').value,
            password: document.getElementById('Password').value,
            isAdmin: document.getElementById('isAdmin').checked,
            id
        })
         const headers = { "Content-Type": "application/json" };
        fetch("http://localhost:3421/editUser" , {method: 'post' , body, headers}).
        then(response => response.json()).
        then(data => {
            console.log(data)
           window.location.href = "/#/Users"
        })
    }


</script>


<div class="form-container">
    <h1>Logowanie</h1>
     <label for="fullName"
        >Hasło
        <input
            type="text"
            name="fullname"
            id="Fullname"
            value={fullName}
            autocomplete="off"
            placeholder="wpisz swoje hasło"
        />
    </label>
    <label for="login"
        >Login
        <input
            type="text"
            name="login"
            id="Login"
            value={login}
            autocomplete="off"
            placeholder="wpisz swój login"
        />
    </label>
    <label for="password"
        >Hasło
        <input
            type="text"
            name="password"
            id="Password"
            value={password}
            autocomplete="off"
            placeholder="wpisz swoje hasło"
        />
    </label>
    <label for="admin"
        >isAdmin
        <input
            type="checkbox"
            name="isAdmin"
            id="isAdmin"
            checked={isAdmin == 1 ? true : false}
            
        />
    </label>
    <button on:click={Edit}>Edytuj</button>
    
</div>