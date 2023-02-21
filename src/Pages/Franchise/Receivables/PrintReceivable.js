import React, { useState } from "react";
import { Col, Form, Row, Tab, Tabs, Container, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import TableTemp from "../../../Components/TableTemplate/Table";
import {
    dateFormat,
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    getTodayDateISO,
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import moment from "moment";
import "./../Franchise.css";
import cleanLogo from "../../../Assets/Images/Login/logo.png";
import signature from "../../../Assets/Images/signature.png";

import {
    getAllFranchisee,
    getSingleFranchisee,
} from "../../../Helpers/apiCalls/franchiseeApi";
import {
    getAllReceivables,
    getReceivable,
    searchReceivables,
    searchFranchisee,
    getAllReceivablesDate,
} from "../../../Helpers/apiCalls/Franchise/ReceivablesApi";
import ViewModal from "../../../Components/Modals/ViewModal";

export default function Receivables() {
    const { id } = useParams();
    let navigate = useNavigate();

    /* delete modal handler */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const [paymentDeets, setPaymentDeets] = useState({ id: "", payment: "" });
    const [filterDate, setFilterDate] = useState({
        to: getTodayDate(),
        from: getTodayDate(),
    });

    // VIEW SALES MODAL
    const [showViewSaleModal, setShowViewSaleModal] = useState(false);
    const handleShowViewSaleModal = (id) => {
        fetchReceivable(id);
        setShowViewSaleModal(true);
    };
    const handleCloseViewSaleModal = () => setShowViewSaleModal(false);

    // VIEW SALES BILLING MODAL
    const [showViewSaleBillingModal, setShowViewSaleBillingModal] =
        useState(false);
    const handleShowViewSaleBillingModal = (id) => {
        fetchReceivable(id);
        setShowViewSaleBillingModal(true);
    };
    const handleCloseViewSaleBillingModal = () =>
        setShowViewSaleBillingModal(false);

    const [franchisees, setFranchisees] = useState([]);
    const [franchiseesData, setFranchiseesData] = useState([]);
    const [receivableData, setReceivableData] = useState([]);
    const [ContractData, setContractData] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [salesBillingData, setSalesBillingData] = useState([]);
    const [isSet, setIsSet] = useState(false);

    async function fetchFranchisee() {
        setShowLoader(true);
        const response = await getSingleFranchisee(id);
        if (response.error) {

        } else {
            setFranchisees(response.data.data);
            var allFranchisee = response.data.data.map((data) => {
                fetchAllReceivables(data.branch_id);
                var franchise = data;
                franchise.franchise_name = data.name;
                franchise.franchise = data.name;
                franchise.contract = "0";
                franchise.sale = "0";
                franchise.sale_billing = "0";
                return franchise;
            });
            setFranchiseesData(allFranchisee);
        }
        setShowLoader(false);
    }

    const [inactive, setInactive] = useState(true);
    const [dateto, setDateto] = useState("");
    const [datefrom, setDatefrom] = useState("");

    const [showLoader, setShowLoader] = useState(false);

    async function fetchAllReceivables(branch_id) {
        setShowLoader(true);
        const response = await getAllReceivables(branch_id);
        if (response.data) {
            var receivables = response.data.receivables.map((data) => {
                var receive = data;
                receive.type = data.type;
                receive.balance = data.balance;
                return receive;
            });
            setReceivableData(receivables);
        }
        setShowLoader(false);
    }

    async function handlePrint() {
        toast.loading("Printing receivables...", { style: toastStyle() });
        setTimeout(() => {
            toast.dismiss();
            Print();
        }, 1000);
    }

    function Print() {
        let printContents = document.getElementById("printablediv").innerHTML;
        let originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print(printContents);
        document.body.innerHTML = originalContents;
        refreshPage();
    }

    const [allTotal, setAllTotal] = useState(0);
    async function fetchReceivable() {
        setShowLoader(true);
        setSalesData([]);
        setSalesBillingData([]);
        const response = await getReceivable(franchiseesData[0].branch_id);
        if (response.data) {
            response.data.receivables.map((data, i) => {

                var receive = data;
                var zero = 0;
                if (i === 0) {
                    setAllTotal(parseFloat(data.balance));
                    receive.total = parseFloat(data.balance);
                } else {
                    setAllTotal(
                        parseFloat(allTotal) + parseFloat(data.balance)
                    );
                    receive.total =
                        parseFloat(allTotal) + parseFloat(data.balance);
                }

                if (data.type === "franchisee") {
                    setContractData((prev) => [...prev, receive]);
                } else if (data.type === "franchisee_sale") {
                    setSalesData((prev) => [...prev, receive]);
                } else if (data.type === "franchisee_sale_billing") {
                    setSalesBillingData((prev) => [...prev, receive]);
                }
            });
            setIsSet(true);
        }
        setShowLoader(false);
    }

    function handleSelectChange(e, row) {

        if (e.target.value === "edit-ps") {
            navigate(
                "/se/paysuppliers/edit/" + row.id + "/" + row.payment_mode
            );
        } else if (e.target.value === "delete-ps") {
            handleShowDeleteModal();
            setPaymentDeets({ id: row.id, payment: row.payment_mode });
        } else if (e.target.value === "view-ps") {
            navigate(
                "/se/paysuppliers/view/" + row.id + "/" + row.payment_mode
            );
        } else if (e.target.value === "approve-ps") {
            navigate("/se/paysuppliers/approve/" + row.id);
        }
    }
    
    function handleSetReceivable() {
        var filterFranchisee = franchiseesData.map((data) => {
            var fran = data;
            var filter = receivableData.filter((receive) => {
                return receive.branch_id === data.branch_id;
            });

            filter.map((r, i) => {
                var zero = 0;
                if (i === 0) {
                    fran.total = numberFormat(parseFloat(r.balance).toFixed(2));
                } else {
                    fran.total = numberFormat(parseFloat(fran.total.replace(/,/g, '')) +
                        parseFloat(r.balance.replace(/,/g, '')))
                    ;
                }
                if (r.type === "franchisee_sale_billing") {
                    fran.sale_billing = numberFormat(r.balance);
                } else if (r.type === "franchisee_sale") {
                    fran.sale = numberFormat(r.balance);
                } else if (r.type === "franchisee") {
                    fran.contract = numberFormat(r.balance);
                }
            });
            return fran;

        });
        setFranchiseesData(filterFranchisee);
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                role={row.payment_mode}
                id={row.id}
                className="PO-select-action"
                onChange={(e) => handleSelectChange(e, row)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                {type === "pending" ? (
                    <option value="edit-ps" className="color-options">
                        Edit
                    </option>
                ) : null}
                <option value="view-ps" className="color-options">
                    View
                </option>
                {type === "approved" ? (
                    <option value="reprint-ps" className="color-options">
                        Reprint
                    </option>
                ) : null}
                <option value="delete-ps" className="color-red">
                    Delete
                </option>
            </Form.Select>
        );
    }

    function PrintBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row.id)}
            >
                Print
            </button>
        );
    }

    function ContractBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleViewContract(row.id)}
            >
                {row.contract}
            </span>
        );
    }
    function handleViewContract(id) {
        {
            window.open("/franchise/print/" + id);
        }
    }

    function SaleBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleShowViewSaleModal(row.branch_id)}
            >
                {row.sale}
            </span>
        );
    }

    function SaleBillingBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label"
                onClick={() => handleShowViewSaleBillingModal(row.branch_id)}
            >
                {row.sale_billing}
            </span>
        );
    }

    function handleViewBtn(id, type) {
        if (type === "sales") {
            {
                window.open("/salesinvoice/print/" + id);
            }
        }
        if (type === "sales_billing") {
            {
                window.open("/franchisebilling/view/" + id);
            }
        }
    }

    function renderFranchiseeTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Invoice Date</th>
                        <th>Invoice No.</th>
                        <th>Grand Total</th>
                        <th>Paid Amount</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {isSet && ContractData.length !== 0 ? (
                        ContractData.filter((v, i) => {
                            return ContractData.map((val) => val.id).indexOf(v.id) == i;
                        })
                        .map((item) => {
                            return (
                                <tr>
                                    <td>{dateFormat(item.added_on)}</td>
                                    <td>{item.id}</td>
                                    <td>{numberFormat(item.grand_total)}</td>
                                    <td>{numberFormat(item.paid_amount)}</td>
                                    <td>{numberFormat(item.balance)}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    }

    function renderFranchiseeSalesTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Invoice Date</th>
                        <th>Invoice No.</th>
                        <th>Grand Total</th>
                        <th>Paid Amount</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {isSet && salesData.length !== 0 ? (
                        salesData.filter((v, i) => {
                            return salesData.map((val) => val.id).indexOf(v.id) == i;
                        })
                        .map((item) => {
                            return (
                                <tr>
                                    <td>{dateFormat(item.added_on)}</td>
                                    <td>{item.id}</td>
                                    <td>{numberFormat(item.grand_total)}</td>
                                    <td>{numberFormat(item.paid_amount)}</td>
                                    <td>{numberFormat(item.balance)}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    }

    function renderFranchiseeSalesBillingTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Invoice No.</th>
                        <th>Grand Total</th>
                        <th>Paid Amount</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {isSet && salesBillingData.length !== 0 ? (
                        salesBillingData.filter((v, i) => {
                            return salesBillingData.map((val) => val.id).indexOf(v.id) == i;
                        })
                        .map((item) => {
                            return (
                                <tr>
                                    <td>{new Date(item.month).toLocaleDateString("en-us",{ month:"long"}) + " " + new Date(item.month).getFullYear()} </td>
                                    <td>{item.id}</td>
                                    <td>{numberFormat(item.grand_total)}</td>
                                    <td>{numberFormat(item.paid_amount)}</td>
                                    <td>{numberFormat(item.balance)}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </Table>
        );
    }

    function renderEmptyTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <td>{"NO DATA FOUND!"}</td>
                    </tr>
                </thead>
            </Table>
        );
    }

    React.useEffect(() => {
        fetchFranchisee();
    }, []);
    
    React.useEffect(() => {
        handleSetReceivable();
    }, [receivableData]);

    React.useEffect(() => {
        fetchReceivable();
    }, [franchiseesData]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"FRANCHISE"}
                />

                <div
                    className={`container ${inactive ? "inactive" : "active"}`}
                >
                    <div
                        className="print-container px-3 py-2"
                        id="printablediv"
                    >
                        <div className="text-end print-header d-flex flex-column">
                            <span>
                                STATEMENT OF ACCOUNT 
                            </span>
                            <span className="text-uppercase">
                                {moment(getTodayDateISO()).format(
                                    "MMMM DD, yyyy"
                                )}
                            </span>
                        </div>
                        <div className="d-flex justify-content-center py-1">
                            <img src={cleanLogo} className="print-logo" />
                        </div>

                        {/* content */}
                        <div className="print-body mt-5">
                            <Row>
                                <Col>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Franchisee:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {franchiseesData[0]?.franchise_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Branch Name:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {franchiseesData[0]?.branch_name}
                                        </Col>
                                    </div>
                                    <div className="d-flex my-2 align-items-center">
                                        <Col xs={4} className="print-label">
                                            Address:
                                        </Col>
                                        <Col xs={7} className="print-data">
                                            {franchiseesData[0]?.address}
                                        </Col>
                                    </div>
                                </Col>
                            </Row>

                            {isSet && ContractData.length !== 0 ?
                               (<>
                                    <div className="d-flex my-2 mt-3 align-items-center">
                                        <Col xs={12} className="print-data">
                                            CONTRACT
                                        </Col>
                                    </div>
                                    <div className="d-flex mt-1 mb-2 justify-content-evenly">
                                        <div className="print-table mx-2">
                                            {renderFranchiseeTable()}
                                        </div>
                                    </div>
                                </>) : ""
                            }

                            {isSet && salesData.length !== 0 ?
                                (<>
                                    <div className="d-flex my-2 mt-3 align-items-center">
                                        <Col xs={12} className="print-data">
                                            SALES
                                        </Col>
                                    </div>
                                    <div className="d-flex mt-1 mb-2 justify-content-evenly">
                                        {/* table */}
                                        <div className="print-table mt-3 mx-2">
                                            {renderFranchiseeSalesTable()}
                                        </div>
                                    </div>
                                </>) : ""
                            }
                            
                            {isSet && salesBillingData.length !== 0 ?
                                (<>
                                    <div className="d-flex my-2 mt-3 align-items-center">
                                        <Col xs={12} className="print-data">
                                            MONTHLY BILLABLES
                                        </Col>
                                    </div>
                                    <div className="d-flex mt-1 mb-2 justify-content-evenly">
                                        {/* table */}
                                        <div className="print-table mt-3 mx-2">
                                            {renderFranchiseeSalesBillingTable()}
                                        </div>
                                    </div>
                                </>) : ""
                            }

                            <Row className="print-grand-total my-3 text-end">
                                <Col
                                    xs={3}
                                    className="print-table-footer-label"
                                >
                                    GRAND TOTAL
                                </Col>
                                <Col
                                    xs={2}
                                    className="print-table-footer-data text-left"
                                >
                                    PHP{" "}
                                    {franchiseesData[0]?.total
                                        ? (franchiseesData[0].total)
                                        : "0.00"}
                                </Col>
                            </Row>
                            <div className="print-signatures">
                                <div className="d-flex align-items-center justify-content-end flex-column">
                                    <span className="text-center text-uppercase nc-modal-custom-text">
                                        SAMPLE NAME
                                    </span>
                                </div>
                                <div className="d-flex align-items-center justify-content-center flex-column">
                                    <img
                                        src={signature}
                                        className="print-logo"
                                    />
                                    <span className="text-center text-uppercase nc-modal-custom-text">
                                        KRISTOFFER CHAN
                                    </span>
                                </div>
                            </div>
                            <div className="print-signatories pb-4 mb-4">
                                <span>Prepared by</span>
                                <span>Approved by</span>
                            </div>
                            <div className="print-signatures">
                                <span className="text-center text-uppercase print-label fw-bold">
                                </span>
                            </div>
                            <div className="print-signatories pb-4 mb-4">
                                <span>Noted by (Client)</span>
                            </div>
                        </div>
                    </div>

                    {/* footer */}
                    <div className="d-flex justify-content-end my-4 pb-5 d-flex-responsive">
                        <button
                            className="button-secondary me-3"
                            onClick={() => navigate("/receivables")}
                        >
                            Close
                        </button>
                        <button
                            className="button-primary"
                            onClick={handlePrint}
                        >
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
