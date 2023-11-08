import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const nav = useNavigate();

    const showError = (text) => {
        toast.error(text, {
            position: toast.POSITION.TOP_RIGHT
        });
    };

    const handleError = (error) => {
        if(error == "username already exists") showError("Username already exists. Please enter a unique username.");

        if(error == "something went wrong") showError("Something went wrong. Please try again later.");
    }

    const handleRegisterSubmit = (event) => {
        event.preventDefault();
        const firstName = event.target.firstName.value;
        const lastName = event.target.lastName.value;
        const username = event.target.username.value;
        const password = event.target.password.value;
        const password2 = event.target.password2.value;
        if(!firstName || !lastName || !username || !password || !password2) {
            showError("Please fill all the fields to register")
        } else if(password !== password2) {
            showError("Passwords do not match")
        }
        else {
            axios.post("http://localhost:3000/user/register", {firstName, lastName, username, password})
            .then(res =>  nav("/login"))
            .catch(err => {
                console.log(err);
                handleError(err?.response?.data?.error);
            });
        }
    }

    return (
        <div className="register">
            <div className="register-container">
                <center><h1 className="register-title">Register</h1></center>
                <form onSubmit={handleRegisterSubmit} >
                    <label>First name</label>
                    <br></br>
                     <input type="text" name="firstName" id="firstName"/>
                    <br></br><br></br>
                    <label>Last name</label>
                    <br></br>
                    <input type="text" name="lastName" id="lastName"/>
                    <br></br><br></br>
                    <label>Username</label>
                    <br></br>
                    <input type="text" name="username" id="username"/>
                    <br></br><br></br>
                    <label>Password</label>
                    <br></br>
                    <input type="password" name="password" id="password"/>
                    <br></br><br></br>
                    <label>Confirm password</label>
                    <br></br>
                    <input type="password" name="password2" id="password2"/>
                    <br></br><br></br>
                    <center><input className="register-btn" type="submit" value="Register" /></center>
                    <div className="registration-link">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </form>
            </div>
            <ToastContainer />
        </div>
    )
 }

export default Register;