import React, { useState, useEffect, Fragment } from "react";
import {
    Carousel,
    Card,
    Row,
    Col,
    Container,
    Stack,
    Badge,
} from "react-bootstrap";
import NoDataImg from "../../Assets/Images/Dashboard/no-data.png";
import arrowNext from "../../Assets/Images/Dashboard/arrow-next.png";
import circleArrow from "../../Assets/Images/Dashboard/circle-arrow.png";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { getAllServices } from "../../Helpers/apiCalls/servicesApi";

//components
import Navbar from "../../Components/Navbar/Navbar";

//css
import "../../Components/Navbar/Navbar.css";
import "./Dashboard.css";
import {
    capitalizeFirstLetter,
    dateFormat,
    formatDate,
    formatDateNoTime,
    getName,
    getTime,
    getType,
    numberFormat,
    TokenExpiry,
} from "../../Helpers/Utils/Common";

// img
import profile from "../../Assets/Images/Dashboard/user_profile.png";
import NoDataPrompt from "../../Components/NoDataPrompt/NoDataPrompt";
import {
    getAllPurchaseOrder,
    searchPurchaseOrder,
    searchPurchaseOrderPotato,
} from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import {
    getAllSuppliesExpenses,
    getAllSuppliesExpensesPotato,
    searchSE,
} from "../../Helpers/apiCalls/Purchases/suppliesExpensesApi";
import {
    getAlgetAllTransfersPotato,
    lTransfers,
    getTransfer,
    getAllTransfers,
    searchTransfersMango,
    searchTransfersPotato,
} from "../../Helpers/apiCalls/Inventory/TransferApi";
import {
    getAllTransfersPotato,
    getTransferPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Inventory/TransferApi";
import { getAllPurchaseOrderPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import {
    getAllInventoryAdjustments,
    getAllInventoryAdjustmentsPotato,
} from "../../Helpers/apiCalls/adjustmentsApi";
import { Navigate } from "react-router-dom";
import { searchAdjustmentsMango } from "../../Helpers/apiCalls/Inventory/AdjustmentApi";
import { searchAdjustmentsPotato } from "../../Helpers/apiCalls/PotatoCorner/Inventory/AdjustmentApi";

export default function Dashboard2() {
    let navigate = useNavigate();
    const type = getType();
    const [inactive, setInactive] = useState(false);
    const [username, setUsername] = useState(getName());
    const [purchasesPO, setPurchasesPO] = useState([]);
    const [suppliesPO, setSuppliesPO] = useState([]);
    const [transfersPO, setTransfersPO] = useState([]);
    const [requestStocks, setRequestStocks] = useState([]);
    const [inventoryAdjustments, setInventoryAdjustments] = useState([]);
    const [days, setDays] = useState({
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
    });

    // FOR APPROVAL PURCHASE ORDERS FROM MANGO AND POTATO
    async function fetchAllForApprovalPurchases() {
        var allPO = [];
        setPurchasesPO([]);
        const response = await searchPurchaseOrder({
            status: "for_approval",
            limit_by: 5,
        });
        const response2 = await searchPurchaseOrderPotato({
            status: "for_approval",
            limit_by: 5,
        });

        if (response.data) {
            var mangoPO = response.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "mango";
                info.status = PO.status;
                info.label = `Mango-${PO.id}`;
                info.supplier =
                    PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                allPO.push(info);
                return info;
            });

            console.log("PURCHASES - FOR APPROVAL MANGO", mangoPO);
        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoPO = response2.data.data.map((PO) => {
                var info = {};
                info.id = PO.id;
                info.type = "potato";
                info.status = PO.status;
                info.label = `Potato-${PO.id}`;
                info.supplier =
                PO.supplier_trade_name || PO.vendor_trade_name || "N/A";
                if (allPO.length < 3){
                    allPO.push(info);
                }
                return info;
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }
        setPurchasesPO(allPO);
    }

    // FOR APPROVAL SUPPLIES EXPENSES FROM MANGO AND POTATO
    async function fetchAllForApprovalSuppliesExpense() {
        const response = await searchSE({
            status: "for_approval",
            limit_by: 5,
        });
        if (response.data) {
            var mangoSE = response.data.data.map((SE) => {
                var info = {};
                info.id = SE.id;
                info.type = "mango";
                info.label = `Mango-${SE.id}`;
                info.supplier = SE.supplier_trade_name || "N/A";
                return info;
            });
            setSuppliesPO(mangoSE);
            console.log("SUPPLIES EXPENSE - FOR APPROVAL MANGO", mangoSE);
        } else if (response.error) {
            TokenExpiry(response);
        }
    }

    // FOR APPROVAL TRANSFERS FROM MANGO AND POTATO
    async function fetchAllForApprovalTransfers() {
        var allTransfers = [];
        setTransfersPO([]);
        const response = await searchTransfersMango({
            transfer_status: "requested",
            limit_by: 5,
        });
        const response2 = await searchTransfersPotato({
            transfer_status: "requested",
            limit_by: 5,
        });
        if (response.data) {
            var mangoTransfers = response.data.data.map((pendingTransfer, key) => {
                if (key < 3){
                    var info = {};
                    info.id = pendingTransfer.id;
                    info.status = pendingTransfer.status;
                    info.label = `Mango-${pendingTransfer.id}`;
                    info.type = "mango";
                    info.branchTo =
                        `To: ${capitalizeFirstLetter(
                            pendingTransfer.branch_to_name
                        )}` || "N/A";
                    allTransfers.push(info);
                    return info;
                }
            });
            console.log("TRANSFERS - FOR APPROVAL MANGO", mangoTransfers);
        } else if (response.error) {
            TokenExpiry(response);
        }
        if (response2.data) {
            var potatoTransfers = response2.data.data.map((pendingTransfer, key) => {
                if (key < 3){
                    var info = {};
                    info.id = pendingTransfer.id;
                    info.status = pendingTransfer.status;
                    info.label = `Potato-${pendingTransfer.id}`;
                    info.type = "potato";
                    info.branchTo =
                        `To: ${pendingTransfer.branch_to_name}` || "N/A";
                    if (allTransfers.length < 3){
                        allTransfers.push(info);
                    }
                    return info;
                }
                
            });
            console.log("TRANSFERS - FOR APPROVAL POTATO", potatoTransfers);
        } else if (response2.error) {
            TokenExpiry(response2);
        }

        setTransfersPO(allTransfers);
    }

    // RECENT INVENTORY ADJUSTMENTS IN MANGO AND POTATO
    async function fetchInvetoryAdjustments() {
        var allAdjustments = [];
        const response = await searchAdjustmentsMango({
            status: "pending",
            limit_by: 5,
        });
        const response2 = await searchAdjustmentsPotato({
            status: "pending",
            limit_by: 5,
        });

        if (response.data) {
            var mangoAdjustments = response.data.data.map((adjustment) => {
                var info = {};
                info.type = "mango";
                allAdjustments.push(adjustment);
            });
        } else if (response.error) {
            TokenExpiry(response);
        }

        if (response2.data) {
            var potatoAdjustments = response2.data.data.map((adjustment) => {
                var info = {};
                info.type = "potato";
                allAdjustments.push(adjustment);
            });
        } else if (response2.error) {
            TokenExpiry(response2);
        }

        // sort by date
        // var sortedAdjustments = allAdjustments.sort(prev, next)
        setInventoryAdjustments(allAdjustments);

        console.log("ADJUSTMENTS - FOR APPROVAL MANGO", response);
        console.log("ADJUSTMENTS - FOR APPROVAL POTATO", response2);
    }

    useEffect(() => {
        fetchInvetoryAdjustments();
        fetchAllForApprovalPurchases();
        fetchAllForApprovalSuppliesExpense();
        fetchAllForApprovalTransfers();
    }, []);

    return (
        <div className="dashboard-wrapper">
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"DASHBOARD"} //Dashboard navbar index
                />
            </div>
            <div className={`dashboard ${inactive ? "inactive" : "active"}`}>
                <Row className="d-flex justify-content-between align-items-end">
                    <Col xs={"auto"}>
                        <h2 className="font-medium">
                            Hello, <b>{getName()}!</b>👋
                        </h2>
                    </Col>
                    <Col xs={"auto"}>
                        <h3 className="date-and-time">{`${getTime(
                            new Date()
                        )} ${days[new Date().getDay()]} | ${formatDateNoTime(
                            new Date()
                        )}`}</h3>
                    </Col>
                </Row>
                {type === "admin" ? (
                    <Fragment>
                        <Row className="mt-3">
                            <Col>
                                <h2 className="business-name">Mango Magic</h2>
                            </Col>
                            <Col>
                                <h2 className="business-name">Potato Corner</h2>
                            </Col>
                        </Row>
                        <Row className="d-flex justify-content-between align-items-end">
                            <Col>
                                <Row>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                BRANCHES OPEN
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    out of 90
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                SALES DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                INVENTORY DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Col>
                            <Col>
                                <Row>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                BRANCHES OPEN
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    out of 90
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                SALES DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                    <Col className="me-auto mx-2 box-1">
                                        <Stack>
                                            <div className="small-hdr">
                                                INVENTORY DISCREPANCY
                                            </div>
                                            <div className="stats">
                                                --{" "}
                                                <span className="stats-small">
                                                    branches
                                                </span>
                                            </div>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className="align-items-start mt-3">
                            <Col xs={6}>
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">Request Stocks</p>
                                        <hr />
                                        {requestStocks.length === 0 ? (
                                            <div className="no-data-found d-flex justify-content-center">
                                                <span>
                                                    <img
                                                        src={NoDataImg}
                                                        alt="no data found"
                                                        width={20}
                                                        height={20}
                                                    />
                                                </span>
                                                <p className="no-data-label mx-1">
                                                    Uh Oh! No data found.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {requestStocks?.map((adj) => {
                                                    return (
                                                        <Stack>
                                                            <div className="label">
                                                                {
                                                                    adj?.branch_name
                                                                }
                                                            </div>
                                                            <div className="date">
                                                                {formatDateNoTime(
                                                                    adj?.added_on
                                                                )}
                                                            </div>
                                                            <hr />
                                                        </Stack>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </Col>
                                    <Col className="me-auto mx-2 mt-3 box box-header">
                                        <p className="mt-2">
                                            Inventory Adjustments
                                        </p>
                                        <hr />
                                        <div className="inventory-adj">
                                            {inventoryAdjustments.length ===
                                            0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {inventoryAdjustments?.map(
                                                        (adj) => {
                                                            return (
                                                                <>
                                                                    <Row className="for-approval-cont d-flex align-items-center">
                                                                        <Col>
                                                                            <div className="label">
                                                                                {
                                                                                    adj?.branch_name
                                                                                }
                                                                            </div>

                                                                            <div className="date">
                                                                                {`${adj?.item_name}`}
                                                                            </div>
                                                                            <div className="date">
                                                                                {formatDateNoTime(
                                                                                    adj?.added_on
                                                                                )}
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs="auto">
                                                                            <button
                                                                                className="adjustment-btn"
                                                                                onClick={() =>
                                                                                    navigate(
                                                                                        "/adjustments"
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        arrowNext
                                                                                    }
                                                                                    alt="see more"
                                                                                    width={
                                                                                        20
                                                                                    }
                                                                                    height={
                                                                                        20
                                                                                    }
                                                                                />
                                                                            </button>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row className="px-2 mt-3">
                                                                        <hr />
                                                                    </Row>
                                                                </>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={6} className="box-2">
                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box-3 box-header">
                                        <Row className="px-3">
                                            For Approval Purchases
                                        </Row>
                                        <Row className="for-approval-wrapper">
                                            {purchasesPO.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Row className="for-approval-cont py-0 d-flex align-items-center">
                                                    <Col xs={9}>
                                                        <Row>
                                                            {purchasesPO?.map(
                                                                (purchase) => {
                                                                    return (
                                                                        <Col
                                                                            xs={
                                                                                3
                                                                            }
                                                                            className="approval-box mx-1"
                                                                        >
                                                                            <button
                                                                                className="next-btn"
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        "/purchaseorders/review/0/" +
                                                                                            purchase.type +
                                                                                            `/${purchase.type}-${purchase.id}`
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className="approval-card">
                                                                                    <Badge
                                                                                        bg={
                                                                                            purchase.type ===
                                                                                            "mango"
                                                                                                ? "warning"
                                                                                                : "success"
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            purchase?.label
                                                                                        }
                                                                                    </Badge>
                                                                                    <p className="fs-normal">
                                                                                        {
                                                                                            purchase?.supplier
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                        </Col>
                                                                    );
                                                                }
                                                            )}
                                                        </Row>
                                                    </Col>
                                                    <Col className="d-flex justify-content-end">
                                                        <button
                                                            className="next-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/purchaseorders"
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    circleArrow
                                                                }
                                                                alt="see more"
                                                                width={30}
                                                                height={30}
                                                            />
                                                        </button>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Row>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box-3 box-header">
                                        <Row className="px-3">
                                            For Approval Supplies
                                        </Row>
                                        <Row className="for-approval-wrapper">
                                            {suppliesPO.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Row className="for-approval-cont py-0 d-flex align-items-center">
                                                    <Col xs={9}>
                                                        <Row>
                                                            {suppliesPO?.map(
                                                                (supplies) => {
                                                                    return (
                                                                        <Col
                                                                            xs={
                                                                                3
                                                                            }
                                                                            className="approval-box mx-1"
                                                                        >
                                                                            <button
                                                                                className="next-btn"
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        "/suppliesexpenses/review/" +
                                                                                            supplies.id
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className="approval-card">
                                                                                    <Badge
                                                                                        bg={
                                                                                            supplies.type ===
                                                                                            "mango"
                                                                                                ? "warning"
                                                                                                : "success"
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            supplies?.label
                                                                                        }
                                                                                    </Badge>
                                                                                    <p className="fs-normal">
                                                                                        {
                                                                                            supplies?.supplier
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                        </Col>
                                                                    );
                                                                }
                                                            )}
                                                        </Row>
                                                    </Col>
                                                    <Col className="d-flex justify-content-end">
                                                        <button
                                                            className="next-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/suppliesexpenses"
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    circleArrow
                                                                }
                                                                alt="see more"
                                                                width={30}
                                                                height={30}
                                                            />
                                                        </button>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Row>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col className="me-auto mx-2 mt-3 box-3 box-header">
                                        <Row className="px-3">
                                            For Approval Transfers
                                        </Row>
                                        <Row className="for-approval-wrapper">
                                            {transfersPO.length === 0 ? (
                                                <div className="no-data-found d-flex justify-content-center">
                                                    <span>
                                                        <img
                                                            src={NoDataImg}
                                                            alt="no data found"
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </span>
                                                    <p className="no-data-label mx-1">
                                                        Uh Oh! No data found.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Row className="for-approval-cont py-0 d-flex align-items-center">
                                                    <Col xs={9}>
                                                        <Row>
                                                            {transfersPO?.map(
                                                                (transfer) => {
                                                                    return (
                                                                        <Col
                                                                            xs={
                                                                                3
                                                                            }
                                                                            className="approval-box mx-1"
                                                                        >
                                                                            <button
                                                                                className="next-btn"
                                                                                onClick={() => {
                                                                                    navigate(
                                                                                        "/transfers/view/" +
                                                                                            transfer.label +
                                                                                            `/${transfer.status}`
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <div className="approval-card">
                                                                                    <Badge
                                                                                        bg={
                                                                                            transfer.type ===
                                                                                            "mango"
                                                                                                ? "warning"
                                                                                                : "success"
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            transfer?.label
                                                                                        }
                                                                                    </Badge>
                                                                                    <p className="fs-normal">
                                                                                        {
                                                                                            transfer?.branchTo
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                        </Col>
                                                                    );
                                                                }
                                                            )}
                                                        </Row>
                                                    </Col>
                                                    <Col className="d-flex justify-content-end">
                                                        <button
                                                            className="next-btn"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/transfers"
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    circleArrow
                                                                }
                                                                alt="see more"
                                                                width={30}
                                                                height={30}
                                                            />
                                                        </button>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Fragment>
                ) : (
                    <Row className="d-flex justify-content-center align-items-center business-name mt-5 gray">
                        You do not have an authorized access to view this page.
                    </Row>
                )}
            </div>
        </div>
    );
}
