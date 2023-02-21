import React, { useState } from "react";
import { updateStatus } from "../../Helpers/apiCalls/commonApi";
import { Toaster, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Cancel.css";
import {
    isNotClosingDate,
    isClosingTime,
    refreshPage,
} from "../../Helpers/Utils/Common";
import { Navigate } from "react-router-dom";
import Link from "react-csv/lib/components/Link";
import { deleteDailyCashReports } from "../../Helpers/apiCalls/reportsApi";
import SubmitButton from "../SubmitButton/SubmitButton";

function Cancel({
    screen,
    show,
    handleClose,
    item,
    type,
    table,
    id,
    link = "",
    details,
    validUntilTime,
    validUntilDate,
}) {
    const [redirect, setRedirect] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const time = validUntilTime ? validUntilTime.split(":") : "";
    const today = new Date().toDateString();
    const shipDate = new Date(validUntilDate).toDateString();

    async function cancelDailyCashReports() {
        if (!isClicked) {
            setIsClicked(true);
            const response = await deleteDailyCashReports(id);
            // //console.log(response)
            if (response.data) {
                if (response.data.status === 200) {
                    toast.success("CANCELLED SUCCESSFULLY!");
                }
            } else {
                if (response.error.status === 500) {
                    toast.error("CANCELLED UNSUCCESSFULLY!");
                }
                if (response.error.status === 404) {
                    toast.error(response.error.data.messages.error);
                }
            }
            setTimeout(function () {
                refreshPage();
            }, 2000);
        }
    }

    if (redirect) {
        return <Navigate to={link} />;
    }
    ////console.log(details);
    // //console.log(validUntilDate)
    // //console.log(validUntilTime)

    if (
        (type === "manager" &&
            !isClosingTime(validUntilTime) &&
            isNotClosingDate(validUntilDate)) ||
        (today != shipDate && isNotClosingDate(validUntilDate))
    ) {
        //add condition for date time range
        if (screen === "dailycashreports") {
            return (
                <div
                    className={
                        show ? "modal display-block" : "modal display-none"
                    }
                >
                    <section className="modal-main">
                        <p className="modal-content-admin">
                            Are you sure want to cancel the transaction?
                        </p>
                        {/* <p><b>DETAILS</b></p>
            <p><b>Outlet: </b> {details.branch}</p>
            <p><b>Outlet Type: </b> {details.outlet_type}</p>
            <p><b>Status: </b> {details.status}</p>
            <p><b>Services: </b> {details.services}</p>
            <p><b>Fusion Loc. Code: </b> {details.code}</p>
            <p><b>Contact Number: </b> {details.contact_number}</p>
            <p><b>Description: </b> {details.description}</p>
            <p><b>Province: </b> {details.province}</p>
            <p><b>Address: </b> {details.address}</p>
            <p><b>Remarks 1: </b> {details.remarks_1}</p>
            <p><b>Remarks 2: </b> {details.remarks_2}</p>
            <p><b>Remarks 3: </b> {details.remarks_3}</p> */}
                        <section
                            style={{ display: "flex" }}
                            className="justify-content-center"
                        >
                            <SubmitButton
                                isClicked={isClicked}
                                submit={cancelDailyCashReports}
                                type={"cancel"}
                            />
                            <button
                                type="button"
                                className="modal-cancel-btn-admin"
                                onClick={handleClose}
                            >
                                No
                            </button>
                        </section>
                        {/* <button type="button" className='modal-delete-btn-admin' onClick={() => updateOutletStatus("cancel")}>
            Disapprove
          </button> */}
                    </section>
                </div>
            );
        }
    }
    //   }
    else {
        return (
            <div
                className={show ? "modal display-block" : "modal display-none"}
            >
                <section className="modal-main">
                    <p className="modal-content-admin">
                        Sorry, you can only cancel transactions which have
                        shipment dates later than today
                    </p>
                    <button
                        type="button"
                        className="modal-cancel-btn-admin"
                        onClick={handleClose}
                    >
                        Close
                    </button>
                    {/* <button type="button" className='modal-edit-btn-admin' onClick={() => setRedirect(true)}>
              Edit
            </button> */}
                </section>
            </div>
        );
    }
}

export default Cancel;
