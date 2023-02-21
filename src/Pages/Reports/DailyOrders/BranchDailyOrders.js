import React, { useState } from "react";
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
    TokenExpiry,
    getTodayDateISO
} from "../../../Helpers/Utils/Common";
import DatePicker from "react-datepicker";
import Moment from "moment";
import ViewModal from "../../../Components/Modals/ViewModal";
import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { getOrder, searchOrder, searchOrderByBranch } from "../../../Helpers/apiCalls/Reports/DailyOrdersApi";
import Smoothie from "../../../Assets/Images/Report/smoothie.png"


export default function ViewDailyExpenses() {
    const { id } = useParams();
    const { state } = useLocation();
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const accountType = getType();
    const [inactive, setInactive] = useState(true);
    const [filterConfig, setFilterConfig] = useState({
        branch_id: state.branch_id,
        date_from: state?.date_from ? new Date(state.date_from) : "",
        date_to: state?.date_to ? new Date(state.date_to) : "",
        group_orders: "false"
    })
    const [showLoader, setShowLoader] = useState(false);
    const [sales, setSales] = useState([]);
    const [orderDetails, setOrderDetails] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState([]);
    const [averagePrice, setAveragePrice] = useState([]);
    const [totalAmount, setTotalAmount] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [branchName, setBranchName] = useState("");
    const [totalSales, settotalSales] = useState("");

    // VIEW
    const [showViewModal, setShowViewModal] = useState(false);
    const handleShowViewModal = () => setShowViewModal(true);
    const handleCloseViewModal = () => setShowViewModal(false);

    const dummy = [
        {
            id: "1",
            order_no: "Order 1 - 111", 
            tran_method: "Walk-in",
            tran_ref_no: "111",
            pieces: "1000",
            amount: "1000",
            pay_method: "Cash",
            pay_ref_no: "111",
            time: "10:00 AM",
        },
    ]

    // SEARCH USER
    function handleOnSearch(e) {
        const { name, value } = e.target;
        console.log(name, value)
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    function ViewBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                onClick={() => handlePrint(row)}
            >
                View
            </button>
        );
    }
    function handlePrint(row) {
        console.log(row)
        var allBills = row
        allBills.order_detail = allBills.order_detail?.map((data) => {
            var info = data;
            var total = 0
            info.addOnPrices = data.product_detail?.map((item) => {
                return (parseFloat(item.qty) * parseFloat(item.price))
            })
            info.addOnTotal = info.addOnPrices
                .reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
            info.priceWithAddOn = parseFloat(data.price) + info.addOnTotal
            return info;
        })
        setSelectedRow(row);
        handleShowViewModal();
    }
    console.log(selectedRow)

    async function fetchData() {
        setShowLoader(true);
        setSales([])
        setTransactionTypes([])
        setOrderDetails([])

        const response = await searchOrder(filterConfig);

        if (response.error) {
        } else {

            setBranchName(response.data.data[0]?.branch_name);
            var allBills = response.data.data.map((bill, index) => {
                var paytype = bill.payment[0]?.payment_type.split("_")
                var info = bill;
                info.amount = numberFormat(bill.subtotal)
                info.transaction_type = bill.transaction_type
                info.qty = bill.order_detail?.map((item) => item.qty)
                            .reduce((a, b) => parseInt(a) + parseInt(b), 0);
                info.amount = bill.order_detail?.map((item) => item.subtotal)
                    .reduce((a, b) => parseInt(a) + parseInt(b), 0);

                info.subtotal = bill.payment[0]?.subtotal
                info.discount = bill.payment[0]?.discount
                info.grand_total = numberFormat(bill.grand_total)
                info.payment_type = paytype.length < 2 ? bill.payment[0]?.payment_type : paytype[0] + " " + paytype[1]
                info.pay_ref_no = bill.payment[0]?.reference_no
                info.tran_ref_no = bill.payment[0]?.transaction_no ? bill.payment[0]?.transaction_no : bill.payment[0]?.reference_no ? bill.payment[0]?.reference_no : ""
                info.time = new Date(bill.added_on).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                return info;
            });

            var classification = response.data.summary.transaction_types?.map((data) => {
                var info = {}
                info.name = data;
                info.value = data;

                setTransactionTypes((prev) => [...prev, info])
            })
            var total = response.data.summary? response.data.summary.total_sales : "0";
            settotalSales(total);
            

            setSales(allBills)
        }
        setShowLoader(false);
    }
    console.log(sales[0])
    React.useEffect(() => {
        fetchData();
    }, [filterConfig]);

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

            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> {branchName} </h1>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col xs={6}>
                        <h5 className="page-subtitle"> {new Date().toLocaleDateString( "en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} </h5>
                    </Col>
                </Row>

                <div className="tab-content">
                    {/* filters */}
                    <div className="my-2 px-2 PO-filters d-flex">
                        <span className="me-4 align-middle mt-2 ps-label">
                            Filter By:
                        </span>
                        <Form.Select
                            name="type"
                            className="date-filter me-2"
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                All Types
                            </option>
                            <option value="store"> Store </option>
                            <option value="foodpanda"> Food Panda </option>
                            <option value="grabfood"> Grab Food </option>
                            {/* {transactionTypes.length > 0 ? (
                                transactionTypes.map((type) => {
                                    return (
                                        <option
                                            value={type.value}
                                        >
                                            {type.name}
                                        </option>
                                    );
                                })
                            ) : (
                                <option value="" disabled>
                                    (No type found)
                                </option>
                            )} */}
                        </Form.Select>

                        <Form.Select
                            name="mode"
                            className="date-filter me-2"
                            onChange={(e) => handleOnSearch(e)}
                        >
                            <option value="" selected>
                                All Modes
                            </option>
                            <option value="cash"> Cash </option>
                            <option value="gcash"> GCash </option>
                            <option value="credit"> Credit </option>
                            <option value="bank"> Bank </option>
                            <option value="gift_certificate"> Gift Certificate </option>
                            <option value="others"> Others </option>
                        </Form.Select>

                        <span className="me-4 align-middle mt-2 ps-label">
                            From:
                        </span>
                        <DatePicker
                            selected={filterConfig.date_from}
                            name="date_from"
                            placeholderText={"Select Date"}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, date_from: date };
                                });
                            }}
                            fixedHeight
                            className="PI-date-btn me-3 form-control"
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />

                        <span className="me-4 align-middle mt-2 ps-label">
                            To:
                        </span>
                        <DatePicker
                            selected={filterConfig.date_to}
                            name="date_to"
                            placeholderText={"Select Date"}
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, date_to: date };
                                });
                            }}
                            fixedHeight
                            className="PI-date-btn me-3 form-control"
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />
                    </div>

                    <div className="my-2 px-2 PO-filters d-flex justify-content-center">
                        <span className="me-4 ml-4 align-middle mt-2 ps-label">
                            Total Sales: {numberFormat(totalSales)}
                        </span>
                    </div>

                    <div className="below">
                        {/* table */}
                        <TableTemp
                            tableHeaders={[
                                "-",
                                "ORDER NO.",
                                "TRAN. METHOD",
                                "TRAN. REF NO.",
                                "PIECES",
                                "AMOUNT",
                                "PAY METHOD",
                                "PYMT REF NO.",
                                "TIME",
                            ]}
                            headerSelector={[
                                "-",
                                "id",
                                "transaction_type",
                                "tran_ref_no",
                                "qty",
                                "grand_total",
                                "payment_type",
                                "pay_ref_no",
                                "time",
                            ]}
                            tableData={sales}
                            ViewBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>
            </div>

            <ViewModal
                withCloseButtons
                show={showViewModal}
                onHide={handleCloseViewModal}
            >
                <div className="mt-0">
                    <div className="col-sm-12 m-0 space">
                        <Row className="custom-modal-body-title-daily-orders w-100">
                            <Col xs={3} className="custom-modal-pic-right">
                                <img
                                    width={50}
                                    height={50}
                                    src={Smoothie}
                                ></img>
                            </Col>
                            <Col xs={6}>
                                <Row className="justify-content-center">
                                    Order  {selectedRow.id}
                                </Row>
                                <Row className="custom-modal-sub-daily-orders " >
                                    {selectedRow.time}
                                </Row>
                            </Col>
                            <Col xs={3} className="custom-modal-pic-left">
                                <img
                                    width={50}
                                    height={50}
                                    src={Smoothie}
                                ></img>
                            </Col>
                        </Row>
                        <Row className="custom-modal-body-title-branch-details-no-pic w-100">
                            <Col xs={12} className="justify-content-center">
                                {branchName}
                            </Col>
                        </Row>
                        {/* <span className="custom-modal-body-title-branch-details-no-pic">
                            {branchName}
                        </span> */}
                        <div className="mt-3 ">
                            <Row className="nc-modal-custom-row-view">
                                <Col xl={9}>
                                    <Col className="ms-3">
                                        {
                                            selectedRow?.order_detail?.length > 0 ? (
                                                selectedRow.order_detail.map((data) => {
                                                    return (
                                                        <>
                                                            <Row> {data.product_name.split("-")[0]  + " - " + data.product_name.split("-")[1]} </Row>
                                                            <Row className="custom-modal-sub-product">
                                                                PHP {numberFormat(data.price)}
                                                            </Row>
                                                            {
                                                                data.product_detail.length > 0 ? (
                                                                    data.product_detail.map((prod) => {
                                                                        return (
                                                                            <>
                                                                                <Row className="custom-modal-sub-product">
                                                                                    {"x" + prod.qty + " " + prod.product_name + " = P" + prod.price}
                                                                                </Row>
                                                                            </>
                                                                        )
                                                                    })
                                                                )
                                                                :""
                                                            }
                                                        </>
                                                    )
                                                })
                                            )
                                            :""
                                        }
                                    </Col>
                                </Col>
                                <Col xl={3}>
                                    <Col className="nc-modal-custom-row">
                                        {
                                            selectedRow?.order_detail?.length > 0 ? (
                                                selectedRow.order_detail.map((data) => {
                                                    return (
                                                        <>
                                                            <Row className="custom-modal-sub-product-yellow justify-content-center"> {data.qty} </Row>
                                                            <Row className="justify-content-center">
                                                                PHP {numberFormat(data.priceWithAddOn)}
                                                            </Row>
                                                            {
                                                                data.product_detail.length > 0 ? (
                                                                    data.product_detail.map((prod) => {
                                                                        return (
                                                                            <>
                                                                                <Row className="custom-modal-sub-product-white">
                                                                                    {"-"}
                                                                                </Row>
                                                                            </>
                                                                        )
                                                                    })
                                                                )
                                                                :""
                                                            }
                                                        </>
                                                    )
                                                })
                                            )
                                            :""
                                        }
                                    </Col>
                                </Col>
                            </Row>
                        </div>
                        <br/>
                        <div className="break"> </div>
                        <div className="mt-3 ">
                            <Row className="nc-modal-custom-row-view">
                                {selectedRow?.payment ? (
                                    selectedRow?.payment[0]?.discounts?.length > 0 && (
                                        <>
                                            <Row className="ms-1 me-1">
                                                Discount Details
                                            </Row>
                                            {
                                                selectedRow.payment ? (
                                                    selectedRow?.payment[0]?.discounts?.length > 0 ? (
                                                        selectedRow?.payment[0]?.discounts.map((data) => {
                                                            return (
                                                                <>
                                                                    <Row className="ms-1 me-1">
                                                                        <Col xs={6} className="">
                                                                            <Row  className="custom-modal-sub-product"> {data.name} </Row>
                                                                        </Col>
                                                                        <Col xs={6} className="">
                                                                            <Row  className="custom-modal-sub-product justify-content-end"> {data.id_no || "N/A"} </Row>
                                                                        </Col>
                                                                    </Row>
                                                                </>
                                                            )
                                                        })
                                                    )
                                                    :""
                                                ) : ""
                                            }
                                        </>
                                    )
                                ) : ""}
                                <Col xl={12}>
                                    <Row className="ms-1 me-1">
                                        <Col xs={6} className="">
                                            <Row> Transaction Method </Row>
                                            <Row  className="custom-modal-sub-product"> Reference No. </Row>
                                        </Col>
                                        <Col xs={6} className="">
                                            <Row className="justify-content-end"> {selectedRow?.transaction_type} </Row>
                                            <Row  className="custom-modal-sub-product justify-content-end"> {selectedRow?.tran_ref_no || "N/A"} </Row>
                                        </Col>
                                    </Row>
                                    <Row className="ms-1 me-1">
                                        <Col xs={6} className="">
                                            <Row> Payment Method </Row>
                                            <Row  className="custom-modal-sub-product"> Reference No. </Row>
                                        </Col>
                                        <Col xs={6} className="">
                                            <Row className="justify-content-end"> {selectedRow?.payment_type} </Row>
                                            <Row  className="custom-modal-sub-product justify-content-end"> {selectedRow?.pay_ref_no || "N/A"} </Row>
                                        </Col>
                                    </Row>
                                    <div className="break"> </div>
                                    <Row className="ms-1 me-1">
                                        <Col xs={6} className="">
                                            <Row> Subtotal </Row>
                                            <Row> Discount </Row>
                                            <Row> Grand Total </Row>
                                        </Col>
                                        <Col xs={6} className="nc-modal-custom-row">
                                            <Row className="justify-content-end"> PHP {selectedRow?.subtotal} </Row>
                                            <Row className="justify-content-end">- PHP {selectedRow?.discount} </Row>
                                            <Row className="justify-content-end"> PHP {selectedRow?.grand_total} </Row>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </ViewModal>
        </div>
    );
}
