import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//css
import "./ReportCard.css";

//images
import cash from "../../Assets/Images/Report/cash.png";
import discountTag from "../../Assets/Images/Report/discountTag.png";
import coupon from "../../Assets/Images/Report/coupon.png";

function ReportCard({ type, data }) {
    const [index, setIndex] = useState(0);

    if (type === "services") {
        function next() {
            if (index < data.length - 1) {
                var i = index;
                setIndex(i + 1);
                // //console.log(index);
            }
        }

        function prev() {
            if (index > 0) {
                var i = index;
                setIndex(i - 1);
                // //console.log(index);
            }
        }

        return (
            <div className="report-cont report-nav-cont">
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <div className="col-1">
                            <div onClick={() => prev()}>
                                <FontAwesomeIcon
                                    icon={"less-than"}
                                    className="left-nav report-nav-icon"
                                    alt={"add-new-service"}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                        <div className="col-6 d-flex justify-content-center">
                            <span className="report-title">
                                {data[index].name}
                            </span>
                        </div>
                        <div className="col-1 d-flex justify-content-end">
                            <div onClick={() => next()}>
                                <FontAwesomeIcon
                                    icon={"greater-than"}
                                    className="right-nav report-nav-icon"
                                    alt={"add-new-service"}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p className="report-nav-data">{data[index].cash}</p>
                        <p className="report-data-type">CASH</p>
                    </div>
                    <div className="col">
                        <p className="report-nav-data">{data[index].cash}</p>
                        <p className="report-data-type">CARD</p>
                    </div>
                    <div className="col">
                        <p className="report-nav-data">{data[index].cash}</p>
                        <p className="report-data-type">CHECK</p>
                    </div>
                    <div className="col">
                        <p className="report-nav-data">{data[index].cash}</p>
                        <p className="report-data-type">OTHERS</p>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "desktop services") {
        function next() {
            if (index < data.length - 1) {
                var i = index;
                setIndex(i + 1);
                // //console.log(index);
            }
        }

        function prev() {
            if (index > 0) {
                var i = index;
                setIndex(i - 1);
                // //console.log(index);
            }
        }

        return (
            <div className="report-cont report-center-cont">
                <div className="row">
                    <div className="col d-flex justify-content-center">
                        <div className="col-1">
                            <div onClick={() => prev()}>
                                <FontAwesomeIcon
                                    icon={"less-than"}
                                    className="left-nav report-nav-icon"
                                    alt={"add-new-service"}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                        <div className="col-6 d-flex justify-content-center">
                            <span className="report-title">
                                {data[index].name}
                            </span>
                        </div>
                        <div className="col-1 d-flex justify-content-end">
                            <div onClick={() => next()}>
                                <FontAwesomeIcon
                                    icon={"greater-than"}
                                    className="right-nav report-nav-icon"
                                    alt={"add-new-service"}
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row d-flex-content-center">
                    <div className="col d-flex-content-center">
                        <p className="report-center-data">
                            {data[index].total}
                        </p>
                        <p className="report-center-type">TOTAL TRANSACTIONS</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="report-cont">
            <div className="row">
                <div className="col d-flex justify-content-end">
                    <span className="report-title">{type}</span>
                </div>
            </div>
            <div className="row">
                <div className="col-3">
                    {type === "total sales" && (
                        <img
                            src={cash}
                            className="cash report-icon"
                            alt="cash"
                        />
                    )}
                    {type === "total number of availed promo" && (
                        <img
                            src={discountTag}
                            className="tag report-icon"
                            alt="cash"
                        />
                    )}
                    {type === "total number of availed discount" && (
                        <img
                            src={coupon}
                            className="coupon report-icon"
                            alt="cash"
                        />
                    )}
                </div>
                <div className="col">
                    <p className="report-data">{data}</p>
                </div>
            </div>
        </div>
    );
}

export default ReportCard;
