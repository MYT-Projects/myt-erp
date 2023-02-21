import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";

//components***********
import Navbar from "../../Components/Navbar/Navbar";
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
import Table from "../../Components/TableTemplate/Table";
import {
    getTodayDate,
    refreshPage,
    toastStyle,
    TokenExpiry,
    formatDate,
    dateFormat,
    getType,
    numberFormat,
    numberFormatInt,
    formatDateNoTime
} from "../../Helpers/Utils/Common";
import RequestModal from "./Requests/RequestModal";
import ApproveRequestModal from "./Requests/ApproveRequestModal";

//api***********
import { getAllRequests, 
    getAllRequestsPotato , 
    getRequest, 
    getRequestPotato, 
    changeRequestStatus, 
    changeRequestStatusPotato,
    createTransferRequest,
    createTransferRequestPotato,
    deleteRequest,
    deleteRequestPotato
} from "../../Helpers/apiCalls/Inventory/RequestsApi";
import { getAllBranches } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllBranchesPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";


//css***********
import "./Inventory.css";
import "../../Components/Navbar/Navbar.css";
import Moment from "moment";

export default function Requests() {
    //****VARIABLES****//
    let navigate = useNavigate();
    var dateToday = getTodayDate();
    const [inactive, setInactive] = useState(false);
    const [addTo, setAddTo] = useState("");
    const [requestManager, setRequestManager] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedRow, setSelectedRow] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    
    const [filterConfig, setFilterConfig] = useState({
        tab: "for_approval",
        requester_id: "",
        date_from: "",
        date_to: "",
    });

    const [branchOptions, setBranchOptions] = useState([]);

    useEffect(()=>{
        // console.log(franchisees)
        // console.log(branches);
        // return;
        // var branchName = "";
        // var currentBranch = {}
        setBranchOptions(branches.map((_branch)=>{
            var retval = {label: _branch.name, value:_branch.id}
            return retval;
        }))

        setBranchOptions((branches)=>{
            var newBranches = [...branches];
            newBranches.push({label: "All Branches", value:""})
            return newBranches.reverse();
        });
    },[branches])

    function handleBranchChange(e){
        // console.log(e);
        const toFilter = {target: {name: "branch_from", value: e.value}};
        handleFilterChange(toFilter);
    }

    const isInitialMount = useRef(true);
    const filterConfigKey = 'inventory-requests-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 // console.log("found");
    //                 handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])

    /* Approve Modal */
    const [showApproveModal, setShowApproveModal] = useState(false);
    const handleShowApproveModal = () => setShowApproveModal(true);
    const handleCloseApproveModal = () => setShowApproveModal(false);

    /* Disapprove Modal */
    const [showDisapproveModal, setShowDisapproveModal] = useState(false);
    const handleShowDisapproveModal = () => setShowDisapproveModal(true);
    const handleCloseDisapproveModal = () => setShowDisapproveModal(false);

    /* Delete Modal */
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    //****FUNCTIONS****
    const handleAddSelect = (e) => {
        setAddTo(e);
    };
    
    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return {
                 ...prev, 
                 tab: tabKey,
                 date_from: "",
                 date_to: "", 
                 branch_from: "", 
                };
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return {
                ...prev,
                [name]: value,
            };
        });
    };

    async function handleSelectChange(e, id, row) {
        console.log(e);
        console.log(row);
        setSelectedRow(row);

        switch (e.target.value) {

            case "reject-po":
                handleShowDisapproveModal();
                setSelectedId(id);
                break;
            
            case "delete-po":
                handleShowDeleteModal();
                setSelectedId(id);
                break;

            case "print-po":
                navigate("/requests/view/" + row.doc_no + "/" + row.status);
                break;

            case "create-po":
                handleShowApproveModal()
                break;

            case "view-po":
                navigate("/requests/view/" + row.doc_no + "/" + row.status);
                break;
        }
    }

    function handleCreateTransfer(row) {
        console.log(row);
        setSelectedRow(row);

        handleShowApproveModal();

    }


    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                id={row.id}
                onChange={(e) => handleSelectChange(e, row.id, row)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                <option value="view-po" className="color-options">
                    View
                </option>
                {type !== "pending" && (
                    <option value="print-po" className="color-options">
                        Print
                    </option>
                )}
                {type === "pending" && (
                    <>
                    <option value="create-po" className="color-options">
                        Create Transfer
                    </option>
                    <option value="reject-po" className="color-red">
                        Reject
                    </option>
                    </>
                )}
                <option value="delete-po" className="color-red">
                    Delete
                </option>
            </Form.Select>
        );
    }

    function ReviewAction(row) {
        // console.log(row)
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={() =>
                    handleReviewAction(row, row.id, row.status)
                }
            >
                Review
            </button>
        );
    }

    async function handleReviewAction(row, id, status) {
        // console.log(row.branch_name, id, status)  
        navigate("/requests/view/" + row.doc_no + "/" + status);
    }

    function ViewAction(row) {
        // console.log(row)
        return (
            <button
                type="button"
                className="btn btn-sm view-btn-table"
                onClick={() =>
                    handleViewAction(row, row.id, row.status)
                }
            >
                View
            </button>
        );
    }

    async function handleViewAction(row, id, status) {
        navigate("/requests/view/" + row.doc_no + "/" + status);
    }

    function redirectToTransfer() {
        if(selectedRow.shopType === "Mango"){
            navigate("/transfers/add/" + selectedRow.id + "/mango_magic")
        } else if(selectedRow.shopType === "Potato"){
            navigate("/transfers/add/" + selectedRow.id + "/potato_corner")
        }
    }


    //****API CALLS****
    async function fetchBranches() {
        setShowLoader(true);
        setBranches([])
        const response = await getAllBranches();
        console.log(response);

        var branches = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = branches.map((branch) => {
            if(branch.is_franchise === "0"){
                var info = branch;
                setBranches((prev)=>[...prev, info]);
            }
        });
        setShowLoader(false);
    }

    async function fetchRequests() {
        setShowLoader(true);
        setRequestManager([])
        const response = await getAllRequests(filterConfig);
        console.log(response);

        if(response.data){
            setRequestManager([])
            var sortedData = response.data.data.sort((a, b) =>
                a.request_date > b.request_date
                    ? 1
                    : b.request_date > a.request_date
                    ? -1
                    : 0
            );
            var requestsMango = sortedData.reverse().map((req) => {
                var stat = req.status.split("_")
                var info = req;
                info.doc_no = "Mango-" + req.id;
                info.shopType = "Mango";
                info.status = stat.length < 2 ? req.status : stat[0] + " " + stat[1]
                info.request_date = (req.request_date !== "0000-00-00") ? Moment(req.request_date).format("MM-DD-YYYY") : "";
                info.delivery_date = (req.delivery_date !== "0000-00-00") ? Moment(req.delivery_date).format("MM-DD-YYYY") : "";
                info.received_date = req.completed_on ? Moment(req.completed_on).format("MM-DD-YYYY") : "N/A";
                setRequestManager((prev)=>[...prev, info]);
            });
        }
        

        const response2 = await getAllRequestsPotato(filterConfig);
        console.log(response2);

        if(response2.data){
            var sortedData = response2.data.data.sort((a, b) =>
                a.request_date > b.request_date
                    ? 1
                    : b.request_date > a.request_date
                    ? -1
                    : 0
            );
            var requestsPotato = sortedData.reverse().map((req) => {
                var stat = req.status.split("_")
                var info = req;
                info.doc_no = "Potato-" + req.id;
                info.shopType = "Potato";
                info.status = stat.length < 2 ? req.status : stat[0] + " " + stat[1]
                info.request_date = (req.request_date !== "0000-00-00") ? Moment(req.request_date).format("MM-DD-YYYY") : "";
                info.delivery_date = (req.delivery_date !== "0000-00-00") ? Moment(req.delivery_date).format("MM-DD-YYYY") : "";
                info.received_date = req.received_date ? Moment(req.received_date).format("MM-DD-YYYY") : "N/A";
                setRequestManager((prev)=>[...prev, info]);
            });
        }
        setShowLoader(false);
    }

    async function saveRequest() {
        if (selectedRow.shopType === "Mango") {
            const response = await createTransferRequest(selectedRow, selectedRow.request_items);
            if (response.data.status === "success") {

                const response2 = await changeRequestStatus(selectedRow.id, "processing");
                if (response2.data) {
                    toast.success("Successfully created transfer!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        refreshPage();
                    }, 1000);
                } else if (response2.error) {
                    toast.error(
                        "Something went wrong",
                        { style: toastStyle() }
                    );
                    setTimeout(() => {
                        refreshPage();
                    }, 1000);
                }
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
                // refreshPage();
            }

        } else if (selectedRow.shopType === "Potato") {
            const response = await createTransferRequestPotato(selectedRow, selectedRow.request_items);
            if (response.data.status === "success") {
                const response2 = await changeRequestStatus(selectedRow.id, "processing");
                if (response2.data) {
                    toast.success("Successfully created transfer!", {
                        style: toastStyle(),
                    });
                    setTimeout(() => {
                        navigate(-1);
                    }, 1000);
                } else if (response2.error) {
                    toast.error(
                        "Something went wrong",
                        { style: toastStyle() }
                    );
                    setTimeout(() => {
                        navigate(-1);
                    }, 1000);
                }
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
            }
        }
    }

    async function rejectRequest() {
        if (selectedRow.shopType === "Mango") {
            const response = await changeRequestStatus(selectedRow.id, "rejected");
            if (response.data) {
                toast.success("Successfully rejected request!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => refreshPage(), 1000);
            }
        } else if (selectedRow.shopType === "Potato") {
            const response = await changeRequestStatusPotato(selectedRow.id, "rejected");
            if (response.data) {
                toast.success("Successfully rejected request!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => refreshPage(), 1000);
            }
        }
        
    }

    async function deleteRequestMod() {
        if (selectedRow.shopType === "Mango") {
            const response = await deleteRequest(selectedRow.id);
            if (response.data) {
                toast.success("Successfully deleted request!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => refreshPage(), 1000);
            }
        } else if (selectedRow.shopType === "Potato") {
            const response = await deleteRequestPotato(selectedRow.id);
            if (response.data) {
                toast.success("Successfully deleted request!", {
                    style: toastStyle(),
                });
                setTimeout(() => refreshPage(), 1000);
            } else if (response.error) {
                TokenExpiry(response);
                toast.error(
                    "Something went wrong",
                    { style: toastStyle() }
                );
                setTimeout(() => refreshPage(), 1000);
            }
        }
        
    }

    React.useEffect(() => {
        setRequestManager([])
        fetchBranches();
    }, []);

    React.useEffect(() => {
        setRequestManager([])
        fetchRequests();
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
            <div className={`manager-container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    <div className="col-sm-6">
                        <h1 className="page-title"> REQUESTS </h1>
                    </div>
                    {/* input search button */}
                    <div className="col-sm-6 d-flex justify-content-end">
                        <input
                            type="search"
                            name="branch_to_name"
                            placeholder="Search Request To..."
                            value={filterConfig.branch_to_name}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                    </div>
                </div>
                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="PO-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="for_approval" title="For Approval">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"All Branches"}
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
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchChange}
                            />

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_from: date,
                                        };
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
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_to: date,
                                        };
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

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE REQUESTED",
                                "DOC NO.",
                                "DELIVERY DATE",
                                // "DATE RECEIVED",
                                // "APPROVED BY",
                                "REQUEST FROM",
                                "REQUEST TO",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "request_date",
                                "id",
                                "delivery_date",
                                // "received_date",
                                // "approved_by_name",
                                "branch_from_name",
                                "branch_to_name",
                                "status",
                            ]}
                            tableData={requestManager}
                            ActionBtn={(row) => ActionBtn(row, "for_approval")}
                            ViewBtn={(row) => ReviewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="pending" title="Pending">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"All Branches"}
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
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchChange}
                            />
                            {/* <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {branches.length > 0 ? (
                                    branches.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_from: date,
                                        };
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
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_to: date,
                                        };
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

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE REQUESTED",
                                "DOC NO.",
                                "DELIVERY DATE",
                                // "DATE RECEIVED",
                                "APPROVED BY",
                                "REQUEST FROM",
                                "REQUEST TO",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "request_date",
                                "id",
                                "delivery_date",
                                // "received_date",
                                "approved_by_name",
                                "branch_from_name",
                                "branch_to_name",
                                "status",
                            ]}
                            tableData={requestManager}
                            ActionBtn={(row) => ActionBtn(row, "pending")}
                            ViewBtn={(row) => ReviewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="processing" title="Processed">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"All Branches"}
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
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchChange}
                            />
                            {/* <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {branches.length > 0 ? (
                                    branches.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_from: date,
                                        };
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
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_to: date,
                                        };
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

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE REQUESTED",
                                "DOC NO.",
                                "DELIVERY DATE",
                                // "DATE RECEIVED",
                                "ENCODED BY",
                                "REQUEST FROM",
                                "REQUEST TO",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "request_date",
                                "id",
                                "delivery_date",
                                // "received_date",
                                "encoded_by_name",
                                "branch_from_name",
                                "branch_to_name",
                                "status",
                            ]}
                            tableData={requestManager}
                            ActionBtn={(row) => ActionBtn(row, "processed")}
                            ViewBtn={(row) => ViewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="completed" title="completed" className="manager-tabs">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"All Branches"}
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
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchChange}
                            />
                            {/* <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {branches.length > 0 ? (
                                    branches.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_from: date,
                                        };
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
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_to: date,
                                        };
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

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE REQUESTED",
                                "DOC NO.",
                                "DELIVERY DATE",
                                "DATE RECEIVED",
                                "ENCODED BY",
                                "REQUEST FROM",
                                "REQUEST TO",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "request_date",
                                "id",
                                "delivery_date",
                                "received_date",
                                "encoded_by_name",
                                "branch_from_name",
                                "branch_to_name",
                                "status",
                            ]}
                            tableData={requestManager}
                            ActionBtn={(row) => ActionBtn(row, "completed")}
                            ViewBtn={(row) => ViewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>

                    <Tab eventKey="rejected" title="Reject">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"All Branches"}
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
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchChange}
                            />
                            {/* <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {branches.length > 0 ? (
                                    branches.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_from: date,
                                        };
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
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_to: date,
                                        };
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

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE REQUESTED",
                                "DOC NO.",
                                "DELIVERY DATE",
                                "DATE RECEIVED",
                                "ENCODED BY",
                                "REQUEST FROM",
                                "REQUEST TO",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "request_date",
                                "id",
                                "delivery_date",
                                "received_date",
                                "encoded_by_name",
                                "branch_from_name",
                                "branch_to_name",
                                "status",
                            ]}
                            tableData={requestManager}
                            ActionBtn={(row) => ActionBtn(row, "reject")}
                            ViewBtn={(row) => ViewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="all" title="All">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Select
                                className="dropsearch-filter px-0 py-0 me-2"
                                classNamePrefix="react-select"
                                placeholder={"All Branches"}
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
                                // value={branchFrom}
                                options={branchOptions}
                                onChange={handleBranchChange}
                            />
                            {/* <Form.Select
                                name="branch_from"
                                className="date-filter me-2"
                                defaultValue={filterConfig.franchisee_id}
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option value="" selected>
                                    All Branches
                                </option>
                                {branches.length > 0 ? (
                                    branches.map((franchisee) => {
                                        return (
                                            <option
                                                value={franchisee.id}
                                                selected={
                                                    franchisee.id ===
                                                    filterConfig.franchisee
                                                }
                                            >
                                                {franchisee.name}
                                            </option>
                                        );
                                    })
                                ) : (
                                    <option value="" disabled>
                                        (No branch found)
                                    </option>
                                )}
                            </Form.Select> */}

                            <span className="me-3 align-middle mt-2">
                                Date From:
                            </span>
                            <DatePicker
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_from}
                                name="date_from"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_from: date,
                                        };
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
                                placeholderText={"Select Date"}
                                selected={filterConfig.date_to}
                                name="date_to"
                                onChange={(date) => {
                                    setFilterConfig((prev) => {
                                        return {
                                            ...prev,
                                            date_to: date,
                                        };
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

                        {/* table */}
                        <Table
                            tableHeaders={[
                                "-",
                                "DATE REQUESTED",
                                "DOC NO.",
                                "DELIVERY DATE",
                                "DATE RECEIVED",
                                "ENCODED BY",
                                "REQUEST FROM",
                                "REQUEST TO",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "-",
                                "request_date",
                                "id",
                                "delivery_date",
                                "received_date",
                                "encoded_by_name",
                                "branch_from_name",
                                "branch_to_name",
                                "status",
                            ]}
                            tableData={requestManager}
                            ActionBtn={(row) => ActionBtn(row, "all")}
                            ViewBtn={(row) => ViewAction(row)}
                            showLoader={showLoader}
                        />
                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>
            <ApproveRequestModal
                show={showApproveModal}
                hide={handleCloseApproveModal}
                type="create transfer"
                handler={redirectToTransfer}
            />
            <RequestModal
                show={showDisapproveModal}
                hide={handleCloseDisapproveModal}
                type="reject"
                selectedRow={selectedRow}
                page={"table"}
            />
            <ApproveRequestModal
                show={showDeleteModal}
                hide={handleCloseDeleteModal}
                type="delete"
                handler={deleteRequestMod}
            />
        </div>
    );
}
