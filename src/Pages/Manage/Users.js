import React, { useState, useRef, useEffect } from "react";
import { Col, Row, Form, Container, Tab, Tabs, Dropdown, DropdownButton, ButtonGroup, } from "react-bootstrap";
import Select from "react-select";
import { Navigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { isAdmin, toastStyle } from "../../Helpers/Utils/Common";

//components
import Table from "../../Components/TableTemplate/Table";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import ViewModal from "../../Components/Modals/ViewModal";
import EditModal from "../../Components/Modals/EditModal";
import InputError from "../../Components/InputError/InputError";

//css
import "./Manage.css";
import "../../Components/Navbar/Navbar.css";

//api
import {
    createUser,
    getAllUsers,
    getSingleUser,
    editUser,
    deleteUser,
    searchUser,
} from "../../Helpers/apiCalls/usersApi";
import {
    createUserPotato,
    getAllUsersPotato,
    getSingleUserPotato,
    editUserPotato,
    deleteUserPotato,
    searchUserPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Manage/usersApi";
import { refreshPage } from "../../Helpers/Utils/Common";
import { validateUsers } from "../../Helpers/Validation/Manage/UsersValidation";
import {
    getAllEmployees,
    createEmployee,
    getEmployee,
    deleteEmployee,
    searchEmployee,
    updateEmployee,
} from "../../Helpers/apiCalls/employeesApi";
import { getAllBranches } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllBranchesPotato } from "../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";

export default function Users() {
    const { id } = useParams();
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewUserModal, setShowViewUserModal] = useState(false);
    const handleShowViewUserModal = () => setShowViewUserModal(true);
    const handleCloseViewUserModal = () => setShowViewUserModal(false);

    // EDIT
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const handleShowEditUserModal = () => setShowEditUserModal(true);
    const handleCloseEditUserModal = () => {
        setEmployeeValue({})
        setShowEditUserModal(false);
    }

    // ADD
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const handleShowAddUserModal = () => setShowAddUserModal(true);
    const handleCloseAddUserModal = () => setShowAddUserModal(false);

    //API
    const [usersData, setUsersData] = useState([]);
    const [branchUsers, setBranchUsers] = useState([]);
    const [officeUsers, setOfficeUsers] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [userData, setUserData] = useState({});
    const [selectedID, setSelectedID] = useState("");
    const [userDetails, setUserDetails] = useState({
        first_name: "",
        middle_name: " ",
        last_name: "",
        email: "",
        type: "",
        addTo: "",
        username: "",
        password: "",
        confirm_password: "",
        employee_id: "",
    });
    const [employeeValue, setEmployeeValue] = useState({
        name: "first_name",
        label: "",
        value: "",
    });
    const [branchValue, setBranchValue] = useState({
        name: "buyer_branch_id",
        label: "",
        value: "",
    });

    const [filterConfig, setFilterConfig] = useState({
        tab: "office",

    });
    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };
    const [shop, setShop] = useState("");
    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-users-filterConfig';
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
    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    //REQUIRED ERROR HANDLING
    const [isError, setIsError] = useState({
        first_name: false,
        middle_name: false,
        last_name: false,
        email: false,
        type: false,
        username: false,
        confirm_password: false,
    });
    const [employeeData, setEmployeeData] = useState({});
    const [employeesData, setEmployeesData] = useState([]);

    //ONCHANGE
    //ADD or CREATE USER
    const handleAddChange = (e) => {
        const { name, value } = e.target;
        if(name === "addTo") {
            setShop(value)
            fetchBranches(value);
        } else {
            setUserDetails((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };
    console.log(shop)

    //ADD or CREATE USER
    const handleAddNameChange = (e) => {
        const { name, value } = e;
        if (e.name === "first_name") {
            setEmployeeValue({ name: e.name, label: e.label, value: e.value });
            setUserData({
                ...userData,
                employee_id: e.value,
                first_name: e.first_name,
                middle_name: e.middle_name,
                last_name: e.last_name,
            });
            setUserDetails({
                ...userDetails,
                employee_id: e.value,
                first_name: e.first_name,
                middle_name: e.middle_name,
                last_name: e.last_name,
            });
        } else {
            setBranchValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
            setUserData({
                branch_id: e.value,
                first_name: e.label,
                type: "branch"
            });
            setUserDetails({
                branch_id: e.value,
                first_name: e.label,
                type: "branch"
            });
        }
    };

    //EDIT or UPDATE USER
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    //onEdit
    function handleOnEdit() {
        handleCloseViewUserModal();
        handleShowEditUserModal();
    }

    const [searchUsername, setSearchUsername] = useState("");

    // SEARCH USER
    function handleOnSearch(e) {
        setSearchUsername(e.target.value);
    }

    //DELETE or REMOVE USER
    function handleDeleteUser() {
        removeUser(selectedID);
    }

    //API CALL
    async function fetchAllEmployees() {
        const response = await getAllEmployees();
        if (response.data.data) {
            var employeesList = response.data.data.map((employee) => {
                var info = {};

                info.name = "first_name";
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
                return info;
            });
            setEmployeeOptions(employeesList);
        } else {
            setEmployeesData([]);
        }
    }

    async function fetchBranches(shop) {
        setBranchOptions([])
        if(shop === "mango_magic") {
            const response = await getAllBranches();

            var branches = response.data.data.filter((data) => {
                return data.has_account_already === "0"
            }).filter((data) => {
                return data.is_franchise === "0"
            })
            .sort((a, b) =>
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
        } else {
            const response = await getAllBranchesPotato();
            var branches = response.data.data.filter((data) => {
                return data.has_account_already === "0"
            }).filter((data) => {
                return data.is_franchise === "0"
            })
            .sort((a, b) =>
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
        }
        
    }

    //DROPDOWN
    function handleSelectChange(e, row) {
        console.log(row, row.pin)
        fetchUser(row.pin);
        setSelectedID(row.pin);
        if (e.target.value === "delete-user") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-user") {
            handleShowEditUserModal();
        } else if (e.target.value === "view-user") {
            handleShowViewUserModal();
        } else {
            refreshPage();
        }
    }

    function ActionBtn(row) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action form-select"
                id={row.id}
                onChange={(e) => handleSelectChange(e, row)}
                value={option}
            >
                <option defaulValue selected hidden>
                    Select
                </option>
                <option value="view-user" className="color-options">
                    View
                </option>
                {isAdmin && (
                    <option value="edit-user" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin && (
                    <option value="delete-user" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //API CALL
    async function fetchSearchUser() {
        setShowLoader(true);
        const response = await searchUser(searchUsername);
        if (response.data) {
            var userList = response.data;
            response.data.map(
                (data, key) =>
                    (userList[key].middle_name = data.middle_name || " ")
            );
            response.data.map(
                (data, key) =>
                    (userList[key].full_name =
                        data.first_name +
                        " " +
                        data.middle_name +
                        " " +
                        data.last_name)
            );
            const filteredList = userList.filter((v, i) => {
                return userList.map((val) => val.id).indexOf(v.id) == i;
            });

            var branchData = filteredList.filter(
                (user) => user.type === "branch"
            );
            var otherData = filteredList.filter(
                (user) => user.type !== "branch"
            );

            setBranchUsers(branchData)
            setOfficeUsers(otherData)

            setUsersData(filteredList);
        } else {
            setUsersData([]);
        }
        setShowLoader(false);
    }

    //API CALL
    async function fetchAllUsers() {
        setShowLoader(true);
        const response = await getAllUsers();
        if (response.data) {
            var userList = response.data;
            response.data.map(
                (data, key) =>
                    (userList[key].middle_name = data.middle_name || " ")
            );
            response.data.map(
                (data, key) =>
                    (userList[key].type = data.type === "supervisor"? "Operation Officer" : data.type)
            );
            response.data.map(
                (data, key) =>
                    (userList[key].full_name =
                        data.first_name +
                        " " +
                        data.middle_name +
                        " " +
                        data.last_name)
            );

            var branchData = userList.filter(
                (user) => user.type === "branch"
            );
            var otherData = userList.filter(
                (user) => user.type !== "branch"
            );

            setBranchUsers(branchData)
            setOfficeUsers(otherData)
            setUsersData(userList);
        } else {
            setUsersData([]);
        }
        setShowLoader(false);
    }

    console.log(usersData)

    async function fetchUser(id) {
        setUserData([])
        const response = await getSingleUser(id);
        if (response.data) {
            var user = response.data[0];
            user.password = "";
            if (user.middle_name !== null) {
                user["full_name"] =
                    response.data[0].first_name +
                    " " +
                    response.data[0].middle_name +
                    " " +
                    response.data[0].last_name;
                setUserData(user);
            } else {
                user["full_name"] =
                    response.data[0].first_name +
                    " " +
                    response.data[0].last_name;
                setUserData(user);
            }
            if(user.employee_id !== null) {
                setEmployeeValue({ name: "first_name", label: user.employee_name, value: user.employee_id });
            }

        } else {
            setUserData({});
        }
    }

    async function handleSaveUser() {
        if (isClicked) {
            return;
        }
        console.log(userDetails.addTo)
        if(shop === "mango_magic") {
            if (validateUsers(userDetails, setIsError)) {
                setIsClicked(true);
                if (userDetails.password === userDetails.confirm_password) {
                    // SEPARATE MANGO AND POTATO API
                    const response = await createUser(userDetails, "");
                    console.log(response)
                    if (response.data) {
                        toast.success("Successfully created user!", {
                            style: toastStyle(),
                        });
                        handleCloseAddUserModal();
                        refreshPage();
                    } else if (response.error) {
                        toast.error(response.error.data.messages.error, {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            refreshPage();
                        }, 1000);
                    }
                } else {
                    toast.error("Password does not match!", {
                        style: toastStyle(),
                    });
                    setIsClicked(false)
                }
            } else {
                toast.error("Please fill in all fields!", { style: toastStyle() });
            }
        } else if (shop === "potato_corner") {
            if (validateUsers(userDetails, setIsError)) {
                setIsClicked(true);
                if (userDetails.password === userDetails.confirm_password) {
                    const response2 = await createUserPotato(userDetails, "", "");
                        console.log(response2)
                        if (response2.data) {
                            toast.success("Successfully created user!", {
                                style: toastStyle(),
                            });
                            handleCloseAddUserModal();
                            refreshPage();
                        } else if (response2.error) {
                            toast.error(response2.error.data.messages.error, {
                                style: toastStyle(),
                            });
                            setTimeout(() => {
                                refreshPage();
                            }, 1000);
                        }
                } else {
                    toast.error("Password does not match!", {
                        style: toastStyle(),
                    });
                    setIsClicked(false)
                }
            } else {
                toast.error("Please fill in all fields!", { style: toastStyle() });
            }
        } else if (shop === "") {
            if (validateUsers(userDetails, setIsError)) {
                setIsClicked(true);
                if (userDetails.password === userDetails.confirm_password) {
                    // SEPARATE MANGO AND POTATO API
                    const response = await createUser(userDetails, "");
                    console.log(response)
                    if (response.data) {
                        const response2 = await createUserPotato(userDetails, "", response.data.user_pin);
                        console.log(response)
                        if (response2.data) {
                            toast.success("Successfully created user!", {
                                style: toastStyle(),
                            });
                            handleCloseAddUserModal();
                            refreshPage();
                        }
                    } else if (response.error) {
                        toast.error(response.error.data.messages.error, {
                            style: toastStyle(),
                        });
                        setTimeout(() => {
                            refreshPage();
                        }, 1000);
                    }
                    // const response = await createUser(userDetails, "");
                    // if (response.data?.mango && response.data?.potato) {
                    //     toast.success("Successfully created user!", {
                    //         style: toastStyle(),
                    //     });
                    //     handleCloseAddUserModal();
                    //     refreshPage();
                } else {
                    toast.error("Password does not match!", {
                        style: toastStyle(),
                    });
                    setIsClicked(false)
                }
            } else {
                toast.error("Please fill in all fields!", { style: toastStyle() });
            }
        }
    }

    async function handleEditUser() {
        if (validateUsers(userData, setIsError)) {
            setIsClicked(true);
            const response = await editUser(userData, "1,2,3");
            const response2 = await editUserPotato(userData, "1,2,3");

            if (response.data && response2.data) {
                toast.success("Successfully updated user!", {
                    style: toastStyle(),
                });
                handleCloseEditUserModal();
                // refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
                // refreshPage();
            }
        } else {
            toast.error("An error has occured!", { style: toastStyle() });
        }
    }

    async function removeUser(id) {
        console.log(id)
        const response = await deleteUser(id);
        if (response.data) {
            const response2 = await deleteUserPotato(id);
            if (response.data) {
                toast.success("Successfully deleted user!", {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
                refreshPage();
            }
        } else {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
            refreshPage();
        }

    }

    React.useEffect(() => {
        fetchAllUsers();
        // fetchBranches();
        fetchAllEmployees();
    }, []);

    React.useEffect(() => {
        fetchSearchUser();
    }, [searchUsername]);

    return (
        <div>
            <Toaster position="top-right" reverseOrder={false} />
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
                        <h1 className="page-title"> USERS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            class="search-bar"
                            defaultValue=""
                            placeholder="Search name..."
                            onKeyPress={(e) =>
                                e.key === ("Enter" || "NumpadEnter") &&
                                handleOnSearch(e)
                            }
                        ></input>
                        <DropdownButton
                            as={ButtonGroup}
                            title="Add"
                            id="bg-nested-dropdown"
                            className="add-btn"
                            onSelect={handleAddSelect}
                        >
                            <Dropdown.Item
                                eventKey="office"
                                onClick={handleShowAddUserModal}
                            >
                                Office
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="branch"
                                onClick={handleShowAddUserModal}
                            >
                                Branch
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>

                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={"office"}
                    id="PO-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="office" title="Office">
                        <div className="tab-content">
                            {/* TABLE */}
                            <Table
                                tableHeaders={[
                                    "FULL NAME",
                                    "USERNAME",
                                    "ROLE",
                                    "ACTIONS",
                                ]}
                                headerSelector={["full_name", "username", "type"]}
                                tableData={officeUsers}
                                ActionBtn={(row) => ActionBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="branch" title="Branch">
                        <div className="tab-content">
                            {/* TABLE */}
                            <Table
                                tableHeaders={[
                                    "FULL NAME",
                                    "USERNAME",
                                    "ROLE",
                                    "ACTIONS",
                                ]}
                                headerSelector={["full_name", "username", "type"]}
                                tableData={branchUsers}
                                ActionBtn={(row) => ActionBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                    </Tab>
                </Tabs>

            </div>

            {/* MODALS */}
            <DeleteModal
                text="user"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={handleDeleteUser}
            />
            <AddModal
                title="USER"
                type="user"
                show={showAddUserModal}
                onHide={handleCloseAddUserModal}
                onSave={handleSaveUser}
                isClicked={isClicked}
            >
                <div className="mt-3 ">
                        {
                            addTo === "branch" && (
                            <>
                                <Row className="nc-modal-custom-row mt-0 mb-3">
                                    <Col xs={6}>
                                        SHOP
                                        <span className="required"> * </span>
                                        <select
                                            name="addTo"
                                            className="nc-modal-custom-select"
                                            defaultValue="Select"
                                            onChange={(e) => handleAddChange(e)}
                                            required
                                        >
                                            <option defaulValue selected hidden>
                                                Select
                                            </option>
                                            <option value="mango_magic">
                                                Mango Magic
                                            </option>
                                            <option value="potato_corner">
                                                Potato Corner
                                            </option>
                                        </select>
                                    </Col>
                                </Row>
                            </>
                            )
                        }
                        <Row className="nc-modal-custom-row mt-0">
                            {
                                addTo === "office" && (
                                <Col>
                                    SELECT EMPLOYEE
                                    <span className="required"> * </span>
                                    <Select
                                        name="first_name"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select Dispatcher..."
                                        value={employeeValue}
                                        options={employeeOptions}
                                        onChange={(e) => handleAddNameChange(e)}
                                    />
                                </Col>
                                )
                            }
                            {
                                addTo === "branch" && (
                                <>
                                    <Col>
                                        Select Branch
                                        <span className="required"> * </span>
                                        <Select
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            placeholder="Select franchisee..."
                                            value={branchValue}
                                            options={branchOptions}
                                            onChange={(e) => handleAddNameChange(e)}
                                        />
                                    </Col>
                                    <Col>
                                        BRANCH NAME
                                        <span className="required"> * </span>
                                        <Form.Control
                                            type="text"
                                            name="first_name"
                                            className="nc-modal-custom-input"
                                            value={userData.first_name}
                                            onChange={(e) => handleAddChange(e)}
                                            required
                                        />
                                    </Col>
                                </>
                                )
                            }
                            {
                                addTo === "office" && (
                                <>
                                    <Col>
                                        FIRST NAME
                                        <span className="required"> * </span>
                                        <Form.Control
                                            type="text"
                                            name="first_name"
                                            className="nc-modal-custom-input"
                                            value={userData.first_name}
                                            onChange={(e) => handleAddChange(e)}
                                            required
                                        />
                                        <InputError
                                            isValid={isError.first_name}
                                            message={"First name is required"}
                                        />
                                    </Col>
                                    <Col>
                                        LAST NAME
                                        <span className="required"> * </span>
                                        <Form.Control
                                            type="text"
                                            name="last_name"
                                            value={userData.last_name}
                                            className="nc-modal-custom-input"
                                            onChange={(e) => handleAddChange(e)}
                                            required
                                        />
                                        <InputError
                                            isValid={isError.last_name}
                                            message={"Last name is required"}
                                        />
                                    </Col>
                                    <Col>
                                        MIDDLE NAME
                                        <Form.Control
                                            type="text"
                                            name="middle_name"
                                            value={userData.middle_name}
                                            className="nc-modal-custom-input"
                                            onChange={(e) => handleAddChange(e)}
                                            required
                                        />
                                    </Col>
                                    <Col xl={2}>
                                        SUFFIX
                                        <Form.Control
                                            type="text"
                                            name="suffix"
                                            className="nc-modal-custom-input"
                                            onChange={(e) => handleAddChange(e)}
                                            required
                                        />
                                    </Col>
                                </>
                            )
                        }
                        
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            USERNAME
                            <span className="required"> * </span>
                            <Form.Control
                                type="text"
                                name="username"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.username}
                                message={"Username is required"}
                            />
                        </Col>
                        {
                            addTo === "office" && (
                                <Col>
                                    TYPE
                                    <span className="required"> * </span>
                                    <select
                                        name="type"
                                        className="nc-modal-custom-select"
                                        defaultValue="Select"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        <option defaulValue selected hidden>
                                            Select
                                        </option>
                                        <option value="commissary_officer">
                                            Commissary Officer
                                        </option>
                                        <option value="inventory_officer">
                                            Inventory Officer
                                        </option>
                                        <option value="purchasing_officer">
                                            Purchasing Officer
                                        </option>
                                        <option value="purchasing_staff">
                                            Purchasing Staff
                                        </option>
                                        <option value="franchise_officer">
                                            Franchise Officer
                                        </option>
                                        <option value="hr_officer">HR Officer</option>
                                        <option value="accounts_officer">
                                            Accounts Officer
                                        </option>
                                        <option value="office_staff">
                                            Office Staff
                                        </option>
                                        <option value="supervisor">Operation Officer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <InputError
                                        isValid={isError.type}
                                        message={"User Type is required"}
                                    />
                                </Col>
                            )

                        }
                        {
                            addTo === "branch" && (
                                <Col>
                                    TYPE
                                    <span className="required"> * </span>
                                    <Form.Control
                                    type="text"
                                    name="type"
                                    className="nc-modal-custom-input"
                                    value={userData.type}
                                    onChange={(e) => handleAddChange(e)}
                                    required
                                />
                            </Col>

                            )

                        }
                        
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            EMAIL
                            <Form.Control
                                type="email"
                                name="email"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            PASSWORD
                            <span className="required"> * </span>
                            <Form.Control
                                type="password"
                                name="password"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.confirm_password}
                                message={"Password is required"}
                            />
                        </Col>
                        <Col>
                            CONFIRM PASSWORD
                            <Form.Control
                                type="password"
                                name="confirm_password"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.confirm_password}
                                message={"Confirm Password is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            <span className="required"> * </span>
                            <span className="required"> required fields </span>
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title="USER"
                type="user"
                show={showEditUserModal}
                onHide={handleCloseEditUserModal}
                onSave={handleEditUser}
            >
                <div className="mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        {
                            filterConfig.tab === "office" && (
                            <Col>
                                SELECT EMPLOYEE
                                <span className="required"> * </span>
                                <Select
                                    name="first_name"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Dispatcher..."
                                    value={employeeValue}
                                    options={employeeOptions}
                                    onChange={(e) => handleAddNameChange(e)}
                                />
                            </Col>
                            )
                        }
                        <Col >
                            FIRST NAME
                            <Form.Control
                                type="text"
                                name="first_name"
                                defaultValue={userData.first_name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.first_name}
                                message={"First name is required"}
                            />
                        </Col>
                        <Col>
                            LAST NAME
                            <Form.Control
                                type="text"
                                name="last_name"
                                defaultValue={userData.last_name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.last_name}
                                message={"Last name is required"}
                            />
                        </Col>
                        <Col>
                            MIDDLE NAME
                            <Form.Control
                                type="text"
                                name="middle_name"
                                defaultValue={userData.middle_name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                        <Col xl={2}>
                            SUFFIX
                            <Form.Control
                                type="text"
                                name="suffix"
                                defaultValue={userData.suffix}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            USERNAME
                            <span className="required"> * </span>
                            <Form.Control
                                type="text"
                                name="username"
                                defaultValue={userData.username}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.username}
                                message={"Username is required"}
                            />
                        </Col>
                        <Col>
                            TYPE
                            <select
                                name="type"
                                className="nc-modal-custom-select"
                                defaultValue={userData.type}
                                onChange={(e) => handleEditChange(e)}
                            >
                                <option defaulValue hidden>
                                    Select
                                </option>
                                <option value="commissary_officer">
                                    Commissary Officer
                                </option>
                                <option value="inventory_officer">
                                    Inventory Officer
                                </option>
                                <option value="purchasing_officer">
                                    Purchasing Officer
                                </option>
                                <option value="purchasing_staff">
                                    Purchasing Staff
                                </option>
                                <option value="franchise_officer">
                                    Franchise Officer
                                </option>
                                <option value="hr_officer">HR Officer</option>
                                <option value="office_staff">
                                    Office Staff
                                </option>
                                <option value="accounts_officer">
                                    Acconts Officer
                                </option>
                                <option value="supervisor">Operation Officer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <InputError
                                isValid={isError.type}
                                message={"User Type is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            EMAIL
                            <Form.Control
                                type="email"
                                name="email"
                                defaultValue={userData.email}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            RESET PASSWORD
                            <Form.Control
                                type="text"
                                name="password"
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                withButtons
                show={showViewUserModal}
                onHide={handleCloseViewUserModal}
                onEdit={handleOnEdit}
            >
                <div>
                    <div className="col-sm-12 space">
                        <span className="custom-modal-body-title-user-details">
                            USER DETAILS
                        </span>
                        <div className="mt-3 container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col lg={4} className="nc-modal-custom-row-details">
                                    FULL NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {userData.full_name} </Col>
                                    </Row>
                                </Col>
                                <Col lg={3} className="nc-modal-custom-row-details">
                                    USERNAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {userData.username} </Col>
                                    </Row>
                                </Col>
                                <Col className="nc-modal-custom-row-details">
                                    EMAIL
                                    <Row className="nc-modal-custom-row">
                                        <Col>
                                            {" "}
                                            {userData.length !== 0
                                                ? userData.email
                                                : null}{" "}
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={2} className="nc-modal-custom-row-details">
                                    ROLE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {userData.type} </Col>
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
