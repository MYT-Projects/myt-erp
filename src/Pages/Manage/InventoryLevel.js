import React, { useState, useRef, useEffect } from "react";
import {
    ButtonGroup,
    Button,
    Col,
    Container,
    Dropdown,
    DropdownButton,
    Table,
    Form,
    Row,
    Tab,
    Tabs,
} from "react-bootstrap";
import Select from "react-select";

//components
import TableTemplate from "../../Components/TableTemplate/Table";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";

//css
import "./Manage.css";
import "../../Components/Navbar/Navbar.css";
import trash from "../../Assets/Images/trash.png";

import { branchesMockData, itemsMockData } from "../../Helpers/mockData/mockData";
import {
    createBranch,
    deleteBranch,
    searchBranch,
    updateBranch,
} from "../../Helpers/apiCalls/Manage/Branches";
import { getAllBranches } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import toast from "react-hot-toast";
import {
    toastStyle,
    refreshPage,
    isAdmin,
    formatDate,
    TokenExpiry,
    capitalizeFirstLetter,
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
    getAllInventoryGroup,
    getAllInventoryGroupPotato,
    getInventoryGroup,
    getInventoryGroupPotato,
    createInventoryGroup,
    createInventoryGroupPotato,
    updateInventoryGroup,
    updateInventoryGroupPotato,
    deleteInventoryGroup,
    deleteInventoryGroupPotato
} from "../../Helpers/apiCalls/Manage/InventoryGroup";
import {
    getAllUsers,
} from "../../Helpers/apiCalls/usersApi";
import {
    getAllEmployees,
} from "../../Helpers/apiCalls/employeesApi";


