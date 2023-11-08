import { useLocation } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from "react-router-dom";

const Header = () => {
    const nav = useNavigate();
    const location = useLocation();
    const isLoggedIn = location.pathname == "/dashboard" ? true : false;

    const handleLogout = () => {
        confirmAlert({
            title: 'Confirm Logout',
            message: 'Are you sure you want logout.',
            buttons: [
              {
                label: 'Yes',
                onClick: () => {
                    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    localStorage.removeItem("token-info");
                    nav('/login');
                }
              },
              {
                label: 'No',
                onClick: () => {handleLogout}
              }
            ]
          });
    }

    return (
        <div className="header">
            <div className="title">ProductCSV</div>
            {isLoggedIn && <div className="nav-items">
                <button className="loggedbtn" 
                    onClick={handleLogout}
                >Logout</button>
            </div>}
        </div>
    );
}

export default Header;