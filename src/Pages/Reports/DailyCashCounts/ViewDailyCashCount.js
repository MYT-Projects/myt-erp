import React, { useState } from "react";
import { Fragment } from "react";
import { Col, Form, Row, Tab, Tabs, Table } from "react-bootstrap";
import toast from "react-hot-toast";
import Select from "react-select";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Delete from "../../../Components/Modals/DeleteModal";
import Navbar from "../../../Components/Navbar/Navbar";
import TableTemp from "../../../Components/TableTemplate/Table";
import AdjustmentTable from "./../../Inventory/Adjustment/AdjustmentTable";
import {
    dateFormat,
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    getType,
    TokenExpiry
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";
import cleanLogo from "../../../Assets/Images/Login/logo.png";
import signature from "../../../Assets/Images/signature.png";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { getCashCount, getCashCountReport } from "../../../Helpers/apiCalls/Reports/DailyCashCountApi";


export default function ViewDailyCashCount() {
    const { id } = useParams();
    const { state } = useLocation();
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({})
    const [franchisees, setFranchisees] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [sales, setSales] = useState([]);
    const [deposit, setDeposit] = useState([]);
    const [changeFunds, setChangeFunds] = useState([]);
    const [dailySales, setDailySales] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);

    const dummy = {
        id: "1",
        branch: "SM CITY CEBU",
        date: "December 2022",
        prepared_by: "Jeno",
    }
    

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        console.log(name, value)
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function renderDepositTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Denomination</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td> PHP 1,000 </td>
                        <td> {deposit?.bill_1000} </td>
                        <td> {numberFormat(parseFloat(deposit?.bill_1000) * 1000)} </td>
                    </tr>
                    <tr>
                        <td> PHP 500 </td>
                        <td> {deposit?.bill_500} </td>
                        <td> {numberFormat(parseFloat(deposit?.bill_500) * 500)} </td>
                    </tr>
                    <tr>
                        <td> PHP 200 </td>
                        <td> {deposit?.bill_200} </td>
                        <td> {numberFormat(parseFloat(deposit?.bill_200) * 200)} </td>
                    </tr>
                    <tr>
                        <td> PHP 100 </td>
                        <td> {deposit?.bill_100} </td>
                        <td> {numberFormat(parseFloat(deposit?.bill_100) * 100)} </td>
                    </tr>
                    <tr>
                        <td> PHP 50 </td>
                        <td> {deposit?.bill_50} </td>
                        <td> {numberFormat(parseFloat(deposit?.bill_50) * 50)} </td>
                    </tr>
                    <tr>
                        <td> PHP 20 </td>
                        <td> {deposit?.bill_20} </td>
                        <td> {numberFormat(parseFloat(deposit?.bill_20) * 20)} </td>
                    </tr>
                    <tr>
                        <td> PHP 10 </td>
                        <td> {deposit?.coin_10} </td>
                        <td> {numberFormat(parseFloat(deposit?.coin_10) * 10)} </td>
                    </tr>
                    <tr>
                        <td> PHP 5  </td>
                        <td> {deposit?.coin_5} </td>
                        <td> {numberFormat(parseFloat(deposit?.coin_5) * 5)} </td>
                    </tr>
                    <tr>
                        <td> PHP 1  </td>
                        <td> {deposit?.coin_1} </td>
                        <td> {numberFormat(parseFloat(deposit?.coin_1) * 1)} </td>
                    </tr>
                    <tr>
                        <td> PHP 25 Cent </td>
                        <td> {deposit?.cent_25} </td>
                        <td> {numberFormat(parseFloat(deposit?.cent_25) * 25)} </td>
                    </tr>
                </tbody>
            </Table>
        );
    }
    function renderChangeFundsTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Demomination</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td> PHP 1,000 </td>
                        <td> {changeFunds?.bill_1000} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.bill_1000) * 1000))} </td>
                    </tr>
                    <tr>
                        <td> PHP 500 </td>
                        <td> {changeFunds?.bill_500} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.bill_500) * 500))} </td>
                    </tr>
                    <tr>
                        <td> PHP 200 </td>
                        <td> {changeFunds?.bill_200} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.bill_200) * 200))} </td>
                    </tr>
                    <tr>
                        <td> PHP 100 </td>
                        <td> {changeFunds?.bill_100} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.bill_100) * 100))} </td>
                    </tr>
                    <tr>
                        <td> PHP 50 </td>
                        <td> {changeFunds?.bill_50} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.bill_50) * 50))} </td>
                    </tr>
                    <tr>
                        <td> PHP 20 </td>
                        <td> {changeFunds?.bill_20} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.bill_20) * 20))} </td>
                    </tr>
                    <tr>
                        <td> PHP 10  </td>
                        <td> {changeFunds?.coin_10} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.coin_10) * 10))} </td>
                    </tr>
                    <tr>
                        <td> PHP 5  </td>
                        <td> {changeFunds?.coin_5} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.coin_5) * 5))} </td>
                    </tr>
                    <tr>
                        <td> PHP 1  </td>
                        <td> {changeFunds?.coin_1} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.coin_1) * 1))} </td>
                    </tr>
                    <tr>
                        <td> PHP 25 Cent </td>
                        <td> {changeFunds?.cent_25} </td>
                        <td> {numberFormat((parseFloat(changeFunds?.cent_25) * 25))} </td>
                    </tr>
                </tbody>
            </Table>
        );
    }

    function Print() {
        let printContents = document.getElementById("printablediv").innerHTML;
        let originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print(printContents);
        document.body.innerHTML = originalContents;
        refreshPage();
    }

    async function handlePrint() {
        toast.loading("Printing sales invoice...", { style: toastStyle() });
        setTimeout(() => {
            toast.dismiss();
            Print();
        }, 1000);
    }

    async function fetchData() {
        setShowLoader(true);
        setSales([])
        setDailySales([])

        const response = await getCashCount(id);
        console.log(response);

        if (response.error) {
            console.log(response);
        } else {

            var allBills = response.data.data.map((bill) => {
                console.log(bill)
                var info = bill;
                return info;
            });
            var dailysales = response.data.daily_sale;
            setSales(allBills)
        }
        setShowLoader(false);
    }

    async function fetchReport() {
        setShowLoader(true);
        setSales([])
        setDailySales([])

        const response = await getCashCountReport(id, state.date);
        console.log(response);

        if (response.error) {
            console.log(response);
        } else {

            var deposit = response.data.deposit[0]
            var changefunds = response.data.change_funds[0]
            var dailysales = response.data.daily_sales[0]
            setDeposit(deposit)
            setChangeFunds(changefunds)
            setDailySales(dailysales)
        }
        setShowLoader(false);
    }
    console.log(deposit);
    console.log(changeFunds);
    console.log(dailySales);


    React.useEffect(() => {
        // fetchData();
        fetchReport();
    }, []);


    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"DS REPORTS"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="print-container px-3 py-2" id="printablediv">
                    <div className="d-flex justify-content-center py-1">
                        <img src={cleanLogo} className="print-logo" />
                    </div>
                    <div className="d-flex justify-content-center py-1 ">
                        <h5 className="print-header">
                            DAILY CASH COUNT
                        </h5>
                    </div>

                    {/* content */}
                    <div className="print-body mt-5 justify-content-start">
                        <Row className="d-flex align-items-start">
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Branch:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dailySales?.branch_name ? dailySales.branch_name : ""}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Prepared By:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dailySales?.preparer_name ? dailySales.preparer_name : ""}
                                    </Col>
                                </div>
                            </Col>
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Date:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {formatDateNoTime(dailySales?.date)}
                                    </Col>
                                </div>
                            </Col>
                        </Row>
                        <div className="d-flex mt-1 justify-content-left">
                            <Col xs={6}>
                                <span className="edit-label">
                                    CASH DEPOSIT
                                </span>
                            </Col>
                            <Col xs={6}>
                                <span className="edit-label">
                                    CHANGE FUNDS
                                </span>
                            </Col>
                        </div>
                        <div className="d-flex mt-2 mb-2 justify-content-evenly">
                            {/* table */}
                            <div className="print-table mt-3 mx-2">
                                {renderDepositTable()}
                            </div>
                            <div className="print-table mt-3 mx-2">
                                {renderChangeFundsTable()}
                            </div>
                        </div>
                        <div className="d-flex mx-2 mt-2 mb-2 justify-content-evenly">
                            <Col xs={6}>
                                <Row className="text-end">
                                    <div className="d-flex my-2 justify-content-end ">
                                        <Col className="print-data">
                                            Total Cash Deposit: {deposit.total_count ? numberFormat(deposit.total_count) : "0.00" }
                                        </Col>
                                    </div>
                                </Row>
                            </Col>
                            <Col xs={6}>
                                <Row className="text-end">
                                    <div className="d-flex my-2 justify-content-end ">
                                        <Col className="print-data">
                                            Total Cash in Drawer: {changeFunds.total_count ? numberFormat(changeFunds.total_count) : "0.00" }
                                        </Col>
                                    </div>
                                </Row>
                                <Row className="text-end">
                                    <div className="d-flex my-2 justify-content-end ">
                                        <Col className="print-data">
                                            Initial Cash in Drawer: {dailySales.initial_cash_in_drawer ? numberFormat(dailySales.initial_cash_in_drawer) : "0.00" }
                                        </Col>
                                    </div>
                                </Row>
                            </Col>
                        </div>
                        <div>
                            <Row className="review-container d-flex mb-1 justify-content-center p-3 mx-2">
                                <Row className=" justify-content-center">
                                    <Row>
                                        <span className="edit-label">
                                            TOTAL CASH SALES
                                        </span>
                                    </Row>
                                    <Col xs={5} className='p-2 m-1'>
                                        <Row>
                                            <Col xs={6}></Col>
                                            <Col className="text-end" xs={3}><span className="print-data justify-content-center green">Remitted</span></Col>
                                            <Col className="text-end" xs={3}><span className="print-data justify-content-center green">System</span></Col>
                                        </Row>
                                        <Row className="mt-1">
                                            <Col xs={6}><span className="print-data justify-content-center green"></span></Col>
                                            <Col className="text-end" xs={3}><span className="print-data text-end">{dailySales ? numberFormat(dailySales.actual_cash_sales) : ''}</span></Col>
                                            <Col className="text-end" xs={3}><span className="print-data text-end">{dailySales ? numberFormat(dailySales.system_cash_sales) : ''}</span></Col>
                                        </Row>
                                        <Row className="mt-1">
                                            <Col xs={6}><span className="print-data justify-content-center green">Total Expense</span></Col>
                                            <Col className="text-end" xs={3}><span className="print-data text-end">+{dailySales.total_expense ? numberFormat(dailySales.total_expense) : '0.00'}</span></Col>
                                            <Col className="text-end" xs={3}><span className="print-data text-end">-{dailySales.total_expense ? numberFormat(dailySales.total_expense) : '0.00'}</span></Col>
                                        </Row>
                                        <hr/>
                                        <Row className="mt-1">
                                            <Col xs={6}><h5 className="print-data"></h5></Col>
                                            <Col className="text-end" xs={3}><span className="print-data text-end green">{dailySales ? numberFormat(parseFloat(dailySales.actual_cash_sales) + parseFloat(dailySales.total_expense)) : ''}</span></Col>
                                            <Col className="text-end" xs={3}><span className="print-data text-end green">{dailySales ? numberFormat(parseFloat(dailySales.system_cash_sales) - parseFloat(dailySales.total_expense)) : ''}</span></Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Row>
                        </div>
                        <div>
                            <Row className="review-container py-3 me-2 ms-2 mt-3">
                                <Row>
                                    <span className="edit-label">
                                        CASH SALES SUMMARY
                                    </span>
                                </Row>
                                <Row>
                                    <Col xs={8}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-left ms-5 mt-1 mb-1">
                                            Actual Cash Sales   
                                        </Row>
                                        <Row className="justify-content-left ms-5 mt-1 mb-1">
                                            System Cash Sales   
                                        </Row>
                                    </Col>
                                    <Col xs={4}  className="print-data pl-2 mt-2 mb-1">
                                        <Row className="justify-content-end me-5">
                                            {numberFormat(dailySales.actual_cash_sales)}
                                        </Row>
                                        <Row className="justify-content-end mt-1 me-5">
                                            {numberFormat(dailySales.system_cash_sales)}
                                        </Row>
                                    </Col>
                                </Row>
                                <div className="break "> </div>
                                <Row>
                                    <Col xs={8}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-left ms-5">
                                            OVERAGE/SHORTAGE
                                        </Row>
                                    </Col>
                                    <Col xs={4}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-end me-5">
                                            { numberFormat(dailySales.cash_sales_overage) }
                                        </Row>
                                    </Col>
                                </Row>
                            </Row>
                        </div>
                        <div>
                            <Row className="review-container py-3 me-2 ms-2 mt-3">
                                <Row>
                                    <span className="edit-label">
                                        TOTAL SALES SUMMARY
                                    </span>
                                </Row>
                                <Row>
                                    <Col xs={5}></Col>
                                    <Col xs={3} className="print-data mt-2 mb-1">
                                        <Row className="justify-content-center mt-1 mb-1">
                                            Actual Cash Sales   
                                        </Row>
                                        <Row className="justify-content-center mt-1 mb-1">
                                            {numberFormat(dailySales.actual_cash_sales)}
                                        </Row>
                                    </Col>
                                    <Col xs={1}>
                                        <div className="vl"></div>
                                    </Col>
                                    <Col xs={3} className="print-data mt-2 mb-1">
                                        <Row className="justify-content-center mt-1 mb-1">
                                            System Cash Sales   
                                        </Row>
                                        <Row className="justify-content-center mt-1 mb-1">
                                            {numberFormat(dailySales.system_cash_sales)}
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={3}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-right ms-5 mt-1 mb-1">
                                            GCASH Sales
                                        </Row>
                                        <Row className="justify-content-right ms-5 mt-1 mb-1">
                                            Food Panda Sales
                                        </Row>
                                        <Row className="justify-content-right ms-5 mt-1 mb-1">
                                            Grab Food Sales
                                        </Row>
                                    </Col>
                                    <Col xs={4}></Col>
                                    <Col xs={3}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-center mt-1 mb-1">
                                            {numberFormat(dailySales.gcash_sales)}
                                        </Row>
                                        <Row className="justify-content-center mt-1 mb-1">
                                            {numberFormat(dailySales.food_panda_sales)}
                                        </Row>
                                        <Row className="justify-content-center mt-1 mb-1">
                                            {numberFormat(dailySales.grab_food_sales)}
                                        </Row>
                                    </Col>
                                </Row>
                                <div className="break "> </div>
                                <Row>
                                    <Col xs={5}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-right ms-5 green">
                                            TOTAL SALES
                                        </Row>
                                    </Col>
                                    <Col xs={3}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-center green">
                                            {dailySales.actual_total_sales ? numberFormat(dailySales.actual_total_sales) : "0.00"}
                                        </Row>
                                    </Col>
                                    <Col xs={1}></Col>
                                    <Col xs={3}  className="print-data mt-2 mb-1">
                                        <Row className="justify-content-center green">
                                            {dailySales.system_total_sales ? numberFormat(dailySales.system_total_sales): "0.00"}
                                        </Row>
                                    </Col>
                                </Row>
                            </Row>
                        </div>
                        <div className="print-signatures">
                            <div className="d-flex align-items-center justify-content-end flex-column">
                                <span className="text-center text-uppercase print-label fw-bold">
                                    {dailySales.preparer_name}
                                </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center flex-column">
                                <img src={signature} className="print-logo" />
                                <span className="text-center text-uppercase print-label fw-bold">
                                    KRISTOFFER CHAN
                                </span>
                            </div>
                        </div>
                        <div className="print-signatories pb-2">
                            <span>Prepared by</span>
                            <span>Approved by</span>
                        </div>
                    </div>
                </div>

                {/* footer */}
                <div className="d-flex justify-content-end my-4 pb-5 d-flex-responsive">
                    <button
                        className="button-secondary me-3"
                        onClick={() => navigate(-1)}
                    >
                        Close
                    </button>
                    <button
                        className="button-primary me-3"
                        onClick={handlePrint}
                    >
                        Print
                    </button>
                </div>
            </div>
        </div>
    );
}
