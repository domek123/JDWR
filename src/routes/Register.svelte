<script>
    import "./Form.css";
    let info = "";
    import { userName } from "../store.js";

    const registerUser = () => {
        const fullName = document.getElementById("fullName").value;
        const login = document.getElementById("Login").value;
        const password = document.getElementById("Password").value;

        const body = JSON.stringify({ fullName, login, password });
        const headers = { "Content-Type": "application/json" };
        fetch("http://localhost:3421/Register", {
            method: "post",
            body,
            headers,
        })
            .then((response) => response.json())
            .then((data) => {
                if (typeof data.Objects == "string") {
                    info = "taki login już istnieje";
                } else {
                    info = "";
                    console.log(data);
                    userName.update((n) => n + data.Objects[1]);
                    window.location.href = "/#";
                }
            });
    };
</script>

<div class="form-container">
    <h1>Rejestracja</h1>
    <label for="fullname"
        >Imię
        <input
            type="text"
            name="fullname"
            id="fullName"
            autocomplete="off"
            placeholder="wpisz swoje imie"
        />
    </label>
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
            type="text"
            name="password"
            id="Password"
            autocomplete="off"
            placeholder="wpisz swoje hasło"
        />
    </label>
    <button on:click={registerUser}>Zarejestruj</button>
    <p>{info}</p>
</div>

<style>
</style>
