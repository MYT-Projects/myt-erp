import React, { useState } from "react";
import { Col, Container, Form, Row, Tab, Table, Tabs } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { isAdmin, toastStyle, getTodayDateISO } from "../../Helpers/Utils/Common";

//components
import TableTemplate from "../../Components/TableTemplate/DataTable";
import Navbar from "../../Components/Navbar/Navbar";
import DeleteModal from "../../Components/Modals/DeleteModal";
import AddModal from "../../Components/Modals/AddModal";
import EditModal from "../../Components/Modals/EditModal";
import ViewModal from "../../Components/Modals/ViewModal";
import InputError from "../../Components/InputError/InputError";

//css
import "./Manage.css";
import "../../Components/Navbar/Navbar.css";

//api
import {
    getAllEmployees,
    createEmployee,
    getEmployee,
    deleteEmployee,
    searchEmployee,
    updateEmployee,
} from "../../Helpers/apiCalls/employeesApi";
import { refreshPage } from "../../Helpers/Utils/Common";
import { validateEmployees } from "../../Helpers/Validation/Manage/EmployeesValidation";
import { validateEmployeesEdit } from "../../Helpers/Validation/Manage/EmployeesValidationEdit";
import NoDataImg from "../../Assets/Images/no-data-img.png"

export default function Employees() {
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [isClicked, setIsClicked] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const today = getTodayDateISO();
    const [file, setFile] = useState([]);
    console.log(file)
    console.log(file.name)
    //FILTER
    const [filterType, setFilterType] = useState("");
    const [filteredEmployeeData, setFilteredEmployeeData] = useState([]);

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // // VIEW
    const [showViewEmployeeModal, setShowViewEmployeeModal] = useState(false);
    const handleShowViewEmployeeModal = () => setShowViewEmployeeModal(true);
    const handleCloseViewEmployeeModal = () => setShowViewEmployeeModal(false);

    // EDIT
    const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
    const handleShowEditEmployeeModal = () => setShowEditEmployeeModal(true);
    const handleCloseEditEmployeeModal = () => setShowEditEmployeeModal(false);

    // ADD
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const handleShowAddEmployeeModal = () => setShowAddEmployeeModal(true);
    const handleCloseAddEmployeeModal = () => setShowAddEmployeeModal(false);

    //API
    const [employeesData, setEmployeesData] = useState([]);
    const [hasNewlyAddedEmployee, setHasNewlyAddedEmployee] = useState(false);
    const [crewData, setCrewData] = useState([]);
    const [staffData, setStaffData] = useState([]);
    const [employeeData, setEmployeeData] = useState({});
    const [selectedID, setSelectedID] = useState("");
    const [employeeDataUpdate, setEmployeeDataUpdate] = useState({
        username: "",
        password: "",
        last_name: "",
        first_name: "",
        middle_name: "",
        suffix:"",
        email:"",
        type:"",
        contact_no:"",
        address: "",
        gender: "",
        birthdate: "",
        civil_status:"",
        nationality:"",
        religion:"",
        remarks:"",
        sss:"",
        hdmf:"",
        philhealth:"",
        employment_status:"",
        salary_type:"",
        salary:"",
        daily_allowance:"",
        communication_allowance: "",
        transportation_allowance: "",
        food_allowance: "",
        hmo_allowance: "",
        tech_allowance:"",
        ops_allowance:"",
        special_allowance: "",
        profile_picture: "",
    });
    const [employeeDetails, setEmployeeDetails] = useState({
        username: "",
        password: "",
        last_name: "",
        first_name: "",
        middle_name: "",
        suffix:"",
        email:"",
        type:"",
        contact_no:"",
        address: "",
        gender: "",
        birthdate: "",
        civil_status:"",
        nationality:"",
        religion:"",
        remarks:"",
        sss:"",
        hdmf:"",
        philhealth:"",
        employment_status:"",
        salary_type:"",
        salary:"",
        daily_allowance:"",
        communication_allowance: "",
        transportation_allowance: "",
        food_allowance: "",
        hmo_allowance: "",
        tech_allowance:"",
        ops_allowance:"",
        special_allowance: "",
        profile_picture: "",
    });

    //REQUIRED ERROR HANDLING
    const [isError, setIsError] = useState({
        first_name: false,
        middle_name: false,
        last_name: false,
        email: false,
        username: false,
        password: false,
        confirm_password: false,
        type: false,
        contact_no: false,
        address: false,
        gender: false,
        birthdate: false,
        civil_status: false,
        nationality: false,
        religion: false,
        profile_picture: false,
        employment_status: false,
        salary_type: false,
        salary: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        first_name: false,
        middle_name: false,
        last_name: false,
        email: false,
        username: false,
        // password: false,
        type: false,
        contact_no: false,
        address: false,
        gender: false,
        birthdate: false,
        civil_status: false,
        nationality: false,
        religion: false,
        profile_picture: false,
        employment_status: false,
        salary_type: false,
        salary: false,
    });

    const handleAddChange = (e) => {
        const { name, value } = e.target;
        setEmployeeDetails((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleEdit = (e) => {
        const newList = employeeDataUpdate;
        newList[e.target.name] = e.target.value;
        setEmployeeDataUpdate(newList);
    };

    //onEdit
    function handleOnEdit() {
        handleCloseViewEmployeeModal();
        handleShowEditEmployeeModal();
    }

    //EDIT OR UPDATE EMPLOYEE
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEmployeeDataUpdate((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    //DELETE or REMOVE EMPLOYEE
    function handleDeleteEmployee() {
        removeEmployee(selectedID);
    }

    //DROPDOWN
    function handleSelectChange(e, row) {
        // fetchEmployee(row.id);
        setSelectedID(row.id);
        console.log(row)
        setEmployeeData(row);
        setEmployeeDataUpdate(row);
        if (e.target.value === "delete-employee") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-employee") {
            handleShowEditEmployeeModal();
        } else if (e.target.value === "view-employee") {
            handleShowViewEmployeeModal();
        } else {
            refreshPage();
        }
    }

    const [searchUsername, setSearchUsername] = useState("");

    // SEARCH USER
    function handleOnSearch(e) {
        setSearchUsername(e.target.value);
    }

    //API CALL
    async function fetchSearchUser() {
        setShowLoader(true);
        const response = await searchEmployee(searchUsername);
        if (response.data) {
            var employeesList = response.data.data.sort((a, b) =>
                a.first_name.toUpperCase() > b.first_name.toUpperCase()
                    ? 1
                    : b.first_name.toUpperCase() > a.first_name.toUpperCase()
                    ? -1
                    : 0
            );
            employeesList.map((data, key) => {
                if (data.middle_name !== null) {
                    employeesList[key].full_name =
                        data.first_name +
                        " " +
                        data.middle_name +
                        " " +
                        data.last_name;
                    setEmployeeData(employeesList);
                } else {
                    employeesList[key].full_name =
                        data.first_name + " " + data.last_name;
                    setEmployeeData(employeesList);
                }
            });
            setEmployeesData(employeesList);
            setFilteredEmployeeData(employeesList);
        } else {
            setEmployeesData([]);
        }
        setShowLoader(false);
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
                <option value="view-employee" className="color-options">
                    View
                </option>
                {isAdmin && (
                    <option value="edit-employee" className="color-options">
                        Edit
                    </option>
                )}
                {isAdmin && (
                    <option value="delete-employee" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //API CALL
    async function fetchAllEmployees() {
        setShowLoader(true);
        const response = await getAllEmployees();
        if (response.data.data) {
            var employeesList = response.data.data.sort((a, b) =>
                a.first_name.toUpperCase() > b.first_name.toUpperCase()
                    ? 1
                    : b.first_name.toUpperCase() > a.first_name.toUpperCase()
                    ? -1
                    : 0
            );
            employeesList.map((data, key) => {
                if (data.middle_name !== null) {
                    employeesList[key].full_name =
                        data.first_name +
                        " " +
                        data.middle_name +
                        " " +
                        data.last_name;
                    setEmployeeData(employeesList);
                } else {
                    employeesList[key].full_name =
                        data.first_name + " " + data.last_name;
                    setEmployeeData(employeesList);
                }
            });
            setEmployeesData(employeesList);
            setCrewData(employeesList.filter((info) => info.type === "crew"));
            setStaffData(
                employeesList.filter((info) => info.type === "office")
            );
            setFilteredEmployeeData(employeesList);
        } else {
            setEmployeesData([]);
        }
        setShowLoader(false);
    }

    async function fetchEmployee(id) {
        setEmployeeDataUpdate({});
        const response = await getEmployee(id);
        if (response.data.data) {
            var employee = response.data.data[0];
            if (employee.middle_name !== null) {
                employee["full_name"] =
                    employee.first_name +
                    " " +
                    employee.middle_name +
                    " " +
                    employee.last_name;
                setEmployeeData(employee);
                setEmployeeDataUpdate(employee);
            } else {
                employee["full_name"] =
                    employee.first_name + " " + employee.last_name;
                setEmployeeData(employee);
                setEmployeeDataUpdate(employee);
            }
        } else {
            setEmployeeData({});
        }
    }

    async function handleSaveEmployee() {
        if (isClicked) {
            return;
        }
        if (validateEmployees(employeeDetails, setIsError)) {
            if (employeeDetails.password === employeeDetails.confirm_password) {
                setIsClicked(true);
                const response = await createEmployee(employeeDetails, file);
                if (response.data) {
                    toast.success("Successfully created employee!", {
                        style: toastStyle(),
                    });
                    handleCloseAddEmployeeModal();
                    setHasNewlyAddedEmployee(!hasNewlyAddedEmployee);
                    setIsClicked(false);
                } else {
                    toast.error(response.error.data.messages.error, {
                        style: toastStyle(),
                    });
                    setIsClicked(false);
                    setTimeout(() => {
                        refreshPage();
                    }, 1000);
                }
            } else {
                toast.error("Password does not match!", {
                    style: toastStyle(),
                });
            }
        } else {
            toast.error("An error has occured!", { style: toastStyle() });
        }
    }

    async function handleEditEmployee() {
        if (validateEmployeesEdit(employeeDataUpdate, setIsErrorEdit)) {
            setIsClicked(true);
            const response = await updateEmployee(employeeDataUpdate, file);
            if (response.data) {
                toast.success("Successfully edited employee details!", {
                    style: toastStyle(),
                });
                handleCloseEditEmployeeModal();
                refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
                handleCloseEditEmployeeModal();
            }
        } else {
            toast.error("An error has occured!", { style: toastStyle() });
        }
    }

    async function removeEmployee(id) {
        const response = await deleteEmployee(id);
        if (response.data) {
            toast.success("Successfully deleted employee!", {
                style: toastStyle(),
            });
            handleCloseDeleteModal();
            refreshPage();
        } else {
            toast.error(response.error.data.messages.error, {
                style: toastStyle(),
            });
        }
    }

    React.useEffect(() => {
        fetchAllEmployees();
    }, [hasNewlyAddedEmployee]);

    React.useEffect(() => {
        fetchSearchUser();
    }, [searchUsername]);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"EMPLOYEES"}
                />
            </div>
            <div
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                <Row className="mb-5">
                    <Col xs={6}>
                        <h1 className="page-title"> EMPLOYEES </h1>
                    </Col>
                    <Col>
                        <Col className="d-flex justify-content-end">
                            <input
                                type="text"
                                className="search-bar"
                                defaultValue=""
                                onChange={handleOnSearch}
                                placeholder="Search name..."
                                // onKeyPress={(e) =>
                                //     e.key === ("Enter" || "NumpadEnter") &&
                                //     handleOnSearch(e)
                                // }
                            ></input>
                            <button
                                className="add-btn"
                                onClick={handleShowAddEmployeeModal}
                            >
                                Add
                            </button>
                        </Col>
                    </Col>
                </Row>
                <Tabs
                    defaultActiveKey="all"
                    id="suppliers-tabs"
                    className="manager-tabs"
                >
                    <Tab eventKey="all" title="All">
                        <div className="tab-content">
                            {/* TABLE */}
                            <TableTemplate
                                tableHeaders={[
                                    "FULL NAME",
                                    "USERNAME",
                                    "ACTIONS",
                                ]}
                                headerSelector={["full_name", "username"]}
                                tableData={filteredEmployeeData}
                                ActionBtn={(row) => ActionBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="crew" title="Branch Crew">
                        <div className="tab-content">
                            {/* TABLE */}
                            <TableTemplate
                                tableHeaders={[
                                    "FULL NAME",
                                    "USERNAME",
                                    "ACTIONS",
                                ]}
                                headerSelector={["full_name", "username"]}
                                tableData={crewData}
                                ActionBtn={(row) => ActionBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="staff" title="Office Staff">
                        <div className="tab-content">
                            {/* TABLE */}
                            <TableTemplate
                                tableHeaders={[
                                    "FULL NAME",
                                    "USERNAME",
                                    "ACTIONS",
                                ]}
                                headerSelector={["full_name", "username"]}
                                tableData={staffData}
                                ActionBtn={(row) => ActionBtn(row)}
                                showLoader={showLoader}
                            />
                        </div>
                    </Tab>
                </Tabs>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="employee"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={handleDeleteEmployee}
            />
            <AddModal
                title="EMPLOYEE"
                type="employee"
                show={showAddEmployeeModal}
                onHide={handleCloseAddEmployeeModal}
                onSave={handleSaveEmployee}
                isClicked={isClicked}
            >
                <div className="mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <span className="custom-modal-body-title-employee mb-2">
                            PERSONAL INFORMATION
                        </span>
                        <Col xs={4}>
                            FIRST NAME
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="first_name"
                                className="nc-modal-custom-input"
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
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="last_name"
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
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                        <Col xs={2}>
                            SUFFIX
                            <Form.Control
                                type="text"
                                name="suffix"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            TYPE
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="type"
                                defaultValue={employeeData.type}
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="crew">Branch Crew</option>
                                <option value="office">
                                    Office Staff
                                </option>
                            </select>
                            <InputError
                                isValid={isError.type}
                                message={"type is required"}
                            />
                        </Col>
                        <Col>
                            USERNAME
                            <label className="badge-required">{` *`}</label>
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
                        <Col>
                            PASSWORD
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="password"
                                name="password"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.password}
                                message={"Password is required"}
                            />
                        </Col>
                        <Col>
                            CONFIRM PASSWORD
                            <label className="badge-required">{` *`}</label>
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
                            CONTACT NUMBER
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="number"
                                name="contact_no"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.contact_no}
                                message={"Contact number is required"}
                            />
                        </Col>
                        <Col>
                            ADDRESS
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="address"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.address}
                                message={"Address is required"}
                            />
                        </Col>
                        <Col>
                            EMAIL
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="email"
                                name="email"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.email}
                                message={"Email is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            GENDER
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="gender"
                                defaultValue={employeeData.gender}
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            <InputError
                                isValid={isError.gender}
                                message={"Gender is required"}
                            />
                        </Col>
                        <Col>
                            BIRTHDATE
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="date"
                                name="birthdate"
                                className="nc-modal-custom-text"
                                defaultValue={today}
                                onChange={(e) => handleAddChange(e)}
                            />
                            <InputError
                                isValid={isError.birthdate}
                                message={"Birthdate is required"}
                            />
                        </Col>
                        <Col>
                            CIVIL STATUS
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="civil_status"
                                defaultValue={employeeData.civil_status}
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="widowed">Widowed</option>
                            </select>
                            <InputError
                                isValid={isError.civil_status}
                                message={"Civil status is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            NATIONALITY
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="nationality"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.nationality}
                                message={"Nationality is required"}
                            />
                        </Col>
                        <Col>
                            RELIGION
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="religion"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.religion}
                                message={"religion is required"}
                            />
                        </Col>
                        <Col>
                            REMARKS
                            <Form.Control
                                type="text"
                                name="remarks"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            PROFILE PICTURE
                            <input 
                                class="form-control date-filter gotham" 
                                type="file" accept="image/png, image/gif, image/jpeg" 
                                id="formFileSm" 
                                onChange={(e)=>setFile(e.target.files[0])}/>
                        </Col>
                    </Row>
                    <hr/>
                    <Row className="nc-modal-custom-row mt-0">
                        <span className="custom-modal-body-title-employee mb-2">
                            BENIFIT CONTRIBUTION INFORMATION
                        </span>
                        <Col>
                            SSS NO.
                            <Form.Control
                                type="number"
                                name="sss"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            HDMF NO.
                            <Form.Control
                                type="number"
                                name="hdmf"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            PHILHEALTH NO.
                            <Form.Control
                                type="number"
                                name="philhealth"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <hr/>
                    <Row className="nc-modal-custom-row mt-0">
                        <span className="custom-modal-body-title-employee mb-2">
                            EMPLOYMENT INFORMATION
                        </span>
                        <Col>
                            EMPLOYMENT STATUS
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="employment_status"
                                defaultValue={employeeData.employment_status}
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="full-time">Full-Time</option>
                                <option value="part-time">Part-Time</option>
                                <option value="intern">Intern</option>
                                <option value="high school scholar">High School Scholar</option>
                                <option value="college scholar">College Scholar</option>
                            </select>
                            <InputError
                                isValid={isError.employment_status}
                                message={"Employment status is required"}
                            />
                        </Col>
                        <Col>
                            SALARY TYPE
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="salary_type"
                                defaultValue={employeeData.salary_type}
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                            </select>
                            <InputError
                                isValid={isError.salary_type}
                                message={"Salary type is required"}
                            />
                        </Col>
                        <Col>
                            SALARY
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="number"
                                name="salary"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.salary}
                                message={"Salary is required"}
                            />
                        </Col>
                    </Row>
                    <hr/>
                    <Row className="nc-modal-custom-row mt-0">
                        <span className="custom-modal-body-title-employee mb-2">
                            ALLOWANCE
                        </span>
                        <Col>
                            DAILY ALLOWANCE
                            <Form.Control
                                type="number"
                                name="daily_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col>
                            COMMUNICATION ALLOWANCE
                            <Form.Control
                                type="number"
                                name="communication_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col>
                            TRANSPORTATION ALLOWANCE
                            <Form.Control
                                type="number"
                                name="transportation_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            FOOD ALLOWANCE
                            <Form.Control
                                type="number"
                                name="food_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col>
                            HMO ALLOWANCE
                            <Form.Control
                                type="number"
                                name="hmo_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col>
                            TECH ALLOWANCE
                            <Form.Control
                                type="number"
                                name="tech_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            OPS ALLOWANCE
                            <Form.Control
                                type="number"
                                name="ops_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                        <Col>
                            SPECIAL ALLOWANCE
                            <Form.Control
                                type="number"
                                name="special_allowance"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title="EMPLOYEE"
                type="employee"
                show={showEditEmployeeModal}
                onHide={handleCloseEditEmployeeModal}
                onSave={handleEditEmployee}
            >
                <div className="mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            FIRST NAME
                            <Form.Control
                                type="text"
                                name="first_name"
                                defaultValue={employeeDataUpdate.first_name}
                                className="nc-modal-custom-input-edit"
                                required
                                onChange={(e) => handleEdit(e)}
                            />
                            <InputError
                                isValid={isErrorEdit.first_name}
                                message={"First name is required"}
                            />
                        </Col>
                        <Col>
                            LAST NAME
                            <Form.Control
                                type="text"
                                name="last_name"
                                defaultValue={employeeDataUpdate.last_name}
                                className="nc-modal-custom-input-edit"
                                required
                                onChange={(e) => handleEdit(e)}
                            />
                            <InputError
                                isValid={isErrorEdit.last_name}
                                message={"Last name is required"}
                            />
                        </Col>
                        <Col>
                            MIDDLE NAME
                            <Form.Control
                                type="text"
                                name="middle_name"
                                defaultValue={employeeDataUpdate.middle_name}
                                className="nc-modal-custom-input-edit"
                                required
                                onChange={(e) => handleEdit(e)}
                            />
                            <InputError
                                isValid={isErrorEdit.middle_name}
                                message={"Middle name is required"}
                            />
                        </Col>
                        <Col xs={2}>
                            SUFFIX
                            <Form.Control
                                type="text"
                                name="suffix"
                                defaultValue={employeeDataUpdate.suffix}
                                className="nc-modal-custom-input-edit"
                                required
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            USERNAME
                            <Form.Control
                                type="text"
                                name="username"
                                defaultValue={employeeDataUpdate.username}
                                className="nc-modal-custom-input-edit"
                                required
                                onChange={(e) => handleEdit(e)}
                            />
                            <InputError
                                isValid={isErrorEdit.username}
                                message={"Username is required"}
                            />
                        </Col>
                        <Col>
                            TYPE
                            <select
                                className="nc-modal-custom-select"
                                name="type"
                                value={employeeDataUpdate.type}
                                onChange={(e) => handleEdit(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="crew">Branch Crew</option>
                                <option value="office">
                                    Office Staff
                                </option>
                            </select>
                            <InputError
                                isValid={isErrorEdit.type}
                                message={"Username is required"}
                            />
                        </Col>
                        <Col>
                            RESET PASSWORD
                            <Form.Control
                                type="text"
                                name="password_reset"
                                defaultValue={employeeDataUpdate.password_reset}
                                className="nc-modal-custom-input-edit"
                                required
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            CONTACT NUMBER
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="number"
                                name="contact_no"
                                defaultValue={employeeDataUpdate.contact_no}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.contact_no}
                                message={"Contact number is required"}
                            />
                        </Col>
                        <Col>
                            ADDRESS
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="address"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.address}
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.address}
                                message={"Address is required"}
                            />
                        </Col>
                        <Col>
                            EMAIL
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="email"
                                name="email"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.email}
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.email}
                                message={"Email is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            GENDER
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="gender"
                                defaultValue={employeeDataUpdate.gender}
                                onChange={(e) => handleEdit(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            <InputError
                                isValid={isErrorEdit.gender}
                                message={"Gender is required"}
                            />
                        </Col>
                        <Col>
                            BIRTHDATE
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="date"
                                name="birthdate"
                                className="nc-modal-custom-text"
                                defaultValue={employeeDataUpdate.birthdate}
                                onChange={(e) => handleEdit(e)}
                            />
                            <InputError
                                isValid={isErrorEdit.birthdate}
                                message={"Birthdate is required"}
                            />
                        </Col>
                        <Col>
                            CIVIL STATUS
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="civil_status"
                                defaultValue={employeeDataUpdate.civil_status}
                                onChange={(e) => handleEdit(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="widowed">Widowed</option>
                            </select>
                            <InputError
                                isValid={isErrorEdit.civil_status}
                                message={"Civil status is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            NATIONALITY
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="nationality"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.nationality}
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.nationality}
                                message={"Nationality is required"}
                            />
                        </Col>
                        <Col>
                            RELIGION
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="religion"
                                defaultValue={employeeDataUpdate.religion}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.religion}
                                message={"religion is required"}
                            />
                        </Col>
                        <Col>
                            REMARKS
                            <Form.Control
                                type="text"
                                name="remarks"
                                defaultValue={employeeDataUpdate.remarks}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            PROFILE PICTURE
                            <input 
                                class="form-control date-filter gotham" 
                                type="file" accept="image/png, image/gif, image/jpeg" 
                                id="formFileSm" 
                                onChange={(e)=>setFile(e.target.files[0])}/>
                        </Col>
                    </Row>
                    <hr/>
                    <Row className="nc-modal-custom-row mt-0">
                        <span className="custom-modal-body-title-employee mb-2">
                            BENIFIT CONTRIBUTION INFORMATION
                        </span>
                        <Col>
                            SSS NO.
                            <Form.Control
                                type="number"
                                name="sss"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.sss}
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                        </Col>
                        <Col>
                            HDMF NO.
                            <Form.Control
                                type="number"
                                name="hdmf"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.hdmf}
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                        </Col>
                        <Col>
                            PHILHEALTH NO.
                            <Form.Control
                                type="number"
                                name="philhealth"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.philhealth}
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <hr/>
                    <Row className="nc-modal-custom-row mt-0">
                        <span className="custom-modal-body-title-employee mb-2">
                            EMPLOYMENT INFORMATION
                        </span>
                        <Col>
                            EMPLOYMENT STATUS
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="employment_status"
                                defaultValue={employeeDataUpdate.employment_status}
                                onChange={(e) => handleEdit(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="full-time">Full-Time</option>
                                <option value="part-time">Part-Time</option>
                                <option value="intern">Intern</option>
                                <option value="high school scholar">High School Scholar</option>
                                <option value="college scholar">College Scholar</option>
                            </select>
                            <InputError
                                isValid={isErrorEdit.employment_status}
                                message={"Employment status is required"}
                            />
                        </Col>
                        <Col>
                            SALARY TYPE
                            <label className="badge-required">{` *`}</label>
                            <select
                                className="nc-modal-custom-select"
                                name="salary_type"
                                defaultValue={employeeDataUpdate.salary_type}
                                onChange={(e) => handleEdit(e)}
                            >
                                <option value={""}>Select</option>
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                            </select>
                            <InputError
                                isValid={isErrorEdit.salary_type}
                                message={"Salary type is required"}
                            />
                        </Col>
                        <Col>
                            SALARY
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="number"
                                name="salary"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.salary}
                                onChange={(e) => handleEdit(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.salary}
                                message={"Salary is required"}
                            />
                        </Col>
                    </Row>
                    <hr/>
                    <Row className="nc-modal-custom-row mt-0">
                        <span className="custom-modal-body-title-employee mb-2">
                            ALLOWANCE
                        </span>
                        <Col>
                            DAILY ALLOWANCE
                            <Form.Control
                                type="number"
                                name="daily_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.daily_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                        <Col>
                            COMMUNICATION ALLOWANCE
                            <Form.Control
                                type="number"
                                name="communication_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.communication_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                        <Col>
                            TRANSPORTATION ALLOWANCE
                            <Form.Control
                                type="number"
                                name="transportation_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.transportation_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            FOOD ALLOWANCE
                            <Form.Control
                                type="number"
                                name="food_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.food_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                        <Col>
                            HMO ALLOWANCE
                            <Form.Control
                                type="number"
                                name="hmo_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.hmo_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                        <Col>
                            TECH ALLOWANCE
                            <Form.Control
                                type="number"
                                name="tech_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.tech_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            OPS ALLOWANCE
                            <Form.Control
                                type="number"
                                name="ops_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.ops_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                        <Col>
                            SPECIAL ALLOWANCE
                            <Form.Control
                                type="number"
                                name="special_allowance"
                                className="nc-modal-custom-input"
                                defaultValue={employeeDataUpdate.special_allowance}
                                onChange={(e) => handleEdit(e)}
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <ViewModal
                withButtons
                show={showViewEmployeeModal}
                onHide={handleCloseViewEmployeeModal}
                onEdit={handleOnEdit}
            >
                <div>
                    <div className="col-sm-12 space">
                        <span className="custom-modal-body-title-user-details">
                            EMPLOYEE DETAILS
                        </span>
                        <div className="mt-3 mb-3 container-wrapper">
                            <Row className="nc-modal-custom-row-view">
                                <Col>
                                    {
                                        employeeData.profile_picture !== "" || employeeData.profile_picture !== null ? (
                                            <>
                                                <div className='row justify-content-center mb-4'>
                                                    <div className='col-sm-12 align-center' style={{textAlignLast:"center"}}><img src={employeeData.profile_picture} width={150} height={150}/></div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="no-data-cont mb-4">
                                                    <div className='mt-5 mb-2' style={{textAlignLast:"center"}} alt="no data found"><img src={NoDataImg} width={150} height={150}/></div>
                                                    <span>Uh Oh! No Image found.</span>
                                                </div>
                                            </>
                                        )
                                    }
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <span className="custom-modal-body-title-employee">
                                    PERSONAL INFORMATION
                                </span>
                                <Col>
                                    FULL NAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.full_name} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    USERNAME
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.username} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    TYPE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.type} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <Col>
                                    CONTACT NUMBER
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.contact_no ? employeeData.contact_no : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    ADDRESS
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.address ? employeeData.address : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    EMAIL
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.email ? employeeData.email : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <Col>
                                    GENDER
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.gender ? employeeData.gender : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    BIRTHDATE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.birthdate ? employeeData.birthdate : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    CIVIL STATUS
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.civil_status ? employeeData.civil_status : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <Col>
                                    NATIONALITY
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.nationality ? employeeData.nationality : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    RELIGION
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.religion ? employeeData.religion : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    REMARKS
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.remarks ? employeeData.remarks : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <hr/>
                            <Row className="nc-modal-custom-row-view">
                                <span className="custom-modal-body-title-employee">
                                    BENIFIT CONTRIBUTION INFORMATION
                                </span>
                                <Col>
                                    SSS NO.
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.sss ? employeeData.sss : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    HDMF NO.
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.hdmf ? employeeData.hdmf : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    PHILHEALTH NO.
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.philhealth ? employeeData.philhealth : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <hr/>
                            <Row className="nc-modal-custom-row-view">
                                <span className="custom-modal-body-title-employee">
                                    EMPLOYMENT INFORMATION
                                </span>
                                <Col>
                                    EMPLOYMENT STATUS
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.employment_status ? employeeData.employment_status : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    SALARY TYPE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.salary_type ? employeeData.salary_type : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    SALARY
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.salary ? employeeData.salary : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <hr/>
                            <Row className="nc-modal-custom-row-view">
                                <span className="custom-modal-body-title-employee">
                                    ALLOWANCE
                                </span>
                                <Col>
                                    DAILY ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.daily_allowance ? employeeData.daily_allowance : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    COMMUNICATION ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.communication_allowance ? employeeData.communication_allowance : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    TRANSPORTATION ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.transportation_allowance ? employeeData.transportation_allowance : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <Col>
                                    FOOD ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.food_allowance ? employeeData.food_allowance : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    HMO ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.hmo_allowance ? employeeData.hmo_allowance : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    TECH ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.tech_allowance ? employeeData.tech_allowance : "N/A"} </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row-view">
                                <Col xs={4}>
                                    OPS ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.ops_allowance ? employeeData.ops_allowance : "N/A"} </Col>
                                    </Row>
                                </Col>
                                <Col xs={4}>
                                    SPECIAL ALLOWANCE
                                    <Row className="nc-modal-custom-row">
                                        <Col> {employeeData.special_allowance ? employeeData.special_allowance : "N/A"} </Col>
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
