<script>
    import "./Form.css";
    let info = "";
    import { userName, userLogged } from "../store.js";

    const registerUser = () => {
        const login = document.getElementById("Login").value;
        const password = document.getElementById("Password").value;

        const body = JSON.stringify({ login, password });
        const headers = { "Content-Type": "application/json" };
        fetch("http://localhost:3421/Login", { method: "post", body, headers })
            .then((response) => response.json())
            .then((data) => {
                if (typeof data.Objects == "string") {
                    info = "Niepoprawne dane logowania";
                } else {
                    info = "";
                    console.log(data);
                    userName.set(data.Objects[1]);
                    userLogged.set({
                        fullName: data.Objects[0],
                        isAdmin: data.Objects[3],
                        id: data.Objects[4],
                    });
                    window.location.href = "/#";
                }
                console.log(data);
            });
    };
</script>

<div class="form-container">
    <h1>Logowanie</h1>

    <label for="login"
        >Login
        <input
            type="text"
            name="login"
            id="Login"
            autocomplete="off"
            placeholder="wpisz swój login"
        />
    </label>
    <label for="password"
        >Hasło
        <input
            type="password"
            name="password"
            id="Password"
            autocomplete="off"
            placeholder="wpisz swoje hasło"
        />
    </label>
    <button on:click={registerUser}>Zaloguj</button>
    <p>{info}</p>
</div>

<style>
    .form-container button {
        margin-top: 40px;
    }
</style>
