import React, { useState } from "react";
import {
    ButtonGroup,
    Col,
    Container,
    Dropdown,
    DropdownButton,
    Form,
    Row,
    Tab,
    Tabs,
} from "react-bootstrap";

//components
import Table from "../../Components/TableTemplate/Table";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";

//css
import "../../Components/Navbar/Navbar.css";

import { branchesMockData } from "../../Helpers/mockData/mockData";
import {
    createBranch,
    deleteBranch,
    getAllBranches,
    searchBranch,
    updateBranch,
} from "../../Helpers/apiCalls/Manage/Branches";
import toast from "react-hot-toast";
import {
    toastStyle,
    refreshPage,
    isAdmin,
    formatDate,
    TokenExpiry,
    capitalizeFirstLetter,
    getTodayDateISO
} from "../../Helpers/Utils/Common";
import {
    faGaugeSimpleMed,
    faListNumeric,
} from "@fortawesome/free-solid-svg-icons";
import { validateBranches } from "../../Helpers/Validation/Manage/BanchesValidation";
import InputError from "../../Components/InputError/InputError";
import ReactDatePicker from "react-datepicker";
import { setMinutes, setHours } from "date-fns";
import Moment from "moment";
import { getAllPriceLevels } from "../../Helpers/apiCalls/Manage/PriceLevels";
import { useNavigate } from "react-router-dom";
import { getAllBranchesPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import {
    createBranchPotato,
    deleteBranchPotato,
    searchBranchPotato,
    updateBranchPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Manage/Branches";
import {
    getAllBranchGroup,
    getAllBranchGroupPotato,
} from "../../Helpers/apiCalls/Manage/BranchGroupApi";
import {
    getAllInventoryGroup,
    getAllInventoryGroupPotato,
} from "../../Helpers/apiCalls/Manage/InventoryGroup";
import { CSVLink, CSVDownload } from "react-csv";
import downloadIcon from "../../Assets/Images/download_icon.png";

export default function Stores() {
    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    let navigate = useNavigate();
    const [addTo, setAddTo] = useState("");

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewBranchModal, setShowViewBranchModal] = useState(false);
    const handleShowViewBranchModal = () => setShowViewBranchModal(true);
    const handleCloseViewBranchModal = () => setShowViewBranchModal(false);

    // EDIT
    const [showEditBranchModal, setShowEditBranchModal] = useState(false);
    const handleShowEditBranchModal = () => setShowEditBranchModal(true);
    const handleCloseEditBranchModal = () => setShowEditBranchModal(false);

    // ADD
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const handleShowAddBranchModal = () => setShowAddBranchModal(true);
    const handleCloseAddBranchModal = () => {
        setAddTo("")
        setShowAddBranchModal(false);
    }

    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    const excelHeaders = [
        { label: "Branch Name", key: "branch_name" },
        { label: "Branch Type", key: "branch_type" },
        { label: "Address", key: "address" },
        { label: "Phone No.", key: "phone_number" },
    ];

    //API
    const [branchesData, setBranchesData] = useState([]);
    const [branchGroup, setBranchGroup] = useState([]);
    const [inventoryGroup, setInventoryGroup] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        name: "",
        tab: "MANGO MAGIC",
        is_franchise: "0,1",
    });
    const [selectedRow, setSelectedRow] = useState({
        name: "",
        address: "",
        contact_person_no: "",
        phone_no: "",
        tin_no: "",
        bir_no: "",
        franchisee_name: "",
        franchisee_contact_no: "",
        contract_start: "",
        contract_end: "",
        opening_date: "",
        price_level: "",
        contact_person: "",
    });
    const [priceLevel, setPriceLevels] = useState([]);

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        name: false,
        address: false,
        inventory_group_id: false,
        phone_no: false,
        initial_drawer: false,
        price_level: false,
        contact_person: false,
        contact_person_no: false,
        is_franchise: false,
        monthly_rental_fee: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        name: false,
        address: false,
        inventory_group_id: false,
        phone_no: false,
        initial_drawer: false,
        price_level: false,
        contact_person: false,
        contact_person_no: false,
        is_franchise: false,
        monthly_rental_fee: false,
    });

    const [osStartTime, setOsStartTime] = useState(new Date());
    const [osEndTime, setOsEndTime] = useState(new Date());

    const [deliveryStartTime, setDeliveryStartTime] = useState(new Date());
    const [deliveryEndTime, setDeliveryEndTime] = useState(new Date());

    const [osStartTimeEdit, setOsStartTimeEdit] = useState(new Date());
    const [osEndTimeEdit, setOsEndTimeEdit] = useState(new Date());

    const [deliveryStartTimeEdit, setDeliveryStartTimeEdit] = useState(
        new Date()
    );
    const [deliveryEndTimeEdit, setDeliveryEndTimeEdit] = useState(new Date());

    const [addBranchData, setAddBranchData] = useState({
        name: "",
        address: "",
        phone_no: "",
        inventory_group_id: "",
        contact_person_no: "",
        monthly_rental_fee: "",
        tin_no: "",
        bir_no: "",
        franchisee_name: "",
        franchisee_contact_no: "",
        contract_start: "",
        contract_end: "",
        opening_date: "",
        price_level: "",
        contact_person: "",
        initial_drawer: "",
        os_startDate: "monday",
        os_endDate: "sunday",
        os_startTime: "",
        os_endTime: "",
        delivery_startDate: "monday",
        delivery_endDate: "sunday",
        delivery_startTime: "",
        delivery_endTime: "",
        is_franchise: "",
    });

    const [editBranchData, setEditBranchData] = useState({
        id: "",
        name: "",
        address: "",
        phone_no: "",
        contact_person_no: "",
        inventory_group_id: "",
        monthly_rental_fee: "",
        tin_no: "",
        bir_no: "",
        franchisee_name: "",
        franchisee_contact_no: "",
        contract_start: "",
        contract_end: "",
        opening_date: "",
        price_level: "",
        contact_person: "",
        operation_schedule: "",
        delivery_schedule: "",
        is_franchise: "",
    });

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditBranchData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setAddBranchData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    };

    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };

    async function fetchBranchGroup() {
        setBranchGroup([]);
        //Mango
        if (addTo === "MANGO MAGIC" || selectedType === "mango") {
            const response = await getAllBranchGroup({});
            if (response.data) {
                var result = response.data.data;
                var mangoBranches = result.map((branch) => {
                    return {
                        type: "mango",
                        id: branch.id,
                        name: branch.name,
                    };
                });
                setBranchGroup(mangoBranches);
            } else if (response.error) {
            }
        }
        //Potato
        if (addTo === "POTATO CORNER" || selectedType === "potato") {
            const response2 = await getAllBranchGroupPotato({});

            if (response2.data) {
                var result = response2.data.data;
                var potatoBranches = result.map((branch) => {
                    return {
                        type: "potato",
                        id: branch.id,
                        name: branch.name,
                    };
                });
                setBranchGroup(potatoBranches);
            } else if (response2.error) {
            }
        }
    }

    async function fetchInventoryGroup() {
        setBranchGroup([]);
        //Mango
        if (addTo === "MANGO MAGIC" || selectedType === "mango") {
            const response = await getAllInventoryGroup({});
            if (response.data) {
                var result = response.data.data;
                var mangoInventory = result.map((inventory) => {
                    return {
                        type: "mango",
                        id: inventory.id,
                        name: inventory.name,
                    };
                });
                setInventoryGroup(mangoInventory);
            } else if (response.error) {
            }
        }
        //Potato
        if (addTo === "POTATO CORNER" || selectedType === "potato") {
            const response2 = await getAllInventoryGroupPotato({});

            if (response2.data) {
                var result = response2.data.data;
                var potatoInventory = result.map((inventory) => {
                    return {
                        type: "potato",
                        id: inventory.id,
                        name: inventory.name,
                    };
                });
                setInventoryGroup(potatoInventory);
            } else if (response2.error) {
            }
        }
    }

    async function fetchPriceLevel() {
        setPriceLevels([]);
        const response = await getAllPriceLevels();

        if (response) {
            setPriceLevels(response.data.data.data);
        }
    }

    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    async function searchBranches() {
        setBranchesData([]);
        setShowLoader(true);

        var array1 = []
        var array2 = []
        var array3 = []
        
        if(filterConfig.type === "mango") {
            const response = await searchBranch(filterConfig);
            if (response.data) {
                var result = response.data.data;
                var mangoBranches = result.map((branch) => {
                    return {
                        type: "mango",
                        branch_name: branch.name,
                        address: branch.address,
                        phone_number:
                            branch.contact_person_no || branch.phone_no,
                        initial_cash: branch.initial_drawer,
                        branch_type: branch.is_franchise === "0" ? "Company-owned - Mango" : branch.is_franchise === "1" ? "Franchise Branch" : "Others",
                        action_btn: ActionBtn(branch, "mango"),
                    };
                });
                array1 = array1.concat(mangoBranches)
            } else if (response.error) {
                TokenExpiry(response);
            }

            setBranchesData(array1);
        } else if(filterConfig.type === "potato") {
            const response2 = await searchBranchPotato(filterConfig);
            if (response2.data) {
                var result = response2.data.data;
                var potatoBranches = result.map((branch) => {
                    return {
                        type: "potato",
                        branch_name: branch.name,
                        address: branch.address,
                        phone_number:
                            branch.contact_person_no || branch.phone_no,
                        initial_cash: branch.initial_drawer,
                        branch_type: branch.is_franchise === "0" ? "Company-owned - Potato" : branch.is_franchise === "1" ? "Franchise Branch" : "Others",
                        action_btn: ActionBtn(branch, "potato"),
                    };
                });
                array2 = array2.concat(potatoBranches)
            } else if (response2.error) {
                TokenExpiry(response2);
            }
            setBranchesData(array2);

        } else {
            const response = await searchBranch(filterConfig);
            if (response.data) {
                var result = response.data.data;
                var mangoBranches = result.map((branch) => {
                    return {
                        type: "mango",
                        branch_name: branch.name,
                        address: branch.address,
                        phone_number:
                            branch.contact_person_no || branch.phone_no,
                        initial_cash: branch.initial_drawer,
                        branch_type: branch.is_franchise === "0" ? "Company-owned - Mango" : branch.is_franchise === "1" ? "Franchise Branch" : "Others",
                        action_btn: ActionBtn(branch, "mango"),
                    };
                });
                array1 = array1.concat(mangoBranches)
            } else if (response.error) {
                TokenExpiry(response);
            }
    
            const response2 = await searchBranchPotato(filterConfig);
            if (response2.data) {
                var result = response2.data.data;
                var potatoBranches = result.map((branch) => {
                    return {
                        type: "potato",
                        branch_name: branch.name,
                        address: branch.address,
                        phone_number:
                            branch.contact_person_no || branch.phone_no,
                        initial_cash: branch.initial_drawer,
                        branch_type: branch.is_franchise === "0" ? "Company-owned - Potato" : branch.is_franchise === "1" ? "Franchise Branch" : "Others",
                        action_btn: ActionBtn(branch, "potato"),
                    };
                });
                array2 = array2.concat(potatoBranches)
            } else if (response2.error) {
                TokenExpiry(response2);
            }
    
            array3 = array1.concat(array2)
            setBranchesData(array3);
        }
        setShowLoader(false);

    }

    async function create() {
        if (validateBranches(addBranchData, setIsError, addTo)) {
            setIsClicked(true);
            if (addTo === "MANGO MAGIC") {
                const response = await createBranch(addBranchData, {
                    osStartTime: osStartTime,
                    osEndTime: osEndTime,
                    deliveryStartTime: deliveryStartTime,
                    deliveryEndTime: deliveryEndTime,
                });
                if (response) {
                    if (response?.data?.status === "success") {
                        if (addBranchData.is_franchise === "1") {
                            setTimeout(() => navigate("/franchise/add"), 1000);
                        } else {
                            refreshPage();
                        }
                        setAddBranchData([]);
                        handleCloseAddBranchModal();
                    }
                    if (response?.error) {
                        toast.error(response.error.data.messages.error, {
                            style: toastStyle(),
                        });
                        handleCloseAddBranchModal();
                    }
                }
            } else if (addTo === "POTATO CORNER") {
                const response = await createBranchPotato(addBranchData, {
                    osStartTime: osStartTime,
                    osEndTime: osEndTime,
                    deliveryStartTime: deliveryStartTime,
                    deliveryEndTime: deliveryEndTime,
                });
                if (response) {
                    if (response?.data?.status === "success") {
                        toast.success("Successfully added branch!", {
                            style: toastStyle(),
                        });
                        if (addBranchData.is_franchise === "1") {
                            setTimeout(() => navigate("/franchise/add"), 1000);
                        } else {
                            refreshPage();
                        }
                        handleCloseAddBranchModal();
                    }
                    if (response?.error) {
                        toast.error(response.error.data.messages.error, {
                            style: toastStyle(),
                        });
                        handleCloseAddBranchModal();
                    }
                }
            }
        }
    }

    async function del() {
        if (selectedType === "mango") {
            const response = await deleteBranch(selectedRow.id);
            if (response) {
                if (response.data.status === "success") {
                    toast.success(response.data.response, {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                } else {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                }
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
            }
        } else if (selectedType === "potato") {
            const response = await deleteBranchPotato(selectedRow.id);
            if (response) {
                if (response.data.status === "success") {
                    toast.success(response.data.response, {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                } else {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                }
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
            }
        }
    }

    async function editBranch() {
        if (validateBranches(editBranchData, setIsErrorEdit, addTo)) {
            if (selectedType === "mango") {
                const response = await updateBranch(editBranchData, {
                    osStartTime: osStartTimeEdit,
                    osEndTime: osEndTimeEdit,
                    deliveryStartTime: deliveryStartTimeEdit,
                    deliveryEndTime: deliveryEndTimeEdit,
                });

                if (response) {
                    if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => refreshPage(), 1000);
                    } else {
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                    }
                } else {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                }
            } else if (selectedType === "potato") {
                const response = await updateBranchPotato(editBranchData, {
                    osStartTime: osStartTimeEdit,
                    osEndTime: osEndTimeEdit,
                    deliveryStartTime: deliveryStartTimeEdit,
                    deliveryEndTime: deliveryEndTimeEdit,
                });

                if (response) {
                    if (response.data.status === "success") {
                        toast.success(response.data.response, {
                            style: toastStyle(),
                        });
                        setTimeout(() => refreshPage(), 1000);
                    } else {
                        toast.error(response.data.response, {
                            style: toastStyle(),
                        });
                    }
                } else {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                }
            }
        }
    }

    function padTo2Digits(num) {
        return String(num).padStart(2, "0");
    }

    function formatSchedule(schedule) {
        if (schedule !== "") {
            var _sched = schedule.split("-");
            var dayStart = _sched[0];
            if (dayStart === "undefined") {
                dayStart = "";
            }
            var start = new Date(_sched[1]);
            var dayEnd = _sched[0];
            if (dayEnd === "undefined") {
                dayEnd = "";
            }
            var end = new Date(_sched[3]);
            return `${capitalizeFirstLetter(
                dayStart
            )} ${start.toLocaleTimeString()} to ${capitalizeFirstLetter(
                dayEnd
            )} ${end.toLocaleTimeString()}`;
        } else {
            return "--/--/---";
        }
    }

    //DROPDOWN
    function handleSelectChange(e, row, type) {
        setSelectedRow(row);
        setSelectedType(type);
        setEditBranchData(row);
        if (e.target.value === "delete-branch") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-branch") {
            if (row.operation_schedule !== "") {
                var OsSchedule = row.operation_schedule.split("-");
                row.os_startDate = OsSchedule[0];
                row.os_endDate = OsSchedule[2];

                var start = "";
                start = new Date(OsSchedule[1]);
                var end = "";
                end = new Date(OsSchedule[3]);

                setOsStartTimeEdit(start);
                setOsEndTimeEdit(end);
            }

            if (row.delivery_schedule !== "") {
                var deliverySchedule = row.delivery_schedule.split("-");
                row.delivery_startDate = deliverySchedule[0];
                setDeliveryStartTimeEdit(new Date(deliverySchedule[1]));
                row.delivery_endDate = deliverySchedule[2];
                setDeliveryEndTimeEdit(new Date(deliverySchedule[3]));
            }

            setEditBranchData(row);
            handleShowEditBranchModal();
        } else if (e.target.value === "view-branch") {
            handleShowViewBranchModal();
        } else {
            handleShowDeleteModal();
        }
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action form-select"
                id={row}
                onChange={(e) => handleSelectChange(e, row, type)}
                value={option}
            >
                <option defaulValue selected hidden>
                    Select
                </option>
                <option value="view-branch" className="color-options">
                    View
                </option>
                {isAdmin && (
                    <option value="edit-branch" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin && (
                    <option value="delete-branch" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //onEdit
    function handleOnEdit() {
        handleCloseViewBranchModal();
        handleShowEditBranchModal();
    }

    function renderBranchType(type) {
        switch (type) {
            case "0":
                return `BRANCH DETAILS (Company-owned branch)`;
            case "1":
                return `BRANCH DETAILS (Franchise branch)`;
            default:
                return `BRANCH DETAILS`;
        }
    }

    //API CALL

    React.useEffect(() => {
        fetchPriceLevel();
    }, []);

    React.useEffect(() => {
        searchBranches();
        fetchBranchGroup();
        fetchInventoryGroup();
    }, [filterConfig]);

    React.useEffect(() => {
        fetchBranchGroup();
        fetchInventoryGroup();
    }, [addTo, showEditBranchModal]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"STORE REPORTS"} 
                />
            </div>
            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <Row className="mb-2">
                    <Col xs={6}>
                        <h1 className="page-title"> LIST OF STORES </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
                            className="search-bar"
                            onChange={handleFilterChange}
                            placeholder="Search branch name..."
                        ></input>
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-end mb-4">
                        <div className="justify-content-center align-items-center ">
                            <CSVLink
                                className="button-primary px-3 py-3 justify-content-center align-items-center download-csv"
                                data={branchesData}
                                headers={excelHeaders}
                                target="_blank"
                                filename={`${getTodayDateISO()} ListOfStores`}
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

                {/* TABLE */}
                <Tabs
                    defaultActiveKey="all"
                    id="suppliers-tabs"
                    className="manager-tabs"
                >
                    <Tab eventKey="all" title="All">
                        <div>
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>
                                <Form.Select
                                    name="is_franchise"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="0,1" selected> All Branch Type </option>
                                    <option value="0"> Company Owned </option>
                                    <option value="1"> Franchise Branch </option>
                                </Form.Select>

                                <Form.Select
                                    name="type"
                                    className="date-filter me-3"
                                    onChange={(e) => handleOnSearch(e)}
                                    value={filterConfig.type}
                                >
                                    <option value="" hidden selected>
                                        Select Type
                                    </option>
                                    <option value="">All</option>
                                    <option value="mango">Mango Magic</option>
                                    <option value="potato">Potato Corner</option>
                                </Form.Select>
                            </div>

                            <Table
                                tableHeaders={[
                                    "BRANCH NAME",
                                    "TYPE",
                                    "ADDRESS",
                                    "PHONE NUMBER",
                                    "INITIAL CASH IN DRAWER",
                                ]}
                                headerSelector={[
                                    "branch_name",
                                    "branch_type",
                                    "address",
                                    "phone_number",
                                    "initial_cash",
                                ]}
                                tableData={branchesData}
                                showLoader={showLoader}
                                withActionData={true}
                            />
                        </div>
                    </Tab>
                </Tabs>
            </div>
            {/* MODALS */}
            <DeleteModal
                text="branch"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={() => del()}
            />
        </div>
    );
}
