import moment from "moment";
import React, { useState } from "react";
import { Col, Container, Row, Table, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import cleanLogo from "../../../Assets/Images/Login/logo.png";
import signature from "../../../Assets/Images/signature.png";
import Navbar from "../../../Components/Navbar/Navbar";
import { getSupplier } from "../../../Helpers/apiCalls/suppliersApi";
import NoDataImg from "../../../Assets/Images/no-data-img.png"
import {
    dateFormat,
    formatDate,
    getName,
    getTodayDateISO,
    isAdmin,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../Helpers/Utils/Common";
import Moment from "moment";
import { getExpenses, searchExpenses } from "../../../Helpers/apiCalls/Reports/DailyExpensesApi";

export default function PrintDailyExpenses() {
    const { id } = useParams(); // id
    let navigate = useNavigate();

    const [inactive, setInactive] = useState(true);
    const [expense, setExpense] = useState([]);
    const [items, setItems] = useState([]);
    const [paymentInfo, setPaymentInfo] = useState([]);
    // const [showImg, setShowImg] = useState(false)
    const [image, setImage] = useState("");

    const [showViewModal, setShowViewModal] = useState(false);
    const handleShowViewModal = (img) => {
        setImage(img)
        setShowViewModal(true);
    }
    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setImage("")
    };

    async function fetchExpense() {
        setExpense([]);
        setItems([]);

        const response = await getExpenses({id: id});
        console.log(response);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var expense = response.data.data.map((data) => {
                var info = data;
                return info;
            });
            var expenseItem = expense[0]?.expense_item.map((data) => {
                var info = data;
                info.store = expense[0].store_name;
                info.qty = numberFormat(data.qty)
                info.price = numberFormat(data.price)
                info.total = numberFormat(data.total)
                info.added_on = new Date(data.added_on).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                return info;
            });
            setExpense(expense[0])
            setItems(expenseItem)
        }
    }

    console.log(paymentInfo)

    async function handlePrint() {
        toast.loading("Printing sales invoice...", { style: toastStyle() });
        setTimeout(() => {
            toast.dismiss();
            Print();
        }, 1000);
    }

    function renderTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => {
                        return (
                            <tr>
                                <td>{item.name}</td>
                                <td>{item.qty}</td>
                                <td className="text-lowercase">{item.unit}</td>
                                <td>{item.price}</td>
                                <td>{item.total}</td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={3}></td>
                        <td>Grand Total</td>
                        <td>
                            PHP{" "}
                            {expense.grand_total
                                ? numberFormat(expense.grand_total)
                                : "0.00"}
                        </td>
                    </tr>
                    {/* <tr>
                        <td colSpan={4}></td>
                        <td>Delivery Fee</td>
                        <td>
                            PHP{" "}
                            {expense.delivery_fee
                                ? numberFormat(expense.delivery_fee)
                                : "0.00"}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4}></td>
                        <td>GRAND TOTAL</td>
                        <td>
                            PHP{" "}
                            {expense.grand_total
                                ? numberFormat(expense.grand_total)
                                : "0.00"}
                        </td>
                    </tr> */}
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
    //console.log(expense)
    React.useEffect(() => {
        fetchExpense();
    }, []);

    console.log(expense?.attachment)

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
                    <div
                        className="text-end print-header d-flex flex-column"
                    >
                        <span>EXPENSE NO. {id}</span>
                        <span className="text-uppercase">
                            {moment(getTodayDateISO()).format("MMMM DD, yyyy")}
                        </span>
                    </div>
                    <div className="d-flex justify-content-center py-1">
                        <img src={cleanLogo} className="print-logo" />
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
                                        {expense.branch_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Store:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {expense.store_name}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Invoice No:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {expense.invoice_no}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Remarks:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {expense.remarks}
                                    </Col>
                                </div>
                            </Col>
                            <Col>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Expense Date:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {dateFormat(expense.expense_date)}
                                    </Col>
                                </div>
                                <div className="d-flex my-2 align-items-center">
                                    <Col xs={4} className="print-label">
                                        Encoded By:
                                    </Col>
                                    <Col xs={7} className="print-data">
                                        {expense.encoded_by_name}
                                    </Col>
                                </div>
                            </Col>
                        </Row>
                        <div className="d-flex mt-5 mb-2 justify-content-evenly">
                            {/* table */}
                            <div className="print-table mt-3 mx-2">
                                {renderTable()}
                            </div>
                        </div>
                        <div className="d-flex mt-5 mb-2 justify-content-evenly">
                            <div className="print-table mt-3 mx-2 print-data">
                                RECEIPT/S
                                {expense.attachment ? (
                                    <>
                                    {expense.attachment.map((data) => {
                                        if(data.base_64 !== "") {
                                            return(
                                                <>
                                                    <div className='mt-5 mb-2' style={{textAlignLast:"center"}}><img src={`data:image/png;base64,${data.base_64}`} width={400} height={400}/></div>
                                                    <div className='d-flex justify-content-center my-4'>
                                                        <button
                                                            className="button-primary"
                                                            onClick={()=>handleShowViewModal(data.base_64)}
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </>
                                            )
                                        } else {
                                            return(
                                                <>
                                                    <div className="no-data-cont">
                                                        <div className='mt-5 mb-2' style={{textAlignLast:"center"}} alt="no data found"><img src={NoDataImg} width={400} height={400}/></div>
                                                        <span>Uh Oh! No data found.</span>
                                                    </div>
                                                </>
                                            )
                                        }
                                    })}
                                    </>
                                ) : (
                                    <div className="no-data-cont">
                                        <div className='mt-5 mb-2' style={{textAlignLast:"center"}} alt="no data found"><img src={NoDataImg} width={400} height={400}/></div>
                                        <span>Uh Oh! No data found.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* <div className="print-signatures">
                            <div className="d-flex align-items-center justify-content-end flex-column">
                                <span className="text-center text-uppercase print-label fw-bold">
                                    {expense?.added_by_name}
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
                        <div className="print-signatures">
                            <span className="text-center text-uppercase print-label fw-bold">
                                {expense.client}
                            </span>
                        </div>
                        <div className="print-signatories pb-4 mb-4">
                            <span>Noted by (Client)</span>
                        </div> */}
                    </div>
                </div>

                {/* footer */}
                <div className="d-flex justify-content-end my-4 pb-5 d-flex-responsive">
                    <button
                        className="button-secondary me-3"
                        onClick={() => navigate("/dailyexpenses")}
                    >
                        Close
                    </button>
                    <button className="button-primary" onClick={handlePrint}>
                        Print
                    </button>
                </div>
            </div>
            <Modal show={showViewModal} onHide={()=>handleCloseViewModal()} size="md" centered>
                <Modal.Body className='pt-5'>
                    <div className='row justify-content-center'>
                        <div className='col-sm-12 align-center' style={{textAlignLast:"center"}}><img src={`data:image/png;base64,${image}`} width={400} height={400}/></div>
                        
                    </div>
                    <div className='d-flex justify-content-center my-4'>
                        {/* <button
                            className="button-primary me-2"
                            onClick={()=> window.open('https://i.pinimg.com/736x/71/34/16/713416b1705974ac2bd71f159c4e89cc.jpg','_blank')}
                        >
                            New tab
                        </button> */}
                        <button
                            className="button-secondary"
                            onClick={()=>handleCloseViewModal()}
                        >
                            Close
                        </button>
                    </div>
                
                </Modal.Body>
            </Modal>
        </div>
    );
}
