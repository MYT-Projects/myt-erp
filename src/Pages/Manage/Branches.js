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

export default function Branches() {
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
        is_franchise: "0,1,2",
    });
    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-branches-filterConfig';
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
        inventory_group_id: false,
        phone_no: false,
        initial_drawer: false,
        price_level: false,
        contact_person: false,
        contact_person_no: false,
        is_franchise: false,
        monthly_rental_fee: false,
        opening_date: false,
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
        opening_date: false,
    });

    const [osStartTime, setOsStartTime] = useState(new Date());
    const [osEndTime, setOsEndTime] = useState(new Date());

    const [deliveryStartTime, setDeliveryStartTime] = useState(new Date());
    const [deliveryEndTime, setDeliveryEndTime] = useState(new Date());

    const [osStartTimeEdit, setOsStartTimeEdit] = useState(new Date());
    const [osEndTimeEdit, setOsEndTimeEdit] = useState(new Date());

    const [deliveryStartTimeEdit, setDeliveryStartTimeEdit] = useState(new Date());
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
        setShowLoader(true);
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
        setShowLoader(false);
    }

    async function fetchInventoryGroup() {
        setShowLoader(true);
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
        setShowLoader(false);
    }

    async function fetchPriceLevel() {
        setShowLoader(true);
        setPriceLevels([]);
        const response = await getAllPriceLevels();

        if (response) {
            setPriceLevels(response.data.data.data);
        }
        setShowLoader(false);
    }

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
                dayStart = _sched[1].split(" ")[0];
            }
            var start = new Date(_sched[1]);
            var dayEnd = _sched[2];
            if (dayEnd === "undefined") {
                dayEnd = _sched[3].split(" ")[0];
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
        console.log(row)
        if (e.target.value === "delete-branch") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-branch") {
            if (row.operation_days !== "") {
                var OsSchedule = row.operation_days.split("-");
                // console.log(OsSchedule.length)
                if(OsSchedule.length === 2) {
                    row.os_startDate = OsSchedule[0];
                    row.os_endDate = OsSchedule[1];

                    var OsTime = row.operation_times.split("-");
                    var start = new Date();
                    start.setHours(OsTime[0].split(":")[0], OsTime[0].split(":")[1]);
                    var end = new Date();
                    end.setHours(OsTime[1].split(":")[0], OsTime[1].split(":")[1]);

                    setOsStartTimeEdit(start);
                    setOsEndTimeEdit(end);

                    var deliverySchedule = row.delivery_days.split("-");
                    row.delivery_startDate = deliverySchedule[0];
                    row.delivery_endDate = deliverySchedule[1];

                    var deliveryTime = row.delivery_times.split("-");
                    var deliverstart = new Date();
                    deliverstart.setHours(deliveryTime[0].split(":")[0], deliveryTime[0].split(":")[1]);
                    var deliverend = new Date();
                    deliverend.setHours(deliveryTime[1].split(":")[0], deliveryTime[1].split(":")[1]);

                    setDeliveryStartTimeEdit(deliverstart);
                    setDeliveryEndTimeEdit(deliverend);

                } else {
                    row.os_startDate = OsSchedule[0] !== "undefined" ? OsSchedule[0] : OsSchedule[1].split(" ")[0];
                    row.os_endDate = OsSchedule[2]  !== "undefined" ? OsSchedule[2] : OsSchedule[3].split(" ")[0];

                    if(OsSchedule[0] === "undefined" || OsSchedule[2] === "undefined"){
                        switch(OsSchedule[1].split(" ")[0]) {
                            case "Mon":
                                row.os_startDate = "monday";
                                break;
                            case "Tue":
                                row.os_startDate = "tuesday";
                                break;
                            case "Wed":
                                row.os_startDate = "wednesday";
                                break;
                            case "Thu":
                                row.os_startDate = "thursday";
                                break;
                            case "Fri":
                                row.os_startDate = "friday";
                                break;
                            case "Sat":
                                row.os_startDate = "saturday";
                                break;
                            case "Sun":
                                row.os_startDate = "sunday";
                                break;
                        }

                        switch(OsSchedule[3].split(" ")[0]) {
                            case "Mon":
                                row.os_endDate = "monday";
                                break;
                            case "Tue":
                                row.os_endDate = "tuesday";
                                break;
                            case "Wed":
                                row.os_endDate = "wednesday";
                                break;
                            case "Thu":
                                row.os_endDate = "thursday";
                                break;
                            case "Fri":
                                row.os_endDate = "friday";
                                break;
                            case "Sat":
                                row.os_endDate = "saturday";
                                break;
                            case "Sun":
                                row.os_endDate = "sunday";
                                break;
                        }
                    }

                    var start = "";
                    start = new Date(OsSchedule[1]);
                    var end = "";
                    end = new Date(OsSchedule[3]);

                    setOsStartTimeEdit(start);
                    setOsEndTimeEdit(end);

                }
                
            }

            if (row.delivery_days !== "") {
                var deliverySchedule = row.delivery_days.split("-");

                if(deliverySchedule.length > 2) {
                    row.delivery_startDate = deliverySchedule[0] !== "undefined" ? deliverySchedule[0] : deliverySchedule[1].split(" ")[0];
                    setDeliveryStartTimeEdit(new Date(deliverySchedule[1]));
                    row.delivery_endDate = deliverySchedule[2] !== "undefined" ? deliverySchedule[2] : deliverySchedule[3].split(" ")[0];
                    setDeliveryEndTimeEdit(new Date(deliverySchedule[3]));

                    if(deliverySchedule[0] === "undefined" || deliverySchedule[2] === "undefined"){
                        switch(deliverySchedule[1].split(" ")[0]) {
                            case "Mon":
                                row.delivery_startDate = "monday";
                                break;
                            case "Tue":
                                row.delivery_startDate = "tuesday";
                                break;
                            case "Wed":
                                row.delivery_startDate = "wednesday";
                                break;
                            case "Thu":
                                row.delivery_startDate = "thursday";
                                break;
                            case "Fri":
                                row.delivery_startDate = "friday";
                                break;
                            case "Sat":
                                row.delivery_startDate = "saturday";
                                break;
                            case "Sun":
                                row.delivery_startDate = "sunday";
                                break;
                        }

                        switch(deliverySchedule[3].split(" ")[0]) {
                            case "Mon":
                                row.delivery_endDate = "monday";
                                break;
                            case "Tue":
                                row.delivery_endDate = "tuesday";
                                break;
                            case "Wed":
                                row.delivery_endDate = "wednesday";
                                break;
                            case "Thu":
                                row.delivery_endDate = "thursday";
                                break;
                            case "Fri":
                                row.delivery_endDate = "friday";
                                break;
                            case "Sat":
                                row.delivery_endDate = "saturday";
                                break;
                            case "Sun":
                                row.delivery_endDate = "sunday";
                                break;
                        }
                    }

                    var start = "";
                    start = new Date(deliverySchedule[1]);
                    console.log(deliverySchedule[1])
                    var end = "";
                    end = new Date(deliverySchedule[3]);

                    setDeliveryStartTimeEdit(start);
                    setDeliveryEndTimeEdit(end);

                }
                
            }

            setEditBranchData(row);
            handleShowEditBranchModal();
        } else if (e.target.value === "view-branch") {
            handleShowViewBranchModal();
        } else {
            handleShowDeleteModal();
        }
    }

    console.log(osStartTimeEdit)
    console.log(osEndTimeEdit)
    console.log(deliveryStartTimeEdit)
    console.log(deliveryEndTimeEdit)

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
        var row = selectedRow;
        if (row.operation_days !== "") {
            var OsSchedule = row.operation_days.split("-");
            // console.log(OsSchedule.length)
            if(OsSchedule.length === 2) {
                row.os_startDate = OsSchedule[0];
                row.os_endDate = OsSchedule[1];

                var OsTime = row.operation_times.split("-");
                var start = new Date();
                start.setHours(OsTime[0].split(":")[0], OsTime[0].split(":")[1]);
                var end = new Date();
                end.setHours(OsTime[1].split(":")[0], OsTime[1].split(":")[1]);

                setOsStartTimeEdit(start);
                setOsEndTimeEdit(end);

                var deliverySchedule = row.delivery_days.split("-");
                row.delivery_startDate = deliverySchedule[0];
                row.delivery_endDate = deliverySchedule[1];

                var deliveryTime = row.delivery_times.split("-");
                var deliverstart = new Date();
                deliverstart.setHours(deliveryTime[0].split(":")[0], deliveryTime[0].split(":")[1]);
                var deliverend = new Date();
                deliverend.setHours(deliveryTime[1].split(":")[0], deliveryTime[1].split(":")[1]);

                setDeliveryStartTimeEdit(deliverstart);
                setDeliveryEndTimeEdit(deliverend);

            } else {
                row.os_startDate = OsSchedule[0] !== "undefined" ? OsSchedule[0] : OsSchedule[1].split(" ")[0];
                row.os_endDate = OsSchedule[2]  !== "undefined" ? OsSchedule[2] : OsSchedule[3].split(" ")[0];

                if(OsSchedule[0] === "undefined" || OsSchedule[2] === "undefined"){
                    switch(OsSchedule[1].split(" ")[0]) {
                        case "Mon":
                            row.os_startDate = "monday";
                            break;
                        case "Tue":
                            row.os_startDate = "tuesday";
                            break;
                        case "Wed":
                            row.os_startDate = "wednesday";
                            break;
                        case "Thu":
                            row.os_startDate = "thursday";
                            break;
                        case "Fri":
                            row.os_startDate = "friday";
                            break;
                        case "Sat":
                            row.os_startDate = "saturday";
                            break;
                        case "Sun":
                            row.os_startDate = "sunday";
                            break;
                    }

                    switch(OsSchedule[3].split(" ")[0]) {
                        case "Mon":
                            row.os_endDate = "monday";
                            break;
                        case "Tue":
                            row.os_endDate = "tuesday";
                            break;
                        case "Wed":
                            row.os_endDate = "wednesday";
                            break;
                        case "Thu":
                            row.os_endDate = "thursday";
                            break;
                        case "Fri":
                            row.os_endDate = "friday";
                            break;
                        case "Sat":
                            row.os_endDate = "saturday";
                            break;
                        case "Sun":
                            row.os_endDate = "sunday";
                            break;
                    }
                }

                var start = "";
                start = new Date(OsSchedule[1]);
                var end = "";
                end = new Date(OsSchedule[3]);

                setOsStartTimeEdit(start);
                setOsEndTimeEdit(end);

            }
            
        }

        if (row.delivery_days !== "") {
            var deliverySchedule = row.delivery_days.split("-");

            if(deliverySchedule.length > 2) {
                row.delivery_startDate = deliverySchedule[0] !== "undefined" ? deliverySchedule[0] : deliverySchedule[1].split(" ")[0];
                setDeliveryStartTimeEdit(new Date(deliverySchedule[1]));
                row.delivery_endDate = deliverySchedule[2] !== "undefined" ? deliverySchedule[2] : deliverySchedule[3].split(" ")[0];
                setDeliveryEndTimeEdit(new Date(deliverySchedule[3]));

                if(deliverySchedule[0] === "undefined" || deliverySchedule[2] === "undefined"){
                    switch(deliverySchedule[1].split(" ")[0]) {
                        case "Mon":
                            row.delivery_startDate = "monday";
                            break;
                        case "Tue":
                            row.delivery_startDate = "tuesday";
                            break;
                        case "Wed":
                            row.delivery_startDate = "wednesday";
                            break;
                        case "Thu":
                            row.delivery_startDate = "thursday";
                            break;
                        case "Fri":
                            row.delivery_startDate = "friday";
                            break;
                        case "Sat":
                            row.delivery_startDate = "saturday";
                            break;
                        case "Sun":
                            row.delivery_startDate = "sunday";
                            break;
                    }

                    switch(deliverySchedule[3].split(" ")[0]) {
                        case "Mon":
                            row.delivery_endDate = "monday";
                            break;
                        case "Tue":
                            row.delivery_endDate = "tuesday";
                            break;
                        case "Wed":
                            row.delivery_endDate = "wednesday";
                            break;
                        case "Thu":
                            row.delivery_endDate = "thursday";
                            break;
                        case "Fri":
                            row.delivery_endDate = "friday";
                            break;
                        case "Sat":
                            row.delivery_endDate = "saturday";
                            break;
                        case "Sun":
                            row.delivery_endDate = "sunday";
                            break;
                    }
                }

                var start = "";
                start = new Date(deliverySchedule[1]);
                console.log(deliverySchedule[1])
                var end = "";
                end = new Date(deliverySchedule[3]);

                setDeliveryStartTimeEdit(start);
                setDeliveryEndTimeEdit(end);

            }
            
        }

        setEditBranchData(row);


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

    console.log(addBranchData)

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
                <Row className="mb-5">
                    <Col xs={6}>
                        <h1 className="page-title"> BRANCHES </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
                            className="search-bar"
                            onChange={handleFilterChange}
                            placeholder="Search branch name..."
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
                                onClick={handleShowAddBranchModal}
                            >
                                To Mango Magic
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="POTATO CORNER"
                                onClick={handleShowAddBranchModal}
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
                                    "TYPE",
                                    "ADDRESS",
                                    "PHONE NUMBER",
                                    "INITIAL CASH IN DRAWER",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "branch_name",
                                    "branch_type",
                                    "address",
                                    "phone_number",
                                    "initial_cash",
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
                                    "TYPE",
                                    "ADDRESS",
                                    "PHONE NUMBER",
                                    "INITIAL CASH IN DRAWER",
                                    "ACTIONS",
                                ]}
                                headerSelector={[
                                    "branch_name",
                                    "branch_type",
                                    "address",
                                    "phone_number",
                                    "initial_cash",
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
                title={`BRANCH TO ${addTo}`}
                type="branch"
                show={showAddBranchModal}
                onHide={handleCloseAddBranchModal}
                onSave={() => create()}
                isProceed={addBranchData.is_franchise === "1" ? true : false}
                isClicked={isClicked}
            >
                <div className="mt-3">
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
                        <Col xl={3} className="nc-modal-custom-row-details">
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
                    {addTo !== "POTATO CORNER" && (
                        <>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    BRANCH TYPE
                                    <span className="required-icon">*</span>
                                    <InputError
                                        isValid={isError.is_franchise}
                                        message={"Branch type is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custon-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="1"
                                        className=""
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <span className="radio-label">
                                        FRANCHISE
                                    </span>
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="0"
                                        className=""
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <span className="radio-label">
                                        COMPANY-OWNED
                                    </span>
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="2"
                                        className=""
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <span className="radio-label">OTHERS</span>
                                </Col>
                            </Row>
                        </>
                    )}
                    {addBranchData.is_franchise === "0" && (
                        <Row className="nc-modal-custom-row">
                            <Col>
                                MONTHLY RENTAL FEE
                                <Form.Control
                                    type="text"
                                    name="monthly_rental_fee"
                                    value={addBranchData.monthly_rental_fee}
                                    className="nc-modal-custom-input-edit"
                                    onChange={(e) => handleAddChange(e)}
                                    required
                                />
                                <InputError
                                    isValid={isError.monthly_rental_fee}
                                    message={"Monthly rental fee is required"}
                                />
                            </Col>
                        </Row>
                    )}
                    {addBranchData.is_franchise !== "2" ? (
                        <>
                            <Row className="nc-modal-custom-row">
                                <Col>
                                    PRICE LEVEL
                                    <Form.Select
                                        name="price_level"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.price_level}
                                        onChange={(e) => handleAddChange(e)}
                                    >
                                        <option value="">
                                            Select price level...
                                        </option>
                                        {priceLevel.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    BRANCH GROUP
                                    <Form.Select
                                        name="branch_group_id"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.branch_group_id}
                                        onChange={(e) => handleAddChange(e)}
                                    >
                                        <option value="">
                                            Select Branch group...
                                        </option>
                                        {branchGroup.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    INVENTORY GROUP
                                    <Form.Select
                                        name="inventory_group_id"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.inventory_group_id}
                                        onChange={(e) => handleAddChange(e)}
                                    >
                                        <option value="">
                                            Select inventory group...
                                        </option>
                                        {inventoryGroup.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                    <InputError
                                        isValid={isError.inventory_group_id}
                                        message={"Inventory group is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>
                                    INITIAL DRAWER
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="initial_drawer"
                                        value={addBranchData.initial_drawer}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isError.initial_drawer}
                                        message={"Initial drawer is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    TIN NUMBER
                                    <Form.Control
                                        type="text"
                                        name="tin_no"
                                        value={addBranchData.tin_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    BIR NUMBER
                                    <Form.Control
                                        type="text"
                                        name="bir_no"
                                        value={addBranchData.bir_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    CONTRACT START
                                    <ReactDatePicker
                                        name="contract_start"
                                        className="nc-modal-custom-input-edit ps-label-content me-3 form-control"
                                        placeholderText="Select Date"
                                        selected={addBranchData.contract_start}
                                        onChange={(date) => {
                                            setAddBranchData((prev) => {
                                                return { ...prev, contract_start: date };
                                            });
                                        }}
                                    />
                                    {/* <Form.Control
                                        type="date"
                                        name="contract_start"
                                        value={addBranchData.contract_start}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    /> */}
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    CONTRACT END
                                    <ReactDatePicker
                                        name="contract_end"
                                        className="nc-modal-custom-input-edit ps-label-content me-3 form-control"
                                        placeholderText="Select Date"
                                        selected={addBranchData.contract_end}
                                        onChange={(date) => {
                                            setAddBranchData((prev) => {
                                                return { ...prev, contract_end: date };
                                            });
                                        }}
                                    />
                                    {/* <Form.Control
                                        type="date"
                                        name="contract_end"
                                        value={addBranchData.contract_end}
                                        data-date-format="MM/DD/YYYY"
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    /> */}
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>OPERATION SCHEDULE</Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form.Select
                                        // type="text"
                                        name="os_startDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.os_startDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        <option value="monday" selected>
                                            Monday
                                        </option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form.Select
                                        name="os_endDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.os_endDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        {addBranchData.os_startDate ===
                                            "monday" && (
                                            <>
                                                <option value="tuesday">
                                                    Tuesday
                                                </option>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "tuesday" && (
                                            <>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "wednesday" && (
                                            <>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "thursday" && (
                                            <>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "Friday" && (
                                            <>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "Saturday" && (
                                            <option value="saturday">
                                                Sunday
                                            </option>
                                        )}
                                        {addBranchData.os_startDate ===
                                            "Sunday" && <></>}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={4}>
                                    FROM
                                    <Form>
                                        <ReactDatePicker
                                            selected={osStartTime}
                                            onChange={(date) =>
                                                setOsStartTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                                <Col sm={4}>
                                    To
                                    <Form>
                                        <ReactDatePicker
                                            selected={osEndTime}
                                            onChange={(date) =>
                                                setOsEndTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>GRABFOOD/FOODPANDA OPERATION SCHEDULE</Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form.Select
                                        name="delivery_startDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.delivery_startDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        <option value="monday" selected>
                                            Monday
                                        </option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form.Select
                                        name="delivery_endDate"
                                        className="nc-modal-custom-input"
                                        value={addBranchData.delivery_endDate}
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    >
                                        {addBranchData.delivery_startDate ===
                                            "monday" && (
                                            <>
                                                <option value="tuesday">
                                                    Tuesday
                                                </option>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "tuesday" && (
                                            <>
                                                <option value="wednesday">
                                                    Wednesday
                                                </option>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "wednesday" && (
                                            <>
                                                <option value="thursday">
                                                    Thursday
                                                </option>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "thursday" && (
                                            <>
                                                <option value="friday">
                                                    Friday
                                                </option>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "Friday" && (
                                            <>
                                                <option value="saturday">
                                                    Saturday
                                                </option>
                                                <option value="sunday">
                                                    Sunday
                                                </option>
                                            </>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "Saturday" && (
                                            <option value="saturday">
                                                Sunday
                                            </option>
                                        )}
                                        {addBranchData.delivery_startDate ===
                                            "Sunday" && <></>}
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={4}>
                                    FROM
                                    <Form>
                                        <ReactDatePicker
                                            selected={deliveryStartTime}
                                            onChange={(date) =>
                                                setDeliveryStartTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                                <Col sm={4}>
                                    To
                                    <Form>
                                        <ReactDatePicker
                                            selected={deliveryEndTime}
                                            onChange={(date) =>
                                                setDeliveryEndTime(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    OPENING DATE
                                    <ReactDatePicker
                                        name="opening_date"
                                        className="nc-modal-custom-input-edit ps-label-content me-3 form-control"
                                        placeholderText="Select Date"
                                        selected={addBranchData.opening_date}
                                        placeholderText="Select Date"
                                        onChange={(date) => {
                                            setAddBranchData((prev) => {
                                                return { ...prev, opening_date: date };
                                            });
                                        }}
                                    />
                                    {/* <Form.Control
                                        type="date"
                                        name="opening_date"
                                        value={addBranchData.opening_date}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    /> */}
                                    <InputError
                                        isValid={isError.opening_date}
                                        message={
                                            "Opening date is required"
                                        }
                                    />
                                </Col>
                                <Col>
                                    CONTACT PERSON
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="contact_person"
                                        value={addBranchData.contact_person}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isError.contact_person}
                                        message={"Contact person is required"}
                                    />
                                </Col>
                                <Col>
                                    CONTACT PERSON PHONE NUMBER
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="contact_person_no"
                                        value={addBranchData.contact_person_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleAddChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isError.contact_person_no}
                                        message={
                                            "Contact person phone number is required"
                                        }
                                    />
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            </AddModal>
            <EditModal
                title="BRANCH"
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
                        <Col xl={3} className="nc-modal-custom-row-details">
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
                    {addTo !== "POTATO CORNER" && (
                        <>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    BRANCH TYPE
                                    <InputError
                                        isValid={isErrorEdit.branch_type}
                                        message={"Branch type is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custon-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="1"
                                        className="radio-input"
                                        checked={
                                            editBranchData.is_franchise === "1"
                                        }
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                    <span className="radio-label">
                                        FRANCHISE
                                    </span>
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="0"
                                        className="radio-input"
                                        checked={
                                            editBranchData.is_franchise === "0"
                                        }
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                    <span className="radio-label">
                                        COMPANY-OWNED
                                    </span>
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    <input
                                        type="radio"
                                        name="is_franchise"
                                        value="2"
                                        className="radio-input"
                                        checked={
                                            editBranchData.is_franchise === "2"
                                        }
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                    <span className="radio-label">OTHERS</span>
                                </Col>
                            </Row>
                        </>
                    )}
                    {editBranchData.is_franchise !== "2" && (
                        <>
                            <Row className="nc-modal-custom-row">
                                <Col>
                                    FRANCHISEE
                                    <Form.Control
                                        type="text"
                                        name="franchisee_name"
                                        value={editBranchData.franchisee_name}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                </Col>
                                <Col>
                                    FRANCHISEE CONTACT NO.
                                    <Form.Control
                                        type="text"
                                        name="franchisee_contact_no"
                                        value={
                                            editBranchData.franchisee_contact_no
                                        }
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                </Col>
                                <Col>
                                    INITIAL DRAWER
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="initial_drawer"
                                        value={editBranchData.initial_drawer}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isErrorEdit.initial_drawer}
                                        message={"Initial drawer is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>
                                    PRICE LEVEL
                                    <Form.Select
                                        name="price_level"
                                        className="nc-modal-custom-input"
                                        value={editBranchData.price_level}
                                        onChange={(e) => handleEditChange(e)}
                                    >
                                        <option value="">
                                            Select price level...
                                        </option>
                                        {priceLevel.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    BRANCH GROUP
                                    <Form.Select
                                        name="branch_group_id"
                                        className="nc-modal-custom-input"
                                        value={editBranchData.branch_group_id}
                                        onChange={(e) => handleEditChange(e)}
                                    >
                                        <option value="">
                                            Select Branch group...
                                        </option>
                                        {branchGroup.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    INVENTORY GROUP
                                    <Form.Select
                                        name="inventory_group_id"
                                        className="nc-modal-custom-input"
                                        value={editBranchData.inventory_group_id}
                                        onChange={(e) => handleEditChange(e)}
                                    >
                                        <option value="">
                                            Select inventory group...
                                        </option>
                                        {inventoryGroup.map((data) => {
                                            return (
                                                <option value={data.id}>
                                                    {data.name}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                    <InputError
                                        isValid={isErrorEdit.inventory_group_id}
                                        message={"Inventory group is required"}
                                    />
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    TIN NUMBER
                                    <Form.Control
                                        type="text"
                                        name="tin_no"
                                        value={editBranchData.tin_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    BIR NUMBER
                                    <Form.Control
                                        type="text"
                                        name="bir_no"
                                        value={editBranchData.bir_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    CONTRACT START
                                    <ReactDatePicker
                                        name="contract_start"
                                        className="nc-modal-custom-input-edit ps-label-content me-3 form-control"
                                        selected={editBranchData?.contract_start !== "0000-00-00" ? new Date(editBranchData.contract_start) : new Date()}
                                        placeholderText="Select Date"
                                        onChange={(date) => {
                                            setEditBranchData((prev) => {
                                                return { ...prev, contract_start: date };
                                            });
                                        }}
                                    />
                                    {/* <Form.Control
                                        type="date"
                                        name="contract_start"
                                        value={editBranchData.contract_start}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    /> */}
                                </Col>
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    CONTRACT END
                                    <ReactDatePicker
                                        name="contract_end"
                                        className="nc-modal-custom-input-edit ps-label-content me-3 form-control"
                                        selected={editBranchData?.contract_end !== "0000-00-00" ? new Date(editBranchData.contract_end) : new Date()}
                                        placeholderText="Select Date"
                                        onChange={(date) => {
                                            setEditBranchData((prev) => {
                                                return { ...prev, contract_end: date };
                                            });
                                        }}
                                    />
                                    {/* <Form.Control
                                        type="date"
                                        name="contract_end"
                                        value={editBranchData.contract_end}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    /> */}
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>OPERATION SCHEDULE</Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form.Select
                                        name="os_startDate"
                                        className="nc-modal-custom-input"
                                        value={editBranchData.os_startDate}
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    >
                                        <option value="monday" selected>
                                            Monday
                                        </option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form.Select
                                        name="os_endDate"
                                        className="nc-modal-custom-input"
                                        value={editBranchData.os_endDate}
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    >
                                        <option value="monday"> Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form>
                                        <ReactDatePicker
                                            selected={osStartTimeEdit}
                                            onChange={(date) =>
                                                setOsStartTimeEdit(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form>
                                        <ReactDatePicker
                                            selected={osEndTimeEdit}
                                            onChange={(date) =>
                                                setOsEndTimeEdit(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col>GRABFOOD/FOODPANDA OPERATION SCHEDULE</Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form.Select
                                        // type="text"
                                        name="delivery_startDate"
                                        className="nc-modal-custom-input"
                                        value={
                                            editBranchData.delivery_startDate
                                        }
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    >
                                        <option value="monday" selected>
                                            Monday
                                        </option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form.Select
                                        name="delivery_endDate"
                                        className="nc-modal-custom-input"
                                        value={editBranchData.delivery_endDate}
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    >
                                        <option value="monday" selected>
                                            Monday
                                        </option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">
                                            Wednesday
                                        </option>
                                        <option value="thursday">
                                            Thursday
                                        </option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">
                                            Saturday
                                        </option>
                                        <option value="sunday">Sunday</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col sm={6}>
                                    FROM
                                    <Form>
                                        <ReactDatePicker
                                            selected={deliveryStartTimeEdit}
                                            onChange={(date) =>
                                                setDeliveryStartTimeEdit(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                                <Col sm={6}>
                                    To
                                    <Form>
                                        <ReactDatePicker
                                            selected={deliveryEndTimeEdit}
                                            onChange={(date) =>
                                                setDeliveryEndTimeEdit(date)
                                            }
                                            showTimeSelect
                                            showTimeSelectOnly
                                            timeIntervals={15}
                                            timeCaption="Time"
                                            dateFormat="h:mm aa"
                                        />
                                    </Form>
                                </Col>
                            </Row>
                            <Row className="nc-modal-custom-row">
                                <Col xl={3} className="nc-modal-custom-row-details">
                                    OPENING DATE
                                    <ReactDatePicker
                                        name="opening_date"
                                        className="nc-modal-custom-input-edit ps-label-content me-3 form-control"
                                        selected={editBranchData?.opening_date !== "0000-00-00" ? new Date(editBranchData.opening_date) : new Date()}
                                        onChange={(date) => {
                                            setEditBranchData((prev) => {
                                                return { ...prev, opening_date: date };
                                            });
                                        }}
                                    />
                                    {/* <Form.Control
                                        type="date"
                                        name="opening_date"
                                        value={editBranchData.opening_date}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    /> */}
                                </Col>
                                <Col>
                                    CONTACT PERSON
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="contact_person"
                                        value={editBranchData.contact_person}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isErrorEdit.contact_person}
                                        message={"Contact person is required"}
                                    />
                                </Col>
                                <Col>
                                    CONTACT PERSON PHONE NUMBER
                                    <span className="required-icon">*</span>
                                    <Form.Control
                                        type="text"
                                        name="contact_person_no"
                                        value={editBranchData.contact_person_no}
                                        className="nc-modal-custom-input-edit"
                                        onChange={(e) => handleEditChange(e)}
                                        required
                                    />
                                    <InputError
                                        isValid={isErrorEdit.contact_person_no}
                                        message={
                                            "Contact person phone number is required"
                                        }
                                    />
                                </Col>
                            </Row>
                        </>
                    )}
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
                            </Row>
                            {(selectedRow.is_franchise === "0" ||
                                selectedRow.is_franchise === "1") && (
                                <>
                                    <Row className="nc-modal-custom-row-view mt-3">
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            TIN NUMBER
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.tin_no ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            BIR NUMBER
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.bir_no ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            INITIAL CASH IN DRAWER
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.initial_drawer ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="nc-modal-custom-row-view mt-3">
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            CONTRACT START
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {" "}
                                                    {selectedRow?.contract_start
                                                        ? formatDate(
                                                              selectedRow.contract_start
                                                          )
                                                        : "--/--/----"}{" "}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            CONTRACT END
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {" "}
                                                    {selectedRow?.contract_end
                                                        ? formatDate(
                                                              selectedRow.contract_end
                                                          )
                                                        : "--/--/----"}{" "}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            OPENING DATE
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {" "}
                                                    {selectedRow?.opening_date
                                                        ? formatDate(
                                                              selectedRow.opening_date
                                                          )
                                                        : "--/--/----"}{" "}
                                                </Col>
                                            </Row>
                                        </Col>
                                        {selectedRow.is_franchise === "0" && (
                                            <Col xl={3} className="nc-modal-custom-row-details">
                                                MONTHLY RENTAL FEE
                                                <Row className="nc-modal-custom-row">
                                                    <Col>
                                                        {selectedRow?.rental_monthly_fee ||
                                                            "N/A"}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        )}
                                    </Row>
                                    <Row className="nc-modal-custom-row-view mt-3">
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            PRICE LEVEL
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.price_level ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            BRANCH GROUP
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.branch_group_id ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xl={3} className="nc-modal-custom-row-details">
                                            INVENTORY GROUP
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {selectedRow?.inventory_group_id ||
                                                        "N/A"}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row className="nc-modal-custom-row-view mt-3">
                                        <Col xl={6} className="nc-modal-custom-row-details">
                                            OPERATION SCHEDULE
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {/* {formatSchedule(
                                                        selectedRow.operation_days
                                                    )} */}
                                                    {
                                                        selectedRow?.operation_days + " " + selectedRow?.operation_times
                                                    }
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col xl={6} className="nc-modal-custom-row-details">
                                            DELIVERY
                                            <Row className="nc-modal-custom-row">
                                                <Col>
                                                    {
                                                        selectedRow?.delivery_days + " " + selectedRow?.delivery_times
                                                    }
                                                    {/* {formatSchedule(
                                                        selectedRow.delivery_days
                                                    )} */}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </div>
                    </div>
                    {(selectedRow.is_franchise === "0" ||
                        selectedRow.is_franchise === "1") && (
                        <div className="col-sm-12 mt-3 space">
                            <span className="custom-modal-body-title-contact-info">
                                CONTACT INFORMATION
                            </span>
                            <div className="mt-3 container-wrapper">
                                <Row className="nc-modal-custom-row-view">
                                    <Col xl={3} className="nc-modal-custom-row-details">
                                        CONTACT PERSON
                                        <Row className="nc-modal-custom-row">
                                            <Col>
                                                {" "}
                                                {
                                                    selectedRow.contact_person
                                                }{" "}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xl={3} className="nc-modal-custom-row-details">
                                        PHONE NUMBER
                                        <Row className="nc-modal-custom-row">
                                            <Col>
                                                {" "}
                                                {
                                                    selectedRow.contact_person_no
                                                }{" "}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    )}
                </div>
            </ViewModal>
        </div>
    );
}
