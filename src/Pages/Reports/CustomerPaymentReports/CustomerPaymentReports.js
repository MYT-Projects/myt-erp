import React, { useState } from "react";

//components
import Navbar from "../../../Components/Navbar/Navbar";

//css
import "../Reports.css";
import "../../../Components/Navbar/Navbar.css";

export default function CustomerPaymentsReports() {
    const [inactive, setInactive] = useState(false);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"REPORTS"} 
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    <div className="col-sm-6">
                        <h1 className="page-title">
                            {" "}
                            CUSTOMER PAYMENT REPORTS{" "}
                        </h1>
                    </div>
                    {/* input search button */}
                    <div className="col-sm-6 d-flex justify-content-end">
                        <input
                            type="text"
                            className="search-bar"
                            defaultValue=""
                            // onChange={(e) => setUsername(e.target.value)}
                        ></input>
                        <button
                            className="add-btn"
                            // onClick={() => showAddSupplierModal(true)}
                        >
                            {" "}
                            Add
                        </button>
                    </div>{" "}
                </div>{" "}
            </div>
        </div>
    );
}
