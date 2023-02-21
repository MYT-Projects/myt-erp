import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { toastStyle } from "../../Helpers/Utils/Common";
import ReactLoading from "react-loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//images
import logo from "../../Assets/Images/Login/logo.png";
import usernameIcon from "../../Assets/Images/Login/username.png";
import passwordIcon from "../../Assets/Images/Login/password.png";

//css
import "./Login.css";

//api
import { loginUser, loginUser2 } from "../../Helpers/apiCalls/authApi";
import { refreshPage } from "../../Helpers/Utils/Common";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [disableClick, setDisableClick] = useState(false);
    const [navigateHome, setNavigateHome] = useState(false);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    async function submit() {
        setDisableClick(true);
        const response = await loginUser(username, password);
        // const response2 = await loginUser2(username, password);
        console.log(response);
        // console.log(response2);
        if (response.data) {
            localStorage.setItem("pin", JSON.stringify(response.data.user.pin));

            localStorage.setItem("user", JSON.stringify(response.data.user.id));
            // localStorage.setItem("user2", JSON.stringify(response2.data.user.id));
            localStorage.setItem(
                "name",
                JSON.stringify(
                    response.data.user.first_name + " " + response.data.user.last_name
                )
            );

            // account type
            /*
             *   'commissary_officer','inventory_officer','purchasing_officer','franchise_officer','hr_officer','accounts_officer','operations_manager','fielder_officer_1','fielder_officer_2','admin'
             */
            localStorage.setItem("type", JSON.stringify(response.data.user.type));
            //console.log(`Account type:  ${response.data.type}`);

            //mango magic
            localStorage.setItem(
                "api-key",
                JSON.stringify(response.data.user.api_key).replace(/['"]+/g, "")
            );
            localStorage.setItem("token", JSON.stringify(response.data.user.token));

            //potato corner
            localStorage.setItem(
                "api-key2",
                // JSON.stringify(response2.data.user.api_key).replace(/['"]+/g, "")
            );
            localStorage.setItem(
                "token2",
                // JSON.stringify(response2.data.user.token)
            );

            // message
            toast.success("Successful Login!", { style: toastStyle() });
            setTimeout(() => refreshPage(), 2000);
        } else if (response.error) {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
            // toast.error(response2.error.data.messages.error, {
            //     style: toastStyle(),
            // });
            // //console.log(response.error.data.messages.error);
            setTimeout(() => refreshPage(), 2000);
        }
    }

    return (
        <div className="center">
            <div className="login-cont">
                <Toaster position="top-right" reverseOrder={false} />
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <img src={logo} alt="logo" className="login-logo" />
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center username-cont">
                        <div className="input-group mb-3">
                            <div className="input-group-prepend icon-cont">
                                <span
                                    className="input-group-text icon-text custom-border-radius"
                                    id="basic-addon1"
                                >
                                    <img
                                        src={usernameIcon}
                                        alt="username"
                                        className="username-icon"
                                    />
                                </span>
                            </div>
                            <input
                                type="text"
                                className="form-control username-input"
                                placeholder="Username"
                                aria-label="Username"
                                aria-describedby="basic-addon1"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col d-flex justify-content-center password-cont">
                        <div className="input-group mb-3 password-wrapper-login">
                            <div className="input-group-prepend icon-cont">
                                <span
                                    className="input-group-text icon-text custom-border-radius"
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
                                color="#2a9d3a"
                                height={50}
                                width={50}
                            />
                        )}
                        {disableClick === false && (
                            <button
                                type="submit"
                                className="login-btn"
                                onClick={() => submit()}
                            >
                                LOGIN
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
