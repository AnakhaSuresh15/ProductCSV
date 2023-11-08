import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const nav = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem("token-info");
        if(loggedInUser) {
            const username = JSON.parse(loggedInUser).username;
            nav("/dashboard",{ state: { username } })
        }
    })

    const showError = (text) => {
        toast.error(text, {
            position: toast.POSITION.TOP_RIGHT
        });
    };
    const handleError = (error) => {
        if(error == "invalid username/password") showError("The username or password you have entered is incorrect");

        if(error == "something went wrong") showError("Something went wrong. Please try again later.");

    }
    const handleLoginSubmit = (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value; 
        if(!username || !password) showError('Please enter username and password.'); 
        else {
            axios.post("http://localhost:3000/user/login", {username, password}, { withCredentials: true, 
            credentials: 'include', })
                .then(res =>  {
                    const userData = {
                        username,
                    }
                    setLocalStorage(userData);
                    nav("/dashboard",{ state: { username } }
                )})
                .catch(err => {
                    console.log(err);
                    handleError(err?.response?.data?.error);
                })
        }
    }

    const setLocalStorage = (userData) => {
        localStorage.setItem("token-info", JSON.stringify(userData));
    }

    return (
        <div className="login">
            <div className="login-container">
                <center><h1>Login</h1></center>
                <form onSubmit={handleLoginSubmit}>
                    <label>Username</label>
                    <br></br>
                     <input type="text" name="username" id="username" />
                    <br></br><br></br>
                    <label>Password</label>
                    <br></br>
                    <input type="password" name="password" id="password" />
                    <br></br><br></br>
                    <center><input className="register-btn" type="submit" value="Login" /></center>
                </form>
                <center>
                    <div className="registration-link">
                        Do not have an account?
                        <br></br>
                        Register <Link to="/register">here</Link>
                    </div>
                </center>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Login;