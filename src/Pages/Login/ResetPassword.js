import React, { useState } from "react";
import { loginUser } from "../../Helpers/apiCalls/authApi";
import {
    getUser,
    refreshPage,
    removeSession,
    removeUserSession,
} from "../../Helpers/Utils/Common";
import { Toaster, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactLoading from "react-loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//images
import logo from "../../Assets/Images/Login/logo.png";
import usernameIcon from "../../Assets/Images/Login/username.png";
import passwordIcon from "../../Assets/Images/Login/password.png";

//css
import "./Login.css";
import { Navigate } from "react-router-dom";
import { editPassword } from "../../Helpers/apiCalls/usersApi";

function ResetPassword() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [disableClick, setDisableClick] = useState(false);
    const [navigate, setNavigate] = useState(false);
    const userId = getUser();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    async function submit() {
        setDisableClick(true);
        const response = await editPassword(userId, password);
        // //console.log(response);
        if (response.data) {
            toast.success(response.data.data.response);
            removeSession();

            setTimeout(function () {
                setNavigate(true);
            }, 3000);
        } else if (response.error) {
            toast.error(response.error.data.messages.error.toUpperCase());
            // //console.log(response.error.data.messages.error);
            setDisableClick(false);
        }
    }

    if (navigate === true) {
        return <Navigate to={"/"} />;
    }

    return (
        <div className="d-flex justify-content-center mt-10">
            <Toaster />
            <div className="login-cont">
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <img src={logo} alt="logo" className="login-logo" />
                    </div>
                </div>
                <div className="row">
                    <h1 className="reset-label">Reset Password</h1>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center password-cont">
                        <div className="input-group mb-3 password-wrapper-login">
                            <div className="input-group-prepend icon-cont">
                                <span
                                    className="input-group-text icon-text"
                                    id="basic-addon1"
                                >
                                    <img
                                        src={passwordIcon}
                                        alt="password"
                                        className="password-icon"
                                    />
                                </span>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control password-input"
                                placeholder="Password"
                                aria-label="Password"
                                aria-describedby="basic-addon1"
                                autoComplete="on"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="eye-icon-login">
                                <FontAwesomeIcon
                                    icon={showPassword ? "eye" : "eye-slash"}
                                    alt={"eye"}
                                    className={
                                        showPassword
                                            ? "eye-login"
                                            : "eye-slash-login"
                                    }
                                    aria-hidden="true"
                                    onClick={togglePassword}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col d-flex justify-content-center login-btn-cont">
                        {disableClick === true && (
                            <ReactLoading
                                type="spinningBubbles"
                                color="#EC0B8C"
                                height={100}
                                width={50}
                            />
                        )}
                        {disableClick === false && (
                            <button
                                type="submit"
                                className="login-btn"
                                onClick={() => submit()}
                            >
                                SAVE
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
