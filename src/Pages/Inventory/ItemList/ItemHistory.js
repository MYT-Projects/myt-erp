import React, { useState } from "react";
import { Button, Col, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
    formatDateNoTime,
    getTodayDate,
    getTodayDateISO,
    getType,
} from "../../../Helpers/Utils/Common";
import {
    getAllItemList,
    getItemHistory,
    searchHistory
} from "../../../Helpers/apiCalls/Inventory/ItemListApi";
import {
    dateFormat,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../../Helpers/Utils/Common";
import {
    getAllItems,
    getItem,
    searchItem,
} from "../../../Helpers/apiCalls/itemsApi";
import { getAllItemsPotato } from "../../../Helpers/apiCalls/PotatoCorner/Inventory/ItemApi";
import { CSVLink, CSVDownload } from "react-csv";
import Select from "react-select";
import { getAllBranches } from "../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllBranchesPotato } from "../../../Helpers/apiCalls/PotatoCorner/Manage/Branches";
import Moment from "moment";
//components
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/NoSortTable";
import Delete from "../../../Components/Modals/DeleteModal";
import downloadIcon from "../../../Assets/Images/download_icon.png";
import DatePicker from "react-datepicker";

//css
import "./../Inventory.css";
import "../../../Components/Navbar/Navbar.css";

export default function ItemHistory() {
    const { branch_id, item_id, item_unit_id, unit } = useParams();

    let item_unit = unit;
    let source_api = "mango_magic";
    if (unit.includes("-")) {
        item_unit = unit.split("-")[0];
        source_api = unit.split("-")[1];
    }

    let navigate = useNavigate();
    const [userType, setUserType] = useState(getType());
    const [isChanged, setIsChanged] = useState(false);
    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [tempItemList, setTempItemList] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemName, setItemName] = useState("");
    const [itemUnit, setItemUnit] = useState("");
    const [branchName, setBranchName] = useState("");
    const [inventories, setInventories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [itemNames, setItemNames] = useState([]);
    const [itemNamesValue, setItemNamesValue] = useState({
        name: "item_id",
        label: "",
        value: "",
    });
    const [branchValue, setBranchValue] = useState({
        name: "branch",
        label: "",
        value: "",
    });
    
    const excelHeaders = [
        { label: "Date", key: "date" },
        { label: "DOC Type", key: "doc_type" },
        { label: "Slip No.", key: "slip_no" },
        { label: "In", key: "in" },
        { label: "Out", key: "out" },
        { label: "Encoded On", key: "encoded_on" },
        { label: "Added By", key: "added_by_name" },
        { label: "Current Qty", key: "current_qty" },
    ];

    const date = new Date();
    date.setDate(date.getDate() - 7);
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);

    /* FILTER CONFIGS */
    const [filterConfig, setFilterConfig] = useState({
        doc_type: "",
        doc_no: "",
        date_from: date,
        date_to: nextDay,
    });
    

    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();

    const handleAddChange = (e, type) => {
        setIsChanged(!isChanged);
        setItemList([]);

        if(type === "item"){
            setItemNamesValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
            setItemUnit(e.label.split("-")[1])
        } else if(type === "branch"){
            setBranchValue({
                name: e.name,
                label: e.label,
                value: e.value,
                type: e.type
            });
            setFilterConfig((prev) => {
                return { ...prev, [e.name]: e.value }; 
            });
        } else {
            const { name, value } = e.target;
            setFilterConfig((prev) => {
                return { ...prev, [name]: value };
            });
        }
        
    };

    async function fetchAllItems() {

        if(source_api === "mango_magic") {
            const response = await getAllItems();

            if (response.response.data) {
                var itemNames = response.response.data.sort((a, b) =>
                    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                );
                var cleanedArray = itemNames.map((item) => {
                    var info = {};
        
                    info.name = "item_id";
                    info.label = `${item.name}-${item.item_units[0]?.inventory_unit}`;
                    info.value = `${item.id}`;
                    
                    return info;
                });
                setItemNames(cleanedArray);
            } else {
            }
        } else if(source_api === "potato_corner") {
            const response = await getAllItemsPotato();
            console.log(response)
            if (response.response.data) {
                var itemNames = response.response.data.sort((a, b) =>
                    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                );
                var cleanedArray = itemNames.map((item) => {
                    var info = {};
        
                    info.name = "item_id";
                    info.label = `${item.name}-${item.item_units[0]?.inventory_unit}`;
                    info.value = `${item.id}`;
                    
                    return info;
                });
                setItemNames(cleanedArray);
            } else {
            }
        }
        
    }

    async function fetchBranches() {
        if(source_api === "mango_magic") {
            const response = await getAllBranches();
    
            setBranches([]);
    
            if (response.data) {
                var data = response.data.data;
                data.map((d) => {
                    // if(d.is_franchise === "3") {
                        var info = {};
                        info.name = "branch_id";
                        info.label = `${d.name}`;
                        info.value = `${d.id}`;
                        info.type = "mango";
                        setBranches((prev) => [...prev, info]);
                    // }
                });
            }
            // setBranchValue({
            //     name: "branch",
            //     label: response.data.data[0].name,
            //     value: response.data.data[0].id,
            // })
        } else if(source_api === "potato_corner") {
            const response2 = await getAllBranchesPotato();
    
            setBranches([]);
    
            if (response2.data) {
                var data = response2.data.data.data;
                data.map((d) => {
                    // if(d.is_franchise === "3") {
                        var info = {};
                        info.name = "branch";
                        info.label = `${d.name}`;
                        info.value = `${d.id}`;
                        info.type = "potato";
                        setBranches((prev) => [...prev, info]);
                    // }
                });
            }
            // setBranchValue({
            //     name: "branch",
            //     label: response2.data.data[0].name,
            //     value: response2.data.data[0].id,
            // })
        }
        
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // async function fetchHistory() {
    //     setShowLoader(true);
    //     setItemList([]);
    //     const response = await getItemHistory(
    //         branch_id,
    //         item_id,
    //         item_unit_id,
    //         source_api
    //     );
    //     if (response.error) {
    //         setShowLoader(false);
    //     } else if (response.data.status === "success") {
    //         var history = response.data.history;
    //         setInventories(response.data.inventory);
    //         setItemName(response.data.inventory[0].item_name);
    //         setBranchName(response.data.inventory[0].branch_name);
    //         setItemNamesValue({
    //             name: "item_id",
    //             label: response.data.inventory[0].item_name,
    //             value: response.data.inventory[0].item_id,
    //         })
    //         setItemUnit(response.data.inventory[0].unit)
    //         setBranchValue({
    //             name: "branch_id",
    //             label: response.data.inventory[0].branch_name,
    //             value: response.data.inventory[0].branch_id,
    //         })

    //         history.map((PO) => {
    //             var info = {};

    //             info.date = Moment(PO.doc_date).format("MM-DD-YYYY");
    //             info.encoded_on = PO.encoded_on
    //                 ? Moment(PO.encoded_on).format("MM-DD-YYYY")
    //                 : "";
    //             info.doc_type = PO.doc_type;
    //             info.doc_no = PO.doc_no;
    //             info.slip_no = PO.slip_no;
    //             info.added_by_name = PO.added_by_name;
    //             info.supplier = PO.supplier_name;
    //             info.branch = PO.branch_name;
    //             info.in =
    //                 PO.qty_in !== null
    //                     ? parseFloat(PO?.qty_in).toFixed(2)
    //                     : "0.00";

    //             info.out =
    //                 PO.qty_out !== null
    //                     ? parseFloat(PO?.qty_out).toFixed(2)
    //                     : "0.00";

    //             info.current_qty =
    //                 PO.current_qty !== null
    //                     ? parseFloat(PO?.current_qty).toFixed(2)
    //                     : "0.00";
    //             info.in = numberWithCommas(info.in);
    //             info.out = numberWithCommas(info.out);
    //             info.current_qty = numberWithCommas(info.current_qty);

    //             setItemList((prev) => [...prev, info]);
    //         });
    //     }
    //     setShowLoader(false);
    // }

    console.log(branchValue.value, itemNamesValue.value)

    async function searchHistoryFilter() {
        setShowLoader(true);
        setItemList([]);
        const response = await searchHistory(
            branchValue.value ? branchValue.value : branch_id,
            itemNamesValue.value ? itemNamesValue.value : item_id ,
            source_api,
            filterConfig,
        );
        if (response.error) {
            setShowLoader(false);
        } else if (response.data.status === "success"){
            var history = response.data.history;
            setInventories(response.data.inventory);
            setItemName(response.data.inventory[0].item_name);
            setBranchName(response.data.inventory[0].branch_name);
            setItemNamesValue({
                name: "item_id",
                label: response.data.inventory[0].item_name,
                value: response.data.inventory[0].item_id,
            })
            setBranchValue({
                name: "branch",
                label: response.data.inventory[0].branch_name,
                value: response.data.inventory[0].branch_id,
            })

            history.map((PO) => {
                var info = {};

                info.date =
                    PO.doc_date
                        ? Moment(PO.doc_date).format("MM-DD-YYYY")
                        : Moment(PO.encoded_on).format("MM-DD-YYYY");
                info.encoded_on = PO.encoded_on
                    ? Moment(PO.encoded_on).format("MM-DD-YYYY")
                    : "";
                info.doc_type = PO.doc_type;
                info.doc_no = PO.doc_no;
                info.slip_no = PO.slip_no ? PO.slip_no : PO.doc_no;
                info.added_by_name = PO.added_by_name;
                info.supplier = PO.supplier_name;
                info.branch = PO.branch_name;
                info.in =
                    PO.qty_in !== null
                        ? parseFloat(PO?.qty_in).toFixed(2)
                        : "0.00";

                info.out =
                    PO.qty_out !== null
                        ? parseFloat(PO?.qty_out).toFixed(2)
                        : "0.00";

                info.current_qty =
                    PO.current_qty !== null
                        ? parseFloat(PO?.current_qty).toFixed(2)
                        : "0.00";
                info.in = numberWithCommas(info.in);
                info.out = numberWithCommas(info.out);
                info.current_qty = numberWithCommas(info.current_qty);

                setItemList((prev) => [...prev, info]);
            });
        }
        setShowLoader(false);
    }

    function DocBtn(row) {
        return (
            <span
                className="me-4 align-middle ps-label blue"
                onClick={() =>
                    handleViewDoc(row.doc_no, row.doc_type, source_api)
                } 
            >
                {row.slip_no}
            </span>
        );
    }
    function handleViewDoc(id, type, api) {
        if (type === "Adjustment") {
            window.open("/adjustments/view/" + id + "/" + api);
        } else if (type === "Transfer" || type === "Transfer Receive") {
            window.open(
                "/transfers/view/" +
                    api
                        .split("_")[0]
                        .replace(/\b[a-z]/g, (x) => x.toUpperCase()) +
                    "-" +
                    id +
                    "/" +
                    "completed"
            );
        } else if (type === "Franchisee Sale") {
            window.open("/salesinvoice/print/" + id);
        } else if (type === "Build Item") {
            window.open("/buildItem/" + id);
        } else if (type === "Purchase Invoice") {
            window.open(
                "/purchaseinvoices/print/" + id + "/" + api.split("_")[0]
            );
        } else if (type === "Order") {
            // window.open(
            //     "/transfers/receive/view/" + api.split("_")[0] + "-" + id 
            // );
        }
    }

    React.useEffect(() => {
        // fetchHistory();
        fetchAllItems();
        fetchBranches()
    }, []);

    React.useEffect(() => {
        setItemList([]);
        searchHistoryFilter();

    }, [isChanged, filterConfig]);



    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"INVENTORY"} 
                />
            </div>
            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <div className="row">
                    <div className="col-sm-6">
                        <h1 className="page-title"> ITEM HISTORY </h1>
                    </div>
                    {/* input search button */}
                    <div className="col-sm-6 d-flex justify-content-end">
                        <input
                            type="text"
                            placeholder="Search doc no..."
                            className="search-bar"
                            name="doc_no"
                            defaultValue=""
                            onKeyPress={(e) =>
                                e.key === ("Enter" || "NumpadEnter") &&
                                handleAddChange(e)
                            }
                        ></input>
                    </div>{" "}
                </div>{" "}
                <Row className="row mb-4">
                    <Col xs={1}>
                        <h3 className="page-subtitle">
                            {" "}
                            <strong>Item:</strong> 
                        </h3>
                    </Col>
                    <Col xs={3} className="front">
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select item..."
                            value={itemNamesValue}
                            options={itemNames}
                            onChange={(e) => handleAddChange(e, "item")}
                        />
                    </Col>
                    <Col>
                        <h3 className="page-subtitle text-capitalize">
                            {" "}
                            <strong>Unit:</strong> {itemUnit}{" "}
                        </h3>
                    </Col>
                    <Col xs={1}>
                        <h3 className="page-subtitle text-capitalize">
                            {" "}
                            <strong>Branch:</strong> 
                        </h3>
                    </Col>
                    <Col xs={3} className="front">
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Select item..."
                            value={branchValue}
                            options={branches}
                            onChange={(e) => handleAddChange(e, "branch")}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-end mb-4">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={itemList.slice().reverse()}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} History-${itemName.replace(
                                    ".",
                                    "_"
                                )}_${branchName}`}
                            >
                                <span className="me-2">
                                    <img
                                        width={20}
                                        height={20}
                                        src={downloadIcon}
                                    ></img>
                                </span>
                                Download Excel
                            </CSVLink>
                        </div>
                    </Col>
                </Row>
                <div className="tab-content">
                    
                    <div className="my-2 ms-2 PO-filters PI-filters d-flex">
                        <span className="me-3 align-middle mt-2">
                            FILTER BY:
                        </span>
                        <Form.Select
                            name="doc_type"
                            className="date-filter me-2"
                            onChange={(e) => handleAddChange(e)}
                        >
                            <option value="" selected> All Doc Types </option>
                            <option value="Transfer" > Transfer </option>
                            <option value="Adjustment" > Adjustment </option>
                            <option value="order" > Order </option>
                            <option value="Build Item" > Build Item </option>
                            <option value="Transfer Receive" > Transfer Receive </option>
                            <option value="Franchisee Sale" > Franchisee Sale </option>
                            <option value="Purchase Invoice" > Purchase Invoice </option>
                        </Form.Select>

                        <span className="me-3 align-middle mt-2">
                            Date From:
                        </span>
                        <DatePicker
                            selected={filterConfig.date_from}
                            placeholderText={"Select Date"}
                            name="date_from"
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

                        <span className="me-3 align-middle mt-2">To:</span>
                        <DatePicker
                            selected={filterConfig.date_to}
                            placeholderText={"Select Date"}
                            name="date_to"
                            onChange={(date) => {
                                setFilterConfig((prev) => {
                                    return { ...prev, date_to: date };
                                });
                            }}
                            minDate={filterConfig.date_from}
                            className="PI-date-btn me-3 form-control"
                            showYearDropdown
                            dateFormatCalendar="MMMM"
                            yearDropdownItemNumber={20}
                            scrollableYearDropdown
                        />
                    </div>
                    
                    
                    <Table
                        tableType={"item_history"}
                        tableHeaders={[
                            "DOC DATE",
                            "DOC TYPE",
                            "DOC NO.",
                            "IN",
                            "OUT",
                            "ENCODED ON",
                            "ENCODED BY",
                            "CURRENT",
                        ]}
                        headerSelector={[
                            "date",
                            "doc_type",
                            "slip_no",
                            "in",
                            "out",
                            "encoded_on",
                            "added_by_name",
                            "current_qty",
                        ]}
                        tableData={itemList.slice().reverse()}
                        ContractBtn={(row) => DocBtn(row)}
                        showLoader={showLoader}
                    />
                    <div className="mb-2" />
                </div>
                <div className="d-flex justify-content-end pt-5 pb-3">
                    <button
                        type="button"
                        className="button-primary me-3"
                        onClick={() => navigate("/itemlists")}
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
