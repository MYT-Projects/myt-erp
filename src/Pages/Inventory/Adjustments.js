import React, { useState, useEffect, useRef } from "react";
import Table from "../../Components/TableTemplate/Table";
import AdjustmentTable from "./Adjustment/AdjustmentTable";
import {
    Col,
    Form,
    Row,
    Tab,
    Tabs,
    Dropdown,
    DropdownButton,
    ButtonGroup,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getType } from "../../Helpers/Utils/Common";
import Select from "react-select";
//components
import Navbar from "../../Components/Navbar/Navbar";
import DatePicker from "react-datepicker";
import AdjustmentModal from "./Adjustment/AdjustmentModal";
import Moment from "moment";

//css
import "./Inventory.css";
import "../../Components/Navbar/Navbar.css";

//api
import { searchBranch } from "../../Helpers/apiCalls/Manage/Branches";
import {
    getAllAdjustments,
    getAdjustment,
    searchByDate,
    searchByCounter,
    updateAdjustmentStatus,
    searchAdjustmentsMango,
    getAllAdjustmentItemType,
} from "../../Helpers/apiCalls/Inventory/AdjustmentApi";
import {
    getAllAdjustmentsPotato,
    getAdjustmentPotato,
    searchByDatePotato,
    searchByCounterPotato,
    updateAdjustmentStatusPotato,
    searchAdjustmentsPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Inventory/AdjustmentApi";
import {
    getAllItems,
    getItem,
    searchItem,
} from "../../Helpers/apiCalls/itemsApi";
import {
    dateFormat,
    formatDateNoTime,
    formatDate,
    numberFormat,
    refreshPage,
    toastStyle,
    getTodayDate,
    formatDateSlash,
    TokenExpiry,
} from "../../Helpers/Utils/Common";

export default function Adjustments() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(false);
    const [addTo, setAddTo] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const today = Moment().format("MM/DD/YYYY");
    const [branches, setBranches] = useState([]);
    const [items, setItems] = useState([]);
    const [itemType, setItemType] = useState([]);
    const [adjustments, setAdjustments] = useState([]);
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [disapproved, setDisapproved] = useState([]);
    const [system, setSystem] = useState([]);
    const [selectedTab, setSelectedTab] = useState(true);
    const [checkedAdjustments, setCheckedAdjustments] = useState([]);
    const [filterDate, setFilterDate] = useState({
        to: "",
        from: "",
        branch_id: "",
        item_id: "",
    });
    const [searchCountedBy, setSearchCountedBy] = useState("");

    /* approve modal handler */
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const handleShowAdjustmentModal = () => {
        checkedAdjustments.length != 0
            ? setShowAdjustmentModal(true)
            : toast.error("Please select adjustment to approve", {
                  style: toastStyle(),
              });
    };
    const handleAdjustmentModal = () => setShowAdjustmentModal(false);

    /* disapprove modal handler */
    const [showDisapproveModal, setShowDisapproveModal] = useState(false);
    const handleShowDisapproveModal = () => {
        checkedAdjustments.length != 0
            ? setShowDisapproveModal(true)
            : toast.error("Please select Adjustment to disapprove", {
                  style: toastStyle(),
              });
    };
    const handleDisapproveModal = () => setShowDisapproveModal(false);

    /* ========== FILTER CONFIGS ========== */
    const [adjustmentsManager, setAdjustmentsManager] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        status: "pending",
        branch_id: "",
        item_id: "",
        encoded_on_from: "",
        encoded_on_to: "",
        name: "",
        type: "office",
    });

    const isInitialMount = useRef(true);
    const filterConfigKey = 'inventory-officeAdjustments-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 // console.log("found");
    //                 handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).status);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])


    async function searchAdjustments() {
        setShowLoader(true);
        setAdjustmentsManager([]);

        var allData = [];

        const mango = await searchAdjustmentsMango(filterConfig);
        const potato = await searchAdjustmentsPotato(filterConfig);

        if (mango.data) {
            var sortedData = mango.data.data.sort((a, b) =>
                a.added_on > b.added_on
                    ? 1
                    : b.added_on > a.added_on
                    ? -1
                    : 0
            );
            var mangoAdjustments = sortedData.reverse().map((adjust) => {
                var info = adjust;
                info.encoded_on = Moment(adjust.added_on).format("MM-DD-YYYY");
                info.physical_count = numberFormat(adjust.physical_count)
                info.computer_count = numberFormat(adjust.computer_count)
                info.difference = numberFormat(adjust.difference)
                info.type = "mango_magic";
                allData.push(info);
                return info;
            });
        } else {
            TokenExpiry(mango);
        }
        if (potato.data) {
            var sortedData = potato.data.data.sort((a, b) =>
                a.added_on > b.added_on
                    ? 1
                    : b.added_on > a.added_on
                    ? -1
                    : 0
            );
            var potatoAdjustments = sortedData.reverse().map((adjust) => {
                var info = adjust;
                info.encoded_on = Moment(adjust.added_on).format("MM-DD-YYYY");
                info.physical_count = numberFormat(adjust.physical_count)
                info.computer_count = numberFormat(adjust.computer_count)
                info.difference = numberFormat(adjust.difference)
                info.type = "potato_corner";
                allData.push(info);
                return info;
            });
        } else {
            TokenExpiry(potato);
        }
        setAdjustmentsManager(allData);
        setShowLoader(false);
    }
    const handleTabSelect = (tabKey) => {
        if (tabKey === "pending") {
            setSelectedTab(true);
        } else {
            setSelectedTab(false);
        }
        
        setFilterConfig((prev) => {
            return {
                ...prev,
                status: tabKey,
                type_id: "",
                item_id: "",
                branch_id: "",
            };
        });
    };
    const handleFilterChange = (e) => {
        console.log(e);
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    };

    /* ========== FILTER CONFIGS ========== */

    function clearTables() {
        setPending([]);
        setApproved([]);
        setDisapproved([]);
        setSystem([]);
    }

    function handleSelectTab(selected) {
        if (selected === "pending") {
            setSelectedTab(true);
        } else {
            setSelectedTab(false);
        }
    }

    function ViewBtn(row) {
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={() => handleViewBtn(row.id, row.type)}
            >
                View
            </button>
        );
    }

    function handleViewBtn(id, type) {
        window.open(
            "/adjustments/view/" +
                id +
                "/" +
                type,
            "_blank"
        );
    }

    const [branchOptions, setBranchOptions] = useState([]);

    useEffect(()=>{
        setBranchOptions(branches.map((_branch)=>{
            var retval = {label: _branch.name, value:_branch.id}
            return retval;
        }))
        setBranchOptions((branchesOptions)=>{
            var newBranches = [...branchesOptions];
            newBranches.push({label: "All Branches", value:""})
            return newBranches.reverse();
        });
    },[branches])

    function handleBranchChange(e){
        const toFilter = {target: {name: "branch_id", value: e.value}};
        handleFilterChange(toFilter);
    }

    const [itemOptions, setItemOptions] = useState([]);

    useEffect(()=>{
        console.log(items);
        setItemOptions(items.map((_item)=>{
            var retval = {label: _item.name, value:_item.id}
            return retval;
        }))
        setItemOptions((itemOptions)=>{
            var newBranches = [...itemOptions];
            newBranches.push({label: "All Items", value:""})
            return newBranches.reverse();
        });
    },[items])

    function handleItemChange(e){
        const toFilter = {target: {name: "item_id", value: e.value}};
        handleFilterChange(toFilter);
    }

    // SEARCH USER
    function handleOnSearch(e) {
        fetchSearchCounter(e.target.value);
    }

    function handleOnCheck(row) {
        setCheckedAdjustments(row.selectedRows);
    }

    // API INTEGRATIONS
    async function fetchBranches() {
        const response = await searchBranch({is_franchise: "3"});

        if (response.data) {
            var data = response.data.data;
            var sortedData = data.sort((a, b) =>
                a.name.toUpperCase() > b.name.toUpperCase()
                    ? 1
                    : b.name.toUpperCase() > a.name.toUpperCase()
                    ? -1
                    : 0
            );
            setBranches(sortedData.reverse());
        } else {
        }
    }

    async function fetchAllItems() {
        const response = await getAllItems();

        if (response.response.data) {
            var data = response.response.data;
            setItems(data);
        } else {
        }
    }

    async function fetchAllItemType() {
        const response = await getAllAdjustmentItemType();

        if (response.data.data) {
            var data = response.data.data;
            setItemType(data);
        } else {
        }
    }

    async function fetchAllAdjustments() {
        const response = await getAllAdjustments();

        var pendingAdjust = [];
        var approvedAdjust = [];
        var disapprovedAdjust = [];
        var systemAdjust = [];

        if (response.data.data) {
            response.data.data.map((adjust) => {
                var info = adjust;
                info.encoded_on = Moment(adjust.added_on).format("MM-DD-YYYY");
                info.physical_count = numberFormat(adjust.physical_count)
                info.computer_count = numberFormat(adjust.computer_count)
                info.difference = numberFormat(adjust.difference)
                info.type = "mango_magic";
                if (adjust.status === "pending") {
                    setPending((prev) => [...prev, info]);
                }
                if (adjust.status === "approved") {
                    setApproved((prev) => [...prev, info]);
                }
                if (adjust.status === "disapproved") {
                    setDisapproved((prev) => [...prev, info]);
                }
                if (adjust.status === "system") {
                    setSystem((prev) => [...prev, info]);
                }
            });
        } else if (response.error) {
        }

        const response2 = await getAllAdjustmentsPotato();

        if (response2.data.data) {
            response2.data.data.map((adjust) => {
                var info = adjust;
                info.encoded_on = Moment(adjust.added_on).format("MM-DD-YYYY");
                info.physical_count = numberFormat(adjust.physical_count)
                info.computer_count = numberFormat(adjust.computer_count)
                info.difference = numberFormat(adjust.difference)
                info.type = "potato_corner";

                if (adjust.status === "pending") {
                    setPending((prev) => [...prev, info]);
                }
                if (adjust.status === "approved") {
                    setApproved((prev) => [...prev, info]);
                }
                if (adjust.status === "disapproved") {
                    setDisapproved((prev) => [...prev, info]);
                }
                if (adjust.status === "system") {
                    setSystem((prev) => [...prev, info]);
                }
            });
        } else if (response2.error) {
        }
    }

    async function filterDatePO(e) {
        setShowLoader(true);
        clearTables();
        const { name, value } = e.target;
        var filterDateNew = filterDate;
        filterDateNew[name] = value;
        setFilterDate(filterDateNew);

        if (name === "branch_id" && value === "00") {
            const response = await getAllAdjustments();
            var pendingAdjust = [];
            var approvedAdjust = [];
            var disapprovedAdjust = [];
            var systemAdjust = [];

            if (response.data) {
                var adjustment = response.data.data.map((adjust) => {
                    var info = adjust;
                    info.encoded_on = Moment(adjust.added_on).format("MM-DD-YYYY");
                    return info;
                });

                pendingAdjust = adjustment.filter(
                    (adjust) => adjust.status === "pending"
                );
                setPending(pendingAdjust);

                approvedAdjust = adjustment.filter(
                    (adjust) => adjust.status === "approved"
                );
                setApproved(approvedAdjust);

                disapprovedAdjust = adjustment.filter(
                    (adjust) => adjust.status === "disapproved"
                );
                setDisapproved(disapprovedAdjust);

                systemAdjust = adjustment.filter(
                    (adjust) => adjust.status === "system"
                );
                setSystem(systemAdjust);
            } else if (response.error) {
                clearTables();
            }
            setShowLoader(false);
        } else {
            const response = await searchByDate(filterDate);
            var pendingAdjust = [];
            var approvedAdjust = [];
            var disapprovedAdjust = [];
            var systemAdjust = [];

            if (response.data) {
                var adjustment = response.data.data.map((adjust) => {
                    var info = adjust;
                    info.encoded_on = Moment(adjust.added_on).format("MM-DD-YYYY");
                    return info;
                });

                pendingAdjust = adjustment.filter(
                    (adjust) => adjust.status === "pending"
                );
                setPending(pendingAdjust);

                approvedAdjust = adjustment.filter(
                    (adjust) => adjust.status === "approved"
                );
                setApproved(approvedAdjust);

                disapprovedAdjust = adjustment.filter(
                    (adjust) => adjust.status === "disapproved"
                );
                setDisapproved(disapprovedAdjust);

                systemAdjust = adjustment.filter(
                    (adjust) => adjust.status === "system"
                );
                setSystem(systemAdjust);
            } else if (response.error) {
                clearTables();
            }
        }
        setShowLoader(false);
    }

    async function fetchSearchCounter(name) {
        setShowLoader(true);

        const response = await searchByCounter(name);
        var pendingAdjust = [];
        var approvedAdjust = [];
        var disapprovedAdjust = [];
        var systemAdjust = [];

        if (response.data) {
            var adjustment = response.data.data.map((adjust) => {
                var info = adjust;
                info.encoded_on = Moment(adjust.added_on);
                return info;
            });

            pendingAdjust = adjustment.filter(
                (adjust) => adjust.status === "pending"
            );
            setPending(pendingAdjust);

            approvedAdjust = adjustment.filter(
                (adjust) => adjust.status === "approved"
            );
            setApproved(approvedAdjust);

            disapprovedAdjust = adjustment.filter(
                (adjust) => adjust.status === "disapproved"
            );
            setDisapproved(disapprovedAdjust);

            systemAdjust = adjustment.filter(
                (adjust) => adjust.status === "system"
            );
            setSystem(systemAdjust);
        } else {
            clearTables();
        }
        setShowLoader(false);
    }

    useEffect(() => {
        fetchBranches();
        fetchAllItems();
        fetchAllItemType();
    }, []);

    React.useEffect(() => {
        searchAdjustments();
    }, [filterConfig]);

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
                        <h1 className="page-title"> OFFICE ADJUSTMENTS </h1>
                    </div>
                    {/* input search button */}
                    <div className="col-sm-6 d-flex justify-content-end">
                        <input
                            type="text"
                            name="remarks"
                            className="search-bar"
                            placeholder="Search remarks"
                            defaultValue=""
                            onChange={(e) => handleFilterChange(e)}
                        ></input>
                    </div>{" "}
                </div>{" "}
                {/* tabs */}
                <Tabs
                    activeKey={filterConfig.status}
                    defaultActiveKey={filterConfig.status}
                    id="PO-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="pending" title="pending">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex mb-4 filter">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Select Branch"
                                // defaultValue={{label: "All Branches", value:""}}
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    
                                }}
                                // value={branch}
                                options={branchOptions}
                                onChange={handleBranchChange}
                            />

                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder="Select item"
                                // defaultValue={{label: "All Items", value:""}}
                                styles={{
                                    control: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isSelected ? 'white' : '#169422',
                                    borderRadius: "7px",
                                    border: "0px",
                                    minHeight: "20px",
                                    maxHeight: "35px",
                                    }),
                                    input: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: state.isSelected? "white": "white",
                                        
                                    }),
                                    dropdownIndicator: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    singleValue: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    placeholder: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "white"
                                        
                                    }),
                                    
                                }}
                                // value={branch}
                                options={itemOptions}
                                onChange={handleItemChange}
                            />

                            <Form.Select
                                name="type_id"
                                className="date-filter me-2"
                                defaultValue={filterDate.type_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    Type
                                </option>
                                {itemType.length > 0 ? (
                                    itemType.map((data) => {
                                        return (
                                            <option value={data.id}>
                                                {data.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No type found)
                                    </option>
                                )}
                            </Form.Select>
                        </div>

                        {/* table */}
                        <AdjustmentTable
                            tableHeaders={[
                                ".",
                                "ENCODED ON",
                                "BRANCH",
                                "ITEM",
                                "DIFFERENCE",
                                "PHYS COUNT",
                                "COM COUNT",
                                "TYPE",
                                "REMARKS",
                                "COUNTED BY",
                            ]}
                            headerSelector={[
                                ".",
                                "encoded_on",
                                "branch_name",
                                "item_name",
                                "difference",
                                "physical_count",
                                "computer_count",
                                "type_name",
                                "remarks",
                                "counted_by_name",
                            ]}
                            tableData={adjustmentsManager}
                            showLoader={showLoader}
                            handleOnCheck={(row) => handleOnCheck(row)}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="approved" title="approved">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex mb-4 filter">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Branch"
                            // defaultValue={{label: "All Branches", value:""}}
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                }),
                                input: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: state.isSelected? "white": "white",
                                    
                                  }),
                                  dropdownIndicator: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  singleValue: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  placeholder: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  
                              }}
                            // value={branch}
                            options={branchOptions}
                            onChange={handleBranchChange}
                        />
                            {/* <Form.Select
                                name="branch_id"
                                className="date-filter me-2"
                                defaultValue={filterDate.branch_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    Branch
                                </option>
                                {branches.length > 0 ? (
                                    branches.map((data) => {
                                        return (
                                            <option value={data.id}>
                                                {data.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select item"
                            // defaultValue={{label: "All Items", value:""}}
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                }),
                                input: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: state.isSelected? "white": "white",
                                    
                                  }),
                                  dropdownIndicator: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  singleValue: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  placeholder: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  
                              }}
                            // value={branch}
                            options={itemOptions}
                            onChange={handleItemChange}
                        />
                            {/* <Form.Select
                                name="item_id"
                                className="date-filter me-2"
                                defaultValue={filterDate.item_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    Item
                                </option>
                                {items.length > 0 ? (
                                    items.map((data) => {
                                        return (
                                            <option value={data.id}>
                                                {data.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No item found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <Form.Select
                                name="type_id"
                                className="date-filter me-2"
                                defaultValue={filterDate.type_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    Type
                                </option>
                                {itemType.length > 0 ? (
                                    itemType.map((data) => {
                                        return (
                                            <option value={data.id}>
                                                {data.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No type found)
                                    </option>
                                )}
                            </Form.Select>
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "ENCODED ON",
                                "BRANCH",
                                "ITEM",
                                "DIFFERENCE",
                                "PHYS COUNT",
                                "COM COUNT",
                                "TYPE",
                                "REMARKS",
                                "ADM REMARKS",
                                "COUNTED BY",
                                "APPROVED BY",
                            ]}
                            headerSelector={[
                                "-",
                                "encoded_on",
                                "branch_name",
                                "item_name",
                                "difference",
                                "physical_count",
                                "computer_count",
                                "type_name",
                                "remarks",
                                "admin_remarks",
                                "counted_by_name",
                                "approved_by_name",
                            ]}
                            tableData={adjustmentsManager}
                            ViewBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="disapproved" title="disapproved">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex mb-4 filter">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select Branch"
                            // defaultValue={{label: "All Branches", value:""}}
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                }),
                                input: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: state.isSelected? "white": "white",
                                    
                                  }),
                                  dropdownIndicator: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  singleValue: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  placeholder: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  
                              }}
                            // value={branch}
                            options={branchOptions}
                            onChange={handleBranchChange}
                        />
                            {/* <Form.Select
                                name="branch_id"
                                className="date-filter me-2"
                                defaultValue={filterDate.branch_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    Branch
                                </option>
                                {branches.length > 0 ? (
                                    branches.map((data) => {
                                        return (
                                            <option value={data.id}>
                                                {data.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}
                            <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            placeholder="Select item"
                            // defaultValue={{label: "All Items", value:""}}
                            styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  backgroundColor: state.isSelected ? 'white' : '#169422',
                                  borderRadius: "7px",
                                  border: "0px",
                                  minHeight: "20px",
                                  maxHeight: "35px",
                                }),
                                input: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: state.isSelected? "white": "white",
                                    
                                  }),
                                  dropdownIndicator: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  singleValue: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  placeholder: (baseStyles, state) => ({
                                    ...baseStyles,
                                    color: "white"
                                    
                                  }),
                                  
                              }}
                            // value={branch}
                            options={itemOptions}
                            onChange={handleItemChange}
                        />
                            {/* <Form.Select
                                name="item_id"
                                className="date-filter me-2"
                                defaultValue={filterDate.item_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    Item
                                </option>
                                {items.length > 0 ? (
                                    items.map((data) => {
                                        return (
                                            <option value={data.id}>
                                                {data.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No item found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <Form.Select
                                name="type_id"
                                className="date-filter me-2"
                                defaultValue={filterDate.type_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    Type
                                </option>
                                {itemType.length > 0 ? (
                                    itemType.map((data) => {
                                        return (
                                            <option value={data.id}>
                                                {data.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No type found)
                                    </option>
                                )}
                            </Form.Select>
                        </div>

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "ENCODED ON",
                                "BRANCH",
                                "ITEM",
                                "DIFFERENCE",
                                "PHYS COUNT",
                                "COM COUNT",
                                "TYPE",
                                "REMARKS",
                                "ADM REMARKS",
                                "COUNTED BY",
                                "DAPPD BY",
                            ]}
                            headerSelector={[
                                "-",
                                "encoded_on",
                                "branch_name",
                                "item_name",
                                "difference",
                                "physical_count",
                                "computer_count",
                                "type_name",
                                "remarks",
                                "admin_remarks",
                                "counted_by_name",
                                "disapproved_by_name",
                            ]}
                            tableData={adjustmentsManager}
                            ViewBtn={(row) => ViewBtn(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
                {selectedTab && getType() === "admin" ? (
                    <>
                        <div className="d-flex justify-content-end pt-3 mb-3 mr-3">
                            <button
                                type="button"
                                className="button-primary mr-3 "
                                onClick={() => handleShowAdjustmentModal()}
                            >
                                Approve
                            </button>
                            <button
                                type="button"
                                className="button-warning"
                                onClick={() => handleShowDisapproveModal()}
                            >
                                Disapprove
                            </button>
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </div>
            <AdjustmentModal
                show={showAdjustmentModal}
                hide={handleAdjustmentModal}
                type="approved"
                ids={checkedAdjustments}
                status="approved"
                request_type="office"
            />
            <AdjustmentModal
                show={showDisapproveModal}
                hide={handleDisapproveModal}
                type="disapproved"
                ids={checkedAdjustments}
                status="disapproved"
                request_type="office"
            />
        </div>
    );
}
