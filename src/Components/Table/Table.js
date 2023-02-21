import React, { useState } from "react";
import TableFooter from "./TableFooter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTable from "./Pagination";
import PropTypes from "prop-types";
import Moment from "moment";

//css
import "./Table.scss";
import { useNavigate } from "react-router-dom";

//images
import check from "../../Assets/Images/Branch/check.png";
import { formatDate, formatDateNoTime } from "../../Helpers/Utils/Common";
import TableLoader from "./TableLoader";

function Table({
    clickable,
    type,
    tableData,
    headingColumns,
    subHeadingColumns,
    movableColumns,
    breakOn = "large",
    givenClass,
    withSubData,
    setID,
    useLoader = false,
    isReady,
}) {
    //SUB HEADER NAVIGATION
    const [index, setIndex] = useState(0);

    //Transaction
    const [startTransactionIndex, setStartTransactionIndex] = useState(0);
    const [endTransactionIndex, setEndTransactionIndex] = useState(6);

    //Branches
    const [startBranchIndex, setStartBranchIndex] = useState(0);
    const [endBranchIndex, setEndBranchIndex] = useState(4);

    //PAGINATION
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const { slice, range } = useTable(tableData, page, rowsPerPage);

    const next = () => {
        var i = index;
        if (tableData.length - 1 > index) {
            setIndex(i + 1);
            // //console.log(index);
        }
    };

    const previous = () => {
        var i = index;
        if (index > 0) {
            setIndex(i - 1);
        }
    };

    let tableClass = "table-container__table";

    if (breakOn === "small") {
        tableClass += " table-container__table--break-sm";
    } else if (breakOn === "medium") {
        tableClass += " table-container_table--break-md";
    } else if (breakOn === "large") {
        tableClass += " table-container_table--break-lg";
    }

    /***
     * TABLE W/ SUBHEADERS
     */

    //SubHeader Data
    if (withSubData) {
        const subData = tableData[index].data.map((row, index) => {
            let rowData = [];
            let i = 0;

            for (const key in row) {
                rowData.push({
                    key: headingColumns[i],
                    val: row[key],
                });
                i++;
            }
            if (type === "payment-type") {
                return (
                    <tr key={row.index}>
                        {rowData.map((data, index) => (
                            <td
                                key={index}
                                data-heading={data.key}
                                className={
                                    index == 0
                                        ? "first-index " + data.val
                                        : data.val
                                }
                            >
                                {data.val}
                            </td>
                        ))}
                    </tr>
                );
            }
        });

        //Total
        let cashTotal = tableData[index].data.reduce(function (prev, current) {
            return parseFloat(prev + +current.cash).toFixed(2);
        }, 0);

        let cardTotal = tableData[index].data.reduce(function (prev, current) {
            return parseFloat(prev + +current.card).toFixed(2);
        }, 0);

        let othersTotal = tableData[index].data.reduce(function (
            prev,
            current
        ) {
            return parseFloat(prev + +current.others).toFixed(2);
        },
        0);

        let grandTotal = tableData[index].data.reduce(function (prev, current) {
            return parseFloat(prev + +current.total).toFixed(2);
        }, 0);

        //PAYMENT TYPE TABLE
        if (type === "payment-type") {
            return (
                <div className="table-container">
                    <div className="search-table-container row"></div>
                    <table className={tableClass}>
                        <thead>
                            <tr>
                                <th className="first-index">BRANCH</th>
                                <th colSpan="5">
                                    <button className="type-navigation-btn">
                                        <button
                                            className="previous-nav-btn"
                                            onClick={() => previous()}
                                        >
                                            <FontAwesomeIcon
                                                icon={"angle-left"}
                                                alt={"open"}
                                                className={"nav-icon"}
                                                aria-hidden="true"
                                            />
                                        </button>
                                        {tableData[index].shippingType}
                                        <button
                                            className="next-nav-btn"
                                            onClick={() => next()}
                                        >
                                            <FontAwesomeIcon
                                                icon={"angle-right"}
                                                alt={"open"}
                                                className={"nav-icon"}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </button>
                                </th>
                            </tr>
                            <tr>
                                <th className="first-index"></th>
                                {subHeadingColumns.map((data, index) => {
                                    return <th key={index}>{data}</th>;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {subData}
                            <tr>
                                <td className="first-index">
                                    <span className="total-label">TOTAL</span>
                                </td>
                                <td className="value">{cashTotal}</td>
                                <td className="value">{cardTotal}</td>
                                <td className="value">{othersTotal}</td>
                                <td className="value">{grandTotal}</td>
                            </tr>
                        </tbody>
                    </table>
                    {/* <TableFooter range={range} slice={slice} setPage={setPage} page={page} footerclassName={givenClass} setRowsPerPage={setRowsPerPage} rowsPerPage={rowsPerPage}/> */}
                </div>
            );
        }
    } else {
        const data = slice.map((row, index) => {
            let i = 0;
            let rowData = [];

            for (const key in row) {
                rowData.push({
                    key: headingColumns[i],
                    val: row[key],
                });
                i++;
            }

            if (type === "transaction") {
                return (
                    <tr key={row.index}>
                        <td className="first-index">{rowData[0].val}</td>
                        {rowData
                            .slice(
                                startTransactionIndex + 1,
                                endTransactionIndex + 1
                            )
                            .map((data, index) => (
                                <td
                                    key={index}
                                    data-heading={data.key}
                                    className={data.val}
                                >
                                    {data.val}
                                </td>
                            ))}
                    </tr>
                );
            }

            if (type === "branches") {
                return (
                    <tr key={row.index}>
                        {rowData.splice(3).map((data, index) => (
                            <td
                                key={index}
                                data-heading={data.key}
                                className={data.val + " bold text-left"}
                                onClick={() =>
                                    setID({
                                        id: row.id,
                                        status: row.status,
                                        name: row.branch,
                                    })
                                }
                            >
                                {Array.isArray(data.val) === true
                                    ? data.val.map((data, index) => {
                                          return (
                                              <span key={index}>
                                                  <span>{data.name}</span>
                                                  <br />
                                              </span>
                                          );
                                      })
                                    : data.val}
                            </td>
                        ))}
                    </tr>
                );
            }

            if (type === "users") {
                return (
                    <tr key={row.index}>
                        {rowData.slice(1).map((data, index) => (
                            <td
                                key={index}
                                data-heading={data.key}
                                className={data.val + " text-left"}
                                onClick={() =>
                                    setID({
                                        id: row.id,
                                        status: row.status,
                                        name: row.user,
                                    })
                                }
                            >
                                {data.val}
                                {data.value}
                            </td>
                        ))}
                    </tr>
                );
            }

            if (type === "promo" || type === "discount") {
                return (
                    <tr key={row.index}>
                        {rowData.map((data, index) => (
                            <td
                                key={index}
                                data-heading={data.key}
                                className={data.val + " text-left"}
                                onClick={() => setID({ id: row.id })}
                            >
                                {data.val}
                                {data.value}
                            </td>
                        ))}
                    </tr>
                );
            }

            if (type === "announcements") {
                return (
                    <tr key={row.index} onClick={() => setID(row.id)}>
                        <td className={" text-left"}>{row.location}</td>
                        <td className={" text-left"}>{row.content}</td>
                        <td className={" text-left"}>{row.updated_by}</td>
                        <td className={" text-left"}>
                            {formatDate(row.updated_on)}
                        </td>
                    </tr>
                );
            }

            if (type === "discounts") {
                return (
                    <tr
                        key={row.index}
                        onClick={() =>
                            setID({
                                id: row.id,
                                status: row.status,
                                name: row.type,
                            })
                        }
                    >
                        <td className={" text-left"}>{row.type}</td>
                        <td className={" text-left"}>
                            {row.discount_subs.length !== 0 &&
                                row.discount_subs.map((data) => {
                                    return (
                                        <>
                                            <span>{data.name}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>{row.status}</td>
                        <td className={" text-left"}>
                            {formatDateNoTime(row.valid_from) +
                                " - " +
                                formatDateNoTime(row.valid_to)}
                        </td>
                        <td className={" text-left"}>
                            {row.branches.length !== 0 &&
                                row.branches.map((data) => {
                                    return (
                                        <>
                                            <span>{data.branch_name}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>
                            {row.packages.length !== 0 &&
                                row.packages.map((data) => {
                                    return (
                                        <>
                                            <span>{data.package}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>{row.category}</td>
                    </tr>
                );
            }

            if (type === "discounts-common") {
                return (
                    <tr
                        key={row.index}
                        onClick={() =>
                            setID({
                                id: row.id,
                                status: row.status,
                                name: row.type,
                            })
                        }
                    >
                        <td className={" text-left"}>{row.type}</td>
                        <td className={" text-left"}>
                            {row.discount_subs.length !== 0 &&
                                row.discount_subs.map((data) => {
                                    return (
                                        <>
                                            <span>{data.name}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>{row.status}</td>
                        <td className={" text-left"}>
                            {formatDateNoTime(row.valid_from) +
                                " - " +
                                formatDateNoTime(row.valid_to)}
                        </td>
                        <td className={" text-left"}>
                            {row.branches.length !== 0 &&
                                row.branches.map((data) => {
                                    return (
                                        <>
                                            <span>{data.branch_name}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                    </tr>
                );
            }

            if (type === "adjustments") {
                return (
                    <tr
                        key={row.index}
                        onClick={() =>
                            setID({
                                id: row.id,
                                status: row.status,
                                name: row.name,
                            })
                        }
                    >
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>{row.status}</td>
                        <td className={" text-left"}>{row.amount}</td>
                        <td className={" text-left"}>
                            {row.branches.length !== 0 &&
                                row.branches.map((data) => {
                                    return (
                                        <>
                                            <span>{data.branch_name}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>
                            {row.packages.length !== 0 &&
                                row.packages.map((data) => {
                                    return (
                                        <>
                                            <span>{data.package}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>
                            {formatDateNoTime(row.valid_from) +
                                " - " +
                                formatDateNoTime(row.valid_to)}
                        </td>
                        <td className={" text-left"}>{row.category}</td>
                        <td className={" text-left"}>
                            {formatDate(row.added_on)}
                        </td>
                        <td className={" text-left"}>{row.created_by}</td>
                    </tr>
                );
            }

            if (type === "surcharge") {
                return (
                    <tr
                        key={row.index}
                        onClick={() =>
                            setID({
                                id: row.id,
                                status: row.status,
                                name: row.name,
                            })
                        }
                    >
                        <td className={" text-left"}>{row.label}</td>
                        <td className={" text-left"}>{row.amount_type}</td>
                        <td className={" text-left"}>{row.status}</td>
                        {/** AMOUNT */}
                        {row.amount_type &&
                            row.amount_type.toLowerCase() === "per value" && (
                                <td className={" text-left"}>
                                    {row.per_value}
                                </td>
                            )}

                        {row.amount_type &&
                            row.amount_type.toLowerCase() === "per kilo" && (
                                <td className={" text-left"}>{row.per_kilo}</td>
                            )}

                        {row.amount_type &&
                            row.amount_type.toLowerCase() === "fixed" && (
                                <td className={" text-left"}>{row.fixed}</td>
                            )}

                        {/** VALUE RATE */}
                        {row.amount_type &&
                            row.amount_type.toLowerCase() === "per value" && (
                                <td className={" text-left"}>
                                    {row.value_rate}
                                </td>
                            )}

                        {row.amount_type &&
                            row.amount_type.toLowerCase() === "per kilo" && (
                                <td className={" text-left"}>{row.per_kilo}</td>
                            )}

                        {row.amount_type &&
                            row.amount_type.toLowerCase() === "fixed" && (
                                <td className={" text-left"}>{row.fixed}</td>
                            )}

                        <td className={" text-left"}>
                            {row.packages &&
                                row.packages.length !== 0 &&
                                row.packages.map((data) => {
                                    return (
                                        <>
                                            <span>{data.service}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>{row.parcel_type}</td>
                        <td className={" text-left"}>
                            {formatDate(row.added_on)}
                        </td>
                        <td className={" text-left"}>{row.created_by}</td>
                    </tr>
                );
            }

            if (type === "adjustments-common") {
                return (
                    <tr
                        key={row.index}
                        onClick={() =>
                            setID({
                                id: row.id,
                                status: row.status,
                                name: row.name,
                            })
                        }
                    >
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>{row.status}</td>
                        <td className={" text-left"}>{row.amount}</td>
                        <td className={" text-left"}>
                            {row.branches.length !== 0 &&
                                row.branches.map((data) => {
                                    return (
                                        <>
                                            <span>{data.branch_name}</span>
                                            <br />
                                        </>
                                    );
                                })}
                        </td>
                        <td className={" text-left"}>
                            {formatDateNoTime(row.valid_from) +
                                " - " +
                                formatDateNoTime(row.valid_to)}
                        </td>
                        <td className={" text-left"}>
                            {formatDate(row.added_on)}
                        </td>
                        <td className={" text-left"}>{row.created_by}</td>
                    </tr>
                );
            }

            if (type === "package-type") {
                return (
                    <tr key={row.index} onClick={() => setID(row.id)}>
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>{row.status}</td>
                        <td className={" text-left"}>{row.enumeration}</td>
                        <td className={" text-left"}>{row.dim_weight}</td>
                        <td className={" text-left"}>{row.max_weight}</td>
                        <td className={" text-left"}>{row.max_length}</td>
                        <td className={" text-left"}>{row.max_width}</td>
                        <td className={" text-left"}>{row.max_height}</td>
                    </tr>
                );
            }

            // if(type==='reports-daily-cash') {
            //     return <tr key={row.index}>
            //      {rowData.map((data, index) =>
            //     <td key={index} data-heading={data.key} className={data.val + " bold text-left"}>
            //         {Array.isArray(data.val) === true ? data.val.map((data,index) => {
            //             return <span key={index}><span>{data.name}</span><br/></span>
            //         }) : data.val}
            //     </td>)}
            //     </tr>
            // }

            if (type === "reports-daily-cash") {
                return (
                    <tr
                        key={row.index}
                        onClick={() =>
                            setID({
                                id: row.id,
                                status: row.status,
                                name: row.name,
                                transaction_table: row.transaction_table,
                                added_on: row.added_on,
                                ship_date: row.ship_date,
                                fedex_pickup: row.fedex_pickup,
                                ship_date: row.ship_date,
                            })
                        }
                    >
                        <td className={" text-left"}>
                            {formatDateNoTime(row.added_on)}
                        </td>
                        <td className={" text-left"}>
                            {row.pickup_confirmation}
                        </td>
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>{row.code}</td>
                        <td className={" text-left"}>{row.location_code}</td>
                        <td className={" text-left"}>{row.outlet_type}</td>
                        <td className={" text-left"}>{row.service_type}</td>
                        <td className={" text-left"}>{row.tender_type}</td>
                        <td className={" text-left"}>{row.tender_sub}</td>
                        <td className={" text-left"}>{row.tender_ref}</td>
                        <td className={" text-left"}>{row.awb_no}</td>
                        <td className={" text-left"}>{row.or_no}</td>
                        <td className={" text-left"}>
                            {row.sender_firstname + " " + row.sender_lastname}
                        </td>
                        {/* <td className={" text-left"}>{row.sender_lastname}</td> */}
                        <td className={" text-left"}>{row.base_rate}</td>
                        <td className={" text-left"}>{row.other_charges}</td>

                        {/* <td className={" text-left"}>{row.discount}</td>
                        <td className={" text-left"}>{row.discount_ref}</td>
                        <td className={" text-left"}>{row.adjustment_1_amount}</td>
                        <td className={" text-left"}>{row.adjustment_2_amount}</td> */}

                        <td className={" text-left"}>{row.vat}</td>
                        <td className={" text-left"}>{row.grand_total}</td>
                        <td className={" text-left"}>
                            {row.collection_amount}
                        </td>
                        <td className={" text-left"}>{row.amount_paid}</td>
                        <td className={" text-left"}>{row.commission}</td>
                        <td className={" text-left"}>{row.commission_vat}</td>
                        <td className={" text-left"}>{row.wtax_amount}</td>
                        <td className={" text-left"}>{row.net_amount}</td>
                        <td className={" text-left"}>{row.amount}</td>
                        <td className={" text-left"}>
                            {row.total_customs_value}
                        </td>
                    </tr>
                );
            }

            if (type === "reports-transaction") {
                return (
                    <tr key={row.index}>
                        {rowData.map((data, index) => (
                            <td
                                key={index}
                                data-heading={data.key}
                                className={" text-left"}
                            >
                                {Array.isArray(data.val) === true
                                    ? data.val.map((data, index) => {
                                          return (
                                              <span key={index}>
                                                  <span>{data.name}</span>
                                                  <br />
                                              </span>
                                          );
                                      })
                                    : Moment(data.val).isValid() && index === 1
                                    ? formatDate(data.val)
                                    : Moment(data.val).isValid() && index === 2
                                    ? formatDateNoTime(data.val)
                                    : data.val}
                            </td>
                        ))}
                    </tr>
                );
                // return <tr key={row.index} onClick={() => setID(row.id)}>
                //             <td className={" text-left"}>{row.id}</td>
                //             <td className={" text-left"}>{formatDateNoTime(row.added_on)}</td>
                //             <td className={" text-left"}>{formatDateNoTime(row.ship_date)}</td>
                //             <td className={" text-left"}>{row.outlet_type}</td>
                //             <td className={" text-left"}>{row.name}</td>
                //             <td className={" text-left"}>{row.code}</td>
                //             <td className={" text-left"}>{row.location_code}</td>
                //             <td className={" text-left"}>{row.service_name}</td>
                //             <td className={" text-left"}>{row.awb_no}</td>
                //             <td className={" text-left"}>{row.or_no}</td>
                //             <td className={" text-left"}>{row.transaction_no}</td>
                //             <td className={" text-left"}>{row.rc_description}</td>
                //             <td className={" text-left"}>{row.customer_name}</td>
                //             <td className={" text-left"}>{row.package_type}</td>
                //             <td className={" text-left"}>{row.total_weight}</td>
                //             <td className={" text-left"}>{row.total_customs_value}</td>
                //             <td className={" text-left"}>{row.base_rate}</td>

                //             <td className={" text-left"}>{row.custom_service}</td>
                //             <td className={" text-left"}>{row.FUEL}</td>
                //             <td className={" text-left"}>{row.PEAK}</td>
                //             <td className={" text-left"}>{row.OUT_OF_DELIVERY_AREA}</td>
                //             <td className={" text-left"}>{row.ADDITIONAL_HANDLING}</td>
                //             <td className={" text-left"}>{row.RESIDENTIAL_DELIVERY}</td>
                //             <td className={" text-left"}>{row.export_declaration}</td>
                //             <td className={" text-left"}>{row.INSURED_VALUE}</td>

                //             <td className={" text-left"}>{row.discount}</td>
                //             <td className={" text-left"}>{row.adjustment_1_amount}</td>
                //             <td className={" text-left"}>{row.adjustment_2_amount}</td>
                //             <td className={" text-left"}>{row.subtotal}</td>
                //             <td className={" text-left"}>{row.vat}</td>
                //             <td className={" text-left"}>{row.or_amount}</td>
                //             <td className={" text-left"}>{row.collection_amount}</td>
                //             <td className={" text-left"}>{row.ar_no}</td>

                //             <td className={" text-left"}>{row.commission}</td>
                //             <td className={" text-left"}>{row.commission_vat}</td>
                //             <td className={" text-left"}>{row.commission_wtax}</td>
                //             <td className={" text-left"}>{row.tender_type}</td>
                //             <td className={" text-left"}>{row.tender_sub}</td>
                //             <td className={" text-left"}>{row.tender_ref}</td>
                //             <td className={" text-left"}>{row.discount_type}</td>
                //             <td className={" text-left"}>{row.discount_sub}</td>
                //             <td className={" text-left"}>{row.discount_ref}</td>
                //             <td className={" text-left"}>{row.loyalty_type}</td>
                //             <td className={" text-left"}>{row.loyalty_sub}</td>
                //             <td className={" text-left"}>{row.loyalty_ref}</td>
                //             <td className={" text-left"}>{row.adjustment_1_title}</td>
                //             <td className={" text-left"}>{row.adjustment_2_title}</td>
                //             <td className={" text-left"}>{row.acct_description}</td>
                //             <td className={" text-left"}>{row.remarks_1}</td>
                //             <td className={" text-left"}>{row.remarks_2}</td>
                //             <td className={" text-left"}>{row.seg1}</td>
                //             <td className={" text-left"}>{row.seg2}</td>
                //             <td className={" text-left"}>{row.seg2}</td>
                //             <td className={" text-left"}>{row.seg4}</td>
                //             <td className={" text-left"}>{row.seg5}</td>
                //             <td className={" text-left"}>{row.seg6}</td>
                //             <td className={" text-left"}>{row.seg7}</td>
                //             <td className={" text-left"}>{row.seg8}</td>
                //             <td className={" text-left"}>{row.seg9}</td>
                //             <td className={" text-left"}>{row.seg10}</td>

                //         </tr>
            }

            if (type === "reports-daily-declaration") {
                return (
                    <tr key={row.index} onClick={() => setID(row.id)}>
                        <td className={" text-left"}>
                            {formatDateNoTime(row.transaction_date)}
                        </td>
                        <td className={" text-left"}>
                            {formatDateNoTime(row.deposit_date)}
                        </td>
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>{row.code}</td>
                        <td className={" text-left"}>{row.location_code}</td>
                        <td className={" text-left"}>{row.outlet_type}</td>
                        <td className={" text-left"}>{row.bank}</td>
                        <td className={" text-left"}>{row.bank_acc_no}</td>
                        <td className={" text-left"}>{row.ref_no}</td>
                        <td className={" text-left"}>{row.to_be_remitted}</td>
                        <td className={" text-left"}>{row.remitted_amount}</td>
                        <td className={" text-left"}>{row.overage}</td>
                        <td className={" text-left"}>{row.reasons}</td>
                        <td className={" text-left"}>{row.encoded_by}</td>
                    </tr>
                );
            }

            if (type === "loyalty-types") {
                return (
                    <tr key={row.index} onClick={() => setID(row.id)}>
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>
                            {row.loyalty_subs.map((data) => {
                                return (
                                    <>
                                        <span>{data.name}</span>
                                        <br />
                                    </>
                                );
                            })}
                        </td>
                    </tr>
                );
            }
            if (type === "natures") {
                return (
                    <tr key={row.index} onClick={() => setID(row.id)}>
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>
                            {formatDate(row.added_on)}
                        </td>
                        <td className={" text-left"}>{row.added_by}</td>
                    </tr>
                );
            }

            if (type === "ship-services") {
                return (
                    <tr key={row.index} onClick={() => setID(row.id)}>
                        <td className={" text-left"}>{row.name}</td>
                        <td className={" text-left"}>{row.status}</td>
                        <td className={" text-left"}>{row.enumeration}</td>
                    </tr>
                );
            }

            if (type === "tender-subtypes") {
                return (
                    <tr key={row.index} onClick={() => setID(row.id)}>
                        <td className={" text-left"}>{row.name}</td>
                    </tr>
                );
            } else {
                return (
                    <tr key={row.index}>
                        {rowData.map((data, index) => (
                            <td
                                key={index}
                                data-heading={data.key}
                                className={data.val + " bold text-left"}
                                onClick={() => setID(row.id)}
                            >
                                {Array.isArray(data.val) === true
                                    ? data.val.map((data, index) => {
                                          return (
                                              <span key={index}>
                                                  <span>{data.name}</span>
                                                  <br />
                                              </span>
                                          );
                                      })
                                    : data.val}
                            </td>
                        ))}
                    </tr>
                );
            }
        });

        const transactionNext = () => {
            var end = endTransactionIndex;
            var start = startTransactionIndex;

            //number of total columns
            if (endTransactionIndex <= 10) {
                setEndTransactionIndex(end + 6);
                setStartTransactionIndex(start + 6);
            }
        };

        const transactionPrev = () => {
            var end = endTransactionIndex;
            var start = startTransactionIndex;
            if (startTransactionIndex > 0) {
                setEndTransactionIndex(end - 6);
                setStartTransactionIndex(start - 6);
            }
        };

        const branchNext = () => {
            var end = endBranchIndex;
            var start = startBranchIndex;

            //number of total columns
            if (endBranchIndex <= subHeadingColumns.length - 1) {
                setEndBranchIndex(end + 4);
                setStartBranchIndex(start + 4);
            }
        };

        const branchPrev = () => {
            var end = endBranchIndex;
            var start = startBranchIndex;
            if (startBranchIndex > 0) {
                setEndBranchIndex(end - 4);
                setStartBranchIndex(start - 4);
            }
        };

        //TRANSACTION TABLE
        if (type === "transaction") {
            return (
                <div className="table-container transaction-table-cont">
                    <div className="search-table-container row"></div>
                    <table className={tableClass + " max-width"}>
                        <thead>
                            <tr>
                                <th className="first-index">BRANCH</th>
                                {subHeadingColumns
                                    .slice(
                                        startTransactionIndex,
                                        endTransactionIndex
                                    )
                                    .map((data, index) => {
                                        return (
                                            <th key={index}>
                                                {index == 0 && (
                                                    <button
                                                        className="previous-nav-btn"
                                                        onClick={() =>
                                                            transactionPrev()
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"angle-left"}
                                                            alt={"open"}
                                                            className={
                                                                "nav-icon"
                                                            }
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                )}
                                                {isReady && useLoader ? (
                                                    data
                                                ) : (
                                                    <TableLoader
                                                        tableHeaders={
                                                            headingColumns
                                                        }
                                                    />
                                                )}
                                                {index ==
                                                    subHeadingColumns.slice(
                                                        startTransactionIndex,
                                                        endTransactionIndex
                                                    ).length -
                                                        1 && (
                                                    <button
                                                        className="next-nav-btn"
                                                        onClick={() =>
                                                            transactionNext()
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"angle-right"}
                                                            alt={"open"}
                                                            className={
                                                                "nav-icon"
                                                            }
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                )}
                                            </th>
                                        );
                                    })}
                            </tr>
                        </thead>
                        <tbody>{data}</tbody>
                    </table>
                    {/* <TableFooter range={range} slice={slice} setPage={setPage} page={page} footerclassName={givenClass} setRowsPerPage={setRowsPerPage} rowsPerPage={rowsPerPage}/> */}
                </div>
            );
        }

        //BRANCHES TABLE
        if (
            type === "branches" ||
            type === "users" ||
            type === "announcements"
        ) {
            return (
                <div className="table-container transaction-table-cont">
                    <div className="search-table-container row"></div>
                    <table
                        className={tableClass + " max-width" + " table-loader"}
                    >
                        <thead>
                            <tr>
                                {headingColumns.map((data, index) => {
                                    return <th key={index}>{data}</th>;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {!isReady && useLoader ? (
                                <TableLoader tableHeaders={headingColumns} />
                            ) : (
                                data
                            )}
                        </tbody>
                    </table>
                    <TableFooter
                        range={range}
                        slice={slice}
                        setPage={setPage}
                        page={page}
                        footerclassName={givenClass}
                        setRowsPerPage={setRowsPerPage}
                        rowsPerPage={rowsPerPage}
                    />
                </div>
            );
        }

        //COMMON TABLE
        else {
            return (
                <div className="table-container transaction-table-cont">
                    <div className="search-table-container row"></div>
                    <table
                        className={tableClass + " max-width" + " table-loader"}
                    >
                        <thead className="table-border">
                            <tr>
                                {headingColumns.map((data, index) => {
                                    return (
                                        // <div className="table-border">
                                        <th key={index} className="text-left">
                                            {data}
                                        </th>
                                        // </div>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {!isReady && useLoader ? (
                                <TableLoader
                                    tableHeaders={headingColumns}
                                    data={data}
                                />
                            ) : (
                                data
                            )}
                        </tbody>
                    </table>
                    <TableFooter
                        range={range}
                        slice={slice}
                        setPage={setPage}
                        page={page}
                        footerclassName={givenClass}
                        setRowsPerPage={setRowsPerPage}
                        rowsPerPage={rowsPerPage}
                    />
                </div>
            );
        }
    }
}

Table.propTypes = {
    tableData: PropTypes.arrayOf(PropTypes.object).isRequired,
    headingColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
    breakOn: PropTypes.oneOf(["small", "medium", "large"]),
};

export default Table;
