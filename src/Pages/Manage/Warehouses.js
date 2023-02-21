import React, { useState, useRef, useEffect } from "react";
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
import "./Manage.css";
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
} from "../../Helpers/Utils/Common";
import {
    faGaugeSimpleMed,
    faListNumeric,
} from "@fortawesome/free-solid-svg-icons";
import { validateWarehouse } from "../../Helpers/Validation/Manage/WarehouseValidation";
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

export default function Warehouses() {
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

    //API
    const [branchesData, setBranchesData] = useState([]);
    const [branchGroup, setBranchGroup] = useState([]);
    const [inventoryGroup, setInventoryGroup] = useState([]);
    const [filterConfig, setFilterConfig] = useState({
        name: "",
        tab: "MANGO MAGIC",
        is_franchise: "3",
    });

    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-warehouses-filterConfig';
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
        address: false,
        phone_no: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        name: false,
        address: false,
        phone_no: false,
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
        is_franchise: "3",
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
        is_franchise: "3",
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

    function handleOnSearch(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    async function searchBranches() {
        setShowLoader(true);
        setBranchesData([]);

        //Mango
        if (filterConfig.tab === "MANGO MAGIC") {
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
                        branch_type: branch.is_franchise === "0" ? "Company-owned" : branch.is_franchise === "1" ? "Franchise Branch" : "Others",
                        action_btn: ActionBtn(branch, "mango"),
                    };
                });
                setBranchesData(mangoBranches);
            } else if (response.error) {
                TokenExpiry(response);
            }
        }

        //Potato
        if (filterConfig.tab === "POTATO CORNER") {
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
                        branch_type: branch.is_franchise === "0" ? "Company-owned" : branch.is_franchise === "1" ? "Franchise Branch" : "Others",
                        action_btn: ActionBtn(branch, "potato"),
                    };
                });
                setBranchesData(potatoBranches);
            } else if (response2.error) {
                TokenExpiry(response2);
            }
        }
        setShowLoader(false);
    }

    async function create() {
        if (validateWarehouse(addBranchData, setIsError, addTo)) {
            setIsClicked(true);
            const response = await createBranch(addBranchData, {
                osStartTime: osStartTime,
                osEndTime: osEndTime,
                deliveryStartTime: deliveryStartTime,
                deliveryEndTime: deliveryEndTime,
            });
            if (response) {
                if (response?.data?.status === "success") {
                    
                    const response2 = await createBranchPotato(addBranchData, {
                        osStartTime: osStartTime,
                        osEndTime: osEndTime,
                        deliveryStartTime: deliveryStartTime,
                        deliveryEndTime: deliveryEndTime,
                    });
                    if (response2) {
                        if (response2?.data?.status === "success") {
                            toast.success("Successfully added branch!", {
                                style: toastStyle(),
                            });
                            setTimeout(() => {
                                refreshPage()
                            }, 2000);
                            setAddBranchData([]);
                            handleCloseAddBranchModal();
                        }
                        if (response2?.error) {
                            toast.error(response2.error.data.messages.error, {
                                style: toastStyle(),
                            });
                            handleCloseAddBranchModal();
                            setTimeout(() => {
                                refreshPage()
                            }, 1000);
                        }
                    }
                }
                if (response?.error) {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                    handleCloseAddBranchModal();
                    setTimeout(() => {
                        refreshPage()
                    }, 1000);
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
        if (validateWarehouse(editBranchData, setIsErrorEdit, addTo)) {
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


    //DROPDOWN
    function handleSelectChange(e, row, type) {
        setSelectedRow(row);
        setSelectedType(type);
        setEditBranchData(row);
        if (e.target.value === "delete-branch") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-branch") {
            
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
        searchBranches();
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
                        <h1 className="page-title"> WAREHOUSES </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
                            className="search-bar"
                            onChange={handleFilterChange}
                            placeholder="Search warehouse name..."
                        ></input>
                         <button
                            className="add-btn"
                            onClick={handleShowAddBranchModal}
                        >
                            Add
                        </button>
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
                                    <option value="" selected> All Branch Type </option>
                                    <option value="0"> Company Owned </option>
                                    <option value="1"> Franchise Branch </option>
                                    <option value="2"> Others </option>
                                </Form.Select>
                            </div>

                            <Table
                                tableHeaders={[
                                    "BRANCH NAME",
                                    "ADDRESS",
                                    "PHONE NUMBER",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "branch_name",
                                    "address",
                                    "phone_number",
                                    "action_btn",
                                ]}
                                tableData={branchesData}
                                showLoader={showLoader}
                                withActionData={true}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="POTATO CORNER" title="Potato Corner">
                        <div>
                            <div className="my-2 px-2 PO-filters d-flex">
                                <span className="me-4 align-middle mt-2 ps-label">
                                    Filter By:
                                </span>
                                <Form.Select
                                    name="branch_type"
                                    className="date-filter me-2"
                                    onChange={(e) => handleOnSearch(e)}
                                >
                                    <option value="" selected> All Branch Type </option>
                                    <option value="company_owned"> Company Owned </option>
                                    <option value="franchise_branch"> Franchise Branch </option>
                                    <option value="others"> Others </option>
                                </Form.Select>
                            </div>
                            
                            <Table
                                tableHeaders={[
                                    "BRANCH NAME",
                                    "ADDRESS",
                                    "PHONE NUMBER",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "branch_name",
                                    "address",
                                    "phone_number",
                                    "action_btn",
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
            <AddModal
                title={`WAREHOUSE TO ${addTo}`}
                type="branch"
                show={showAddBranchModal}
                onHide={handleCloseAddBranchModal}
                onSave={() => create()}
                isProceed={addBranchData.is_franchise === "1" ? true : false}
                isClicked={isClicked}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BRANCH NAME
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="name"
                                value={addBranchData.name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.name}
                                message={"Branch name is required"}
                            />
                        </Col>
                        <Col>
                            ADDRESS
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="address"
                                value={addBranchData.address}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.address}
                                message={"Address is required"}
                            />
                        </Col>
                        <Col xl={3}>
                            PHONE NUMBER
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="phone_no"
                                value={addBranchData.phone_no}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.phone_no}
                                message={"Phone number is required"}
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title="WAREHOUSE"
                type="branch"
                show={showEditBranchModal}
                onHide={handleCloseEditBranchModal}
                onSave={() => editBranch()}
            >
                <div className="mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BRANCH NAME
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="name"
                                value={editBranchData.name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.name}
                                message={"Branch name is required"}
                            />
                        </Col>
                        <Col>
                            ADDRESS
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="address"
                                value={editBranchData.address}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.address}
                                message={"Address is required"}
                            />
                        </Col>
                        <Col xl={3}>
                            PHONE NUMBER
                            <span className="required-icon">*</span>
                            <Form.Control
                                type="text"
                                name="phone_no"
                                value={editBranchData.phone_no}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.phone_no}
                                message={"Phone number is required"}
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                withButtons
                show={showViewBranchModal}
                onHide={handleCloseViewBranchModal}
                onEdit={handleOnEdit}
            >
                <div className="mt-0">
                    <div className="col-sm-12 m-0 space">
                        <span className="custom-modal-body-title-branch-details">
                            {renderBranchType(selectedRow.is_franchise)}
                        </span>
                        <div className="mt-3 container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    BRANCH NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {selectedRow.name || "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col xl={6} className="nc-modal-custom-row-details">
                                    BRANCH ADDRESS
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {selectedRow.address || "N/A"}{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    PHONE NUMBER
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {selectedRow.phone_no || "N/A"}
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
