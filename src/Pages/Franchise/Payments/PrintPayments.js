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
    getTodayDateISO
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import moment from "moment";
import "./../Franchise.css";
import cleanLogo from "../../../Assets/Images/Login/logo.png";
import signature from "../../../Assets/Images/signature.png";

import { getAllFranchisee, getSingleFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { getAllReceivables, getReceivable, searchReceivables, searchFranchisee, getAllReceivablesDate, getAllPayments } from "../../../Helpers/apiCalls/Franchise/ReceivablesApi";
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
        to:getTodayDate(),
        from:getTodayDate()
    });

    // VIEW SALES MODAL
    const [showViewSaleModal, setShowViewSaleModal] = useState(false);
    const handleShowViewSaleModal = (id) => {
        setShowViewSaleModal(true)
    };
    const handleCloseViewSaleModal = () => setShowViewSaleModal(false);

    // VIEW SALES BILLING MODAL
    const [showViewSaleBillingModal, setShowViewSaleBillingModal] = useState(false);
    const handleShowViewSaleBillingModal = (id) => {
        setShowViewSaleBillingModal(true)
    };
    const handleCloseViewSaleBillingModal = () => setShowViewSaleBillingModal(false);

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
                fetchAllPayments(data.branch_id)
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

    async function fetchAllPayments(branch_id) {
        setShowLoader(true);
        setSalesData([]);
        setSalesBillingData([]);
        const response = await getAllPayments(branch_id);
        if (response.data) {
            response.data.payments?.map((data, i) => {
                var receive = data;
                setSalesData((prev) => [...prev, receive]);
            });
        }
        setIsSet(true)

        setShowLoader(false);
    }

    function handleSetReceivable() {
        var filterFranchisee = franchiseesData.map((data) => {
            var fran = data;
            var filter = salesData.filter((receive) => {
                return receive.branch_id === data.branch_id;
            });

            filter.map((r, i) => {
                var zero = 0;
                if (i === 0) {
                    fran.total = numberFormat(parseFloat(r.amount? r.amount : "0").toFixed(2));
                } else {
                    fran.total = numberFormat(parseFloat(fran.total.replace(/,/g, '')) +
                        parseFloat(r.amount? r.amount.replace(/,/g, '') : "0"))
                    ;
                    fran.sale = numberFormat(parseFloat(fran.total.replace(/,/g, '')) +
                        parseFloat(r.amount? r.amount.replace(/,/g, '') : "0"))
                    ;
                }

            });
            return fran;
        });
        setFranchiseesData(filterFranchisee);
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
    
    const [allTotal, setAllTotal] = useState(0)
    async function fetchPayment(branch_id) {
        setShowLoader(true);
        setSalesData([]);
        setSalesBillingData([]);
        const response = await getAllPayments(branch_id);
        if (response.data) {
            response.data.payments?.map((data) => {
                var receive = data;
                setSalesData((prev) => [...prev, receive]);
            });
        }
        setShowLoader(false);
    }


    function handleSelectChange(e, row) {
        console.log(e)
        console.log(row)
        console.log(e.target.role, e.target.id)

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
        console.log(row)
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
        console.log(row)
        return (
            <span className="me-4 align-middle ps-label"
            onClick={() => handleViewContract(row.id)} 
            >
                {row.contract}
            </span>
        );
    }
    function handleViewContract(id) {
        {window.open('/franchise/print/' + id)};
    }

    function SaleBtn(row) {
        return (
            <span className="me-4 align-middle ps-label"
            onClick={() => handleShowViewSaleModal(row.branch_id)} 
            >
                {row.sale}
            </span>
        );
    }

    function SaleBillingBtn(row) {
        return (
            <span className="me-4 align-middle ps-label"
            onClick={() => handleShowViewSaleBillingModal(row.branch_id)} 
            >
                {row.sale_billing}
            </span>
        );
    }

    function handleViewBtn(id, type) {
        if (type === "sales") {
            {window.open('/salesinvoice/print/' + id)};
        }
        if (type === "sales_billing") {
            {window.open('/franchisebilling/view/' + id)};
        }
    }
    console.log(isSet)
    
    function renderFranchiseeSalesTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Added On</th>
                        <th>Paid Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {isSet && salesData.length !== 0 ? 
                        salesData.map((item) => {
                            return (
                                <tr>
                                    <td>{dateFormat(item.added_on)}</td>
                                    <td>{numberFormat(item.amount? item.amount : "0")}</td>
                                </tr>
                            );
                        })
                        :
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    }
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
    }, [salesData]);


    React.useEffect(() => {
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

                <div className={`container ${inactive ? "inactive" : "active"}`}>
                    <div className="print-container px-3 py-2" id="printablediv">
                        <div className="text-end print-header d-flex flex-column">
                            <span className="text-uppercase">
                                {moment(getTodayDateISO()).format("MMMM DD, yyyy")}
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
                            <div className="d-flex my-2 mt-3 align-items-center">
                                <Col xs={12} className="print-data">
                                    SALES
                                </Col>
                            </div>
                            <div className="d-flex mt-5 mb-2 justify-content-evenly">
                                {/* table */}
                                <div className="print-table mt-3 mx-2">
                                    {isSet && salesData.length!== 0? renderFranchiseeSalesTable() : renderEmptyTable()}
                                </div>
                            </div>

                            <Row className="print-grand-total my-3 text-end">
                                <Col xs={3} className="print-table-footer-label">
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
                                    <span className="text-center text-uppercase nc-modal-custom-text">SAMPLE NAME</span>
                                </div>
                                <div className="d-flex align-items-center justify-content-center flex-column">
                                    <img src={signature} className="print-logo" />
                                    <span className="text-center text-uppercase nc-modal-custom-text">KRISTOFFER CHAN</span>
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
                    <div className="d-flex justify-content-end my-4 pb-5">
                        <button
                            className="button-secondary me-3"
                            onClick={() => navigate("/payments")}
                        >
                            Close
                        </button>
                        <button className="button-primary" onClick={handlePrint}>
                            Print
                        </button>
                    </div>
                </div>
            </div>        
        </div>
    );
}