export default function InventoryLevel() {
    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    let navigate = useNavigate();

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewBranchModal, setShowViewBranchModal] = useState(false);
    const handleShowViewBranchModal = () => setShowViewBranchModal(true);
    const handleCloseViewBranchModal = () => {
        setSelectedBranches([{}])
        setAddBranchData([])
        setEditBranchData([])
        setShowViewBranchModal(false)
    };

    // EDIT
    const [showEditBranchModal, setShowEditBranchModal] = useState(false);
    const handleShowEditBranchModal = () => setShowEditBranchModal(true);
    const handleCloseEditBranchModal = () => {
        setSelectedBranches([{}])
        setAddBranchData([])
        setEditBranchData([])
        setShowEditBranchModal(false)
    };

    // ADD
    const [showAddBranchModal, setShowAddBranchModal] = useState(false);
    const handleShowAddBranchModal = () => setShowAddBranchModal(true);
    const handleCloseAddBranchModal = () => {
        setSelectedBranches([{}])
        setAddBranchData([])
        setEditBranchData([])
        setShowAddBranchModal(false)
    };

    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    //API
    const [branchesData, setBranchesData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        name: "",
        tab: "MANGO MAGIC",
        is_franchise: "",
    });
    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-inventoryLevel-filterConfig';
    useEffect(()=>{
        if(isInitialMount.current){
            isInitialMount.current = false;
            setFilterConfig((prev) => {
                // console.log("override");
                if (window.localStorage.getItem(filterConfigKey) != null){
                    // console.log("found");
                    handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
                    return JSON.parse(window.localStorage.getItem(filterConfigKey))
                } else {
                    return {...prev}
                }
            });
        } else {
            window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
        }
    }, [filterConfig])

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
        details: false,
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

    const [addBranchData, setAddBranchData] = useState({});

    const [editBranchData, setEditBranchData] = useState({});
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [employeeValue, setEmployeeValue] = useState({
        name: "supervisor",
        label: "",
        value: "",
    });
    const [branchValue, setBranchValue] = useState({
        name: "branch_id",
        label: "",
        value: "",
    });
    const [selectedBranches, setSelectedBranches] = useState([
        {
            id: "", name: "",
        },
    ])

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

    const handleAddNameChange = (e, id) => {
        const { name, value, label } = e;
        if (e.name === "supervisor") {
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
            setAddBranchData({
                ...addBranchData,
                employee_id: e.value,
                supervisor: e.label,
            });
            setEditBranchData({
                ...editBranchData,
                employee_id: e.value,
                supervisor: e.label,
            });
        } else {
            var newBranchList = selectedBranches;
            var newEntries = newBranchList.map((branch, index) => {
                if (index === id) {
                    var info = {
                        name: name,
                        label: label,
                        value: value,
                    };
                    branch.entry = info;
                    branch.name = name;
                    branch.label = label;
                    branch.value = value;
                }
                return branch;
            });
            setSelectedBranches(newEntries);
        }
    };

    function handleAddBranch() {
        const newItem = {
            id: "",
            name: ""
        };
        setSelectedBranches((prevItems) => [...prevItems, newItem]);
    }

    function handleRemoveBranch(id) {
        const rowId = id;
        const newItemList = [...selectedBranches];
        newItemList.splice(rowId, 1);
        setSelectedBranches(newItemList);
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedBranches.map((selectedBranch, index) => {
                        return (
                            <tr>
                                <td >
                                    <Select
                                        className="react-select-container"
                                        placeholder="Select Branch..."
                                        value={selectedBranch.entry}
                                        options={branchOptions}
                                        onChange={(e) => handleAddNameChange(e, index)}
                                    />
                                </td>
                                <td>
                                    <div className="align-middle">
                                        <img
                                            src={trash}
                                            alt="delete"
                                            onClick={() =>
                                                handleRemoveBranch(index)
                                            }
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function renderViewTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {selectedBranches.map((selectedBranch, index) => {
                        return (
                            <tr>
                                <td >{selectedBranch.label}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    async function fetchBranches() {
        setShowLoader(true);
        const response = await getAllBranches();

        var branches = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = branches.map((branch) => {
            var info = {};

            info.name = "branch_id";
            info.label = `${branch.name} Branch`;
            info.value = `${branch.id}`;

            return info;
        });
        setBranchOptions(cleanedArray);
        setShowLoader(false);
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

    async function searchInventoryGroup() {
        setShowLoader(true);
        setBranchesData([]);
        //Mango
        if (filterConfig.tab === "MANGO MAGIC") {
            const response = await getAllInventoryGroup(filterConfig);
            if (response.data) {
                var inventoryLevel = [];
                var sortedData = response.data.data.sort((a, b) =>
                    a.name > b.name
                        ? 1
                        : b.name > a.name
                        ? -1
                        : 0
                );
                sortedData.map(async (branch) => {
                    var info = {};

                    info.type = "mango";
                    info.id = branch.id;
                    info.name = branch.name;
                    info.details = branch.details;
                    info.no_of_branches = branch.inventory_group_details.length;
                    info.inventory_group_details = branch.inventory_group_details;
                    info.action_btn = ActionBtn(branch, "mango");
                    inventoryLevel.push(info);
                });
                setBranchesData(inventoryLevel);
            } else if (response.error) {
                TokenExpiry(response);
            }
        } else if (filterConfig.tab === "POTATO CORNER") {
            const response2 = await getAllInventoryGroupPotato(filterConfig);

            if (response2.data) {
                var inventoryLevel = [];
                var sortedData = response2.data.data.sort((a, b) =>
                    a.name > b.name
                        ? 1
                        : b.name > a.name
                        ? -1
                        : 0
                );
                sortedData.map(async (branch) => {
                    var info = {};

                    info.type = "mango";
                    info.id = branch.id;
                    info.name = branch.name;
                    info.details = branch.details;
                    info.no_of_branches = branch.inventory_group_details.length;
                    info.inventory_group_details = branch.inventory_group_details;
                    info.action_btn = ActionBtn(branch, "potato");
                    inventoryLevel.push(info);
                });
                setBranchesData(inventoryLevel);
            } else if (response2.error) {
                TokenExpiry(response2);
            }
        }
        setShowLoader(false);
    }

    async function fetchAllEmployees() {
        setShowLoader(true);
        setEmployeeOptions([]);
        const response = await getAllUsers();
        if (response.data) {
            var employeesList = response.data.map((employee) => {
                if(employee.type === "supervisor") {
                    var info = {};

                    info.name = "supervisor";
                    info.label = employee.first_name + " " + employee.last_name;
                    info.value = employee.id;
                    info.first_name = employee.first_name;
                    info.last_name = employee.last_name;
                    info.middle_name = employee.middle_name;
                    info.full_name =
                        employee.first_name +
                        " " +
                        employee.middle_name +
                        " " +
                        employee.last_name;
                    // return info;
                    setEmployeeOptions((prev) => [...prev, info]);
                }
            });
        } else {
        }
        setShowLoader(false);
    }

    async function del() {
        if (selectedType === "mango") {
            const response = await deleteInventoryGroup(selectedRow.id);
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
                    setTimeout(() => refreshPage(), 1000);
                }
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
            }
        } else if (selectedType === "potato") {
            const response = await deleteInventoryGroup(selectedRow.id);
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
                    setTimeout(() => refreshPage(), 1000);
                }
            } else {
                toast.error(response.data.response, {
                    style: toastStyle(),
                });
            }
        }
    }

    function padTo2Digits(num) {
        return String(num).padStart(2, "0");
    }

    //DROPDOWN
    function handleSelectChange(e, row, type) {
        setSelectedRow(row);
        setSelectedType(type);
        setEditBranchData(row);

        var details = row.inventory_group_details.map((data) => {
            var info = data;
            info.name  = "branch";
            info.label  = data.branch_name;
            info.value  = data.branch_id;
            info.entry = info;
            return info;
        })
        setSelectedBranches(details);
        if (e.target.value === "delete-branch") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-branch") {
            setEditBranchData(row);
            navigate("/inventorylevel/edit/" + row.id + "/" + type)
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

    function ViewBtn(row) {
        return (
            <button
                name="action"
                className="btn btn-sm view-btn-table"
                id={row.id}
                value={"view-branch"}
                onClick={(e) => handleSelectChange(e, row, row.type)}
            >
                View
            </button>
        );
    }

    React.useEffect(() => {
        fetchBranches();
        fetchAllEmployees();
    }, []);

    React.useEffect(() => {
        searchInventoryGroup();
    }, [filterConfig]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"MANAGE"}
                />
            </div>
            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <Row className="mb-3">
                    <Col xs={6}>
                        <h1 className="page-title"> Inventory Level </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
                            className="search-bar"
                            onChange={handleFilterChange}
                            placeholder="Search inventory level name..."
                        ></input>
                        <DropdownButton
                            as={ButtonGroup}
                            title="Add"
                            id="bg-nested-dropdown"
                            className="add-btn"
                            onSelect={handleAddSelect}
                        >
                            <Dropdown.Item
                                eventKey="MANGO MAGIC"
                                onClick={() => navigate("/inventorylevel/add/mango")}
                            >
                                To Mango Magic
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="POTATO CORNER"
                                onClick={() => navigate("/inventorylevel/add/potato")}
                            >
                                To Potato Corner
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>
                {/* TABLE */}
                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="suppliers-tabs"
                    className="manager-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="MANGO MAGIC" title="Mango Magic">
                        <div className="tab-content">
                            <TableTemplate
                                tableHeaders={[
                                    "-",
                                    "GROUP NAME",
                                    "NO. OF BRANCHES",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "name",
                                    "no_of_branches",
                                    "action_btn",
                                ]}
                                tableData={branchesData}
                                showLoader={showLoader}
                                ViewBtn={(row) => ViewBtn(row)}
                                withActionData={true}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="POTATO CORNER" title="Potato Corner">
                        <div className="tab-content">
                            <TableTemplate
                                tableHeaders={[
                                    "-",
                                    "GROUP NAME",
                                    "NO. OF BRANCHES",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "-",
                                    "name",
                                    "no_of_branches",
                                    "action_btn",
                                ]}
                                tableData={branchesData}
                                showLoader={showLoader}
                                ViewBtn={(row) => ViewBtn(row)}
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
            <ViewModal
                withButtons
                show={showViewBranchModal}
                onHide={handleCloseViewBranchModal}
                onEdit={() => navigate("/inventorylevel/edit/" + selectedRow.id + "/" + selectedType)}
            >
                <div className="mt-0">
                    <div className="col-sm-12 m-0 space container-wrapper">
                        <Row className="nc-modal-custom-row-view mt-0">
                            <Col>
                                INVENTORY GROUP NAME
                                <Row className="nc-modal-custom-row ms-2">
                                    <Col>
                                        {selectedRow?.name ||
                                            "N/A"}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    <div className="col-sm-12 m-0 space">
                        <Row className="nc-modal-custom-row">
                            <Col>BRANCHES</Col>
                        </Row>
                        <Row className="nc-modal-custom-row">
                            <div className="edit-purchased-items">
                                {selectedBranches.length === 0 ? (
                                    <span>No Branch Found!</span>
                                ) : (
                                    renderViewTable() 
                                )}
                            </div>
                        </Row>
                    </div>
                </div>
            </ViewModal>
        </div>
    );
}
