import React, { useState, useEffect, useRef } from "react";
import {
    Col,
    Form,
    Row,
    Tab,
    Tabs,
    Button,
    Badge,
    DropdownButton,
    Dropdown,
    ButtonGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    capitalizeFirstLetter,
    classificationOptions,
    getType,
} from "../../Helpers/Utils/Common";
import {
    getAllItemList,
    getItemHistory,
    getLowOnStock,
    getLowOnStockPotato,
    searchInventory,
} from "../../Helpers/apiCalls/Inventory/ItemListApi";
import {
    getAllItemListPotato,
    getItemHistoryPotato,
    searchInventoryPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Inventory/ItemListApi";
import {
    dateFormat,
    numberFormat,
    refreshPage,
    toastStyle,
    TokenExpiry,
} from "../../Helpers/Utils/Common";
import trash from "../../Assets/Images/trash.png";
import equal from "../../Assets/Images/equal.png";
import Select from "react-select";
//components
import Navbar from "../../Components/Navbar/Navbar";
import Table from "./Adjustment/AdjustmentTable";
import Delete from "../../Components/Modals/DeleteModal";
import EditModal from "../../Components/Modals/EditModal";

//css
import "./Inventory.css";
import "../../Components/Navbar/Navbar.css";
import { getAllBranches } from "../../Helpers/apiCalls/Manage/Branches";
import { getItem } from "../../Helpers/apiCalls/itemsApi";
import { getItemPotato } from "../../Helpers/apiCalls/PotatoCorner/Inventory/ItemApi";
import InputError from "../../Components/InputError/InputError";
import toast from "react-hot-toast";

export default function ItemLists() {
    let navigate = useNavigate();
    const [userType, setUserType] = useState(getType());
    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [filterData, setFilterData] = useState([]);
    const [filterDataPotato, setFilterDataPotato] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [itemListPotato, setItemListPotato] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState("1");
    const [selectedAction, setSelectedAction] = useState("");
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [itemDetail, setItemDetail] = useState({});
    const [fetching, setFetching] = useState(false);
    const [checkedLowStockItems, setCheckedLowStockItems] = useState([]);
    function handleOnCheck(row) {
        console.log("selected row", row.selectedRows);
        setCheckedLowStockItems(row.selectedRows);
    }

    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const handleShowEditItemModal = () => setShowEditItemModal(true);
    const handleCloseEditItemModal = () => {
        setShowEditItemModal(false);
        setItemDetail({});
        setSelectedAction("");
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
    };
    function AddItemEdit() {
        const newItem = {
            breakdown_value: "",
            breakdown_unit: "",
            inventory_value: "",
            inventory_unit: "",
            minimum: "",
            maximum: "",
            acceptable_variance: "",
        };
        setItemsUnitsMap((prevItemsUnitsMap) => [
            ...prevItemsUnitsMap,
            newItem,
        ]);
    }
    const [itemsUnits, setItemsUnits] = useState([
        {
            breakdown_unit: "",
            breakdown_value: "",
            inventory_unit: "",
            inventory_value: "",
            minimum: "",
            maximum: "",
            acceptable_variance: "",
        },
    ]);
    const [itemsUnitsMap, setItemsUnitsMap] = useState([
        {
            breakdown_unit: "",
            breakdown_value: "",
            inventory_unit: "",
            inventory_value: "",
            minimum: "",
            maximum: "",
            acceptable_variance: "",
        },
    ]);

    function CreatePO(row) {
        return (
            <button
                type="button"
                className="button-primary view-btn me-3"
                onClick={() => handleCreatePO(row.id, row.api_link)}
            >
                Make PO
            </button>
        );
    }

    function handleViewPO(po_id, shopType) {
        window.open(
            "purchaseorders/review/1/" +
                shopType +
                "/" +
                shopType +
                "-" +
                po_id,
            "_blank"
        );
    }

    function ActionBtn(row, type) {
        return (
            <Form.Select
                name="action"
                className="PO-select-action"
                value={selectedAction}
                id={row.id}
                onChange={(e) => handleSelectChange(e, row, type)}
            >
                <option value="" selected hidden>
                    Select
                </option>
                <option value="adjust-po" className="color-options">
                    Adjust
                </option>
                <option value="history-po" className="color-options">
                    History
                </option>
            </Form.Select>
        );
    }

    function OngoingPOBadges(row, type) {
        return (
            <ButtonGroup vertical>
            <>
                {row.ongoing_po?.map((po) => {
                    return (
                        <Button
                            className="px-2 py-2 me-1"
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleViewPO(po.id, type)}
                        >{`PO-${po.id}`}</Button>
                    );
                })}
            </>
            </ButtonGroup>
        );
    }

    const [selectedItem, setSelectedItem] = useState({});
    function handleSelectChange(e, row, type) {
        if (e.target.value === "edit-ps") {
            navigate("/paysuppliers/edit/" + e.target.id + "/" + e.target.role);
        } else if (e.target.value === "adjust-po") {
            navigate(
                "/itemlists/branch-adjustment/" + e.target.id + "/" + type
            );
        } else if (e.target.value === "history-po") {
            navigate(
                "/itemlists/history/" +
                    row.branch_id +
                    "/" +
                    row.item_id +
                    "/" +
                    row.item_unit_id +
                    "/" +
                    row.inventory_unit_name +
                    "-" +
                    row.api_link
            );
        }

        setSelectedAction("");
    }

    React.useEffect(() => {
        getItemDetails(selectedItem);
    }, [selectedItem]);

    async function fetchData() {
        setShowLoader(true);
        setItemList([]);

        const response = await getLowOnStock(filterConfig);

        if (response.error) {
            TokenExpiry(response);
        } else {
            var items = [];
            var sortedData = response.data.data.sort((a, b) =>
                a.item_name > b.item_name
                    ? 1
                    : b.item_name > a.item_name
                    ? -1
                    : 0
            );
            sortedData.map(async (PO) => {
                var info = {};

                info.id = PO.id;
                info.item_id = PO.item_id;
                info.item_unit_id = PO.item_unit_id;
                info.branch_id = PO.branch_id;
                info.item_name = PO.item_name;
                info.current_qty = PO.current_qty
                    ? parseInt(PO.current_qty)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "";
                info.min = PO.min
                    ? parseInt(PO.min)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "";
                info.max = PO.max
                    ? parseInt(PO.max)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "";
                info.critical_level = "1";
                info.inventory_unit_name = PO.inventory_unit_name;
                info.api_link = "mango_magic";
                info.item_type = PO.item_type
                    ? capitalizeFirstLetter(PO.item_type.replace("_", " "))
                    : "";
                info.action = "";
                info.ongoing_po = PO.ongoing_po;
                items.push(info);
            });
            setItemList(items);
            setFilterData(items);
        }

        const response2 = await getLowOnStockPotato(filterConfig);

        if (response2.error) {
            TokenExpiry(response2);
        } else {
            var itemsPotato = [];
            var sortedData = response2.data.data.sort((a, b) =>
                a.item_name > b.item_name
                    ? 1
                    : b.item_name > a.item_name
                    ? -1
                    : 0
            );
            sortedData.map(async (PO) => {
                var info = {};

                info.id = PO.id;
                info.item_id = PO.item_id;
                info.item_unit_id = PO.item_unit_id;
                info.branch_id = PO.branch_id;
                info.item_name = PO.item_name;
                info.current_qty = PO.current_qty
                    ? parseInt(PO.current_qty)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "";
                info.min = PO.min
                    ? parseInt(PO.min)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "";
                info.max = PO.max
                    ? parseInt(PO.max)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "";
                info.critical_level = "1";
                info.inventory_unit_name = PO.inventory_unit_name;
                info.api_link = "potato_corner";
                info.item_type = PO.item_type
                    ? capitalizeFirstLetter(PO.item_type.replace("_", " "))
                    : "";
                info.action = "";
                info.ongoing_po = PO.ongoing_po;
                itemsPotato.push(info);
            });
            setItemListPotato(itemsPotato);
            setFilterDataPotato(itemsPotato);
        }

        setShowLoader(false);
    }

   
    async function fetchAllBranches() {
        const response = await getAllBranches();

        if (response.data) {
            var all = response.data.data.data;
            setBranches(all.filter((data) => {return data.is_franchise !== "2"}));
        }
    }

    const [filterConfig, setFilterConfig] = useState({
        branch_id: "1",
        branch_name: "Warehouse",
        name: "",
        item_type: "ingredient",
        with_po: "", 
        tab: "mango_magic",
        shop: "mango_magic",
    });

     
    const [branches, setBranches] = useState([]);


    const [branch, setBranch] = useState({});
    const [branchOptions, setBranchOptions] = useState([]);

    useEffect(()=>{
        // console.log(franchisees)
        // console.log(branches);
        // return;
        // var branchName = "";
        var currentBranch = {}
        setBranchOptions(branches.map((_branch)=>{
            var retval = {label: _branch.name, value:_branch.id}
            if(userType === "commissary_officer"){
                if(_branch.id === "1" ||
                _branch.id === "5"){
                    retval["disabled"] = true;
                }
            } else {
                retval["disabled"] = false;
            }
            if(_branch.id === "1"){
                currentBranch = {...retval};
            }
            return retval;
        }))
        // setBranches((branches)=>{
        //     var newBranches = [...branches];
        //     return newBranches.reverse();
        // });
        // handleBranchChange({name: branchName, value: filterConfig.branch_id});
        // handleBranchChange(currentBranch);
        // console.log(currentBranch);
        setBranch(currentBranch);
        // console.log(branchOptions);
        console.log(filterConfig);
    },[branches])

    function handleBranchChange(e){
        console.log(e)
        setBranch(e);
        const toFilter = {target: {name: "branch_id", value: e.value}};
        handleFilterChange(toFilter);
    }
    console.log(filterConfig);



    // const isInitialMount = useRef(true);
    // const filterConfigKey = 'inventory-lowOnStock-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 // console.log("found");
    //                 handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).shop);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])

    function handleFilterChange(e) {
        const { name, value } = e.target;

        if (name === "branch_id") {
            setFilterConfig((prev) => {
                return {
                    ...prev,
                    branch_id: value.split("|")[0],
                    branch_name: value.split("|")[1],
                };
            });
        } else {
            setFilterConfig((prev) => {
                return { ...prev, [name]: value };
            });
        }
    }

    async function getItemDetails(item_id) {
        setFetching(true);
        if (filterConfig.shop === "mango_magic") {
            const response = await getItem(item_id);
            if (response.data) {
                var item = response.data[0];
                setItemDetail(() => {
                    return item;
                });
                setItemsUnitsMap(() => {
                    return item.item_units;
                });
            }
        } else if (filterConfig.shop === "potato_corner") {
            const response = await getItemPotato(item_id);
            if (response.data) {
                var item = response.data[0];
                setItemDetail(() => {
                    return item;
                });
                setItemsUnitsMap(() => {
                    return item.item_units;
                });
            }
        }
        setTimeout(() => setFetching(false), 1);
    }

    const handleCreatePO = () => {
        console.log(checkedLowStockItems);
        console.log(filterConfig);
        toast.loading("Preparing your order...", {
            style: toastStyle(),
            duration: 1000,
        });
        navigate("/purchaseorders/add/" + filterConfig.shop.split("_")[0], {
            state: {
                branch_id: filterConfig.branch_id,
                branch_name: filterConfig.branch_name,
                purchased_items: checkedLowStockItems,
            },
        });
    };

    const handleCreateTransferRequest = (e) => {
        toast.loading("Preparing your transfer...", {
            style: toastStyle(),
            duration: 1000,
        });
        navigate("/transfers/add/" + filterConfig.shop, {
            state: {
                to_branch_id: e.split("|")[0],
                to_branch_name: e.split("|")[1],
                from_branch_id: filterConfig.branch_id,
                from_branch_name: filterConfig.branch_name,
                purchased_items: checkedLowStockItems,
            },
        });
    };

    function renderCreatePOBtn(branch_id) {
        if (branch_id === "1" || branch_id === "2" || branch_id === "5") {
            return (
                <button
                    type="button"
                    className="button-primary mr-3 "
                    onClick={() => handleCreatePO()}
                >
                    Create PO
                </button>
            );
        } else {
            return null;
        }
    }

    function renderRequestToBtn(branch_id) {
        if (branch_id === "2" || branch_id === "3" || branch_id === "4") {
            return (
                <Dropdown
                    onSelect={handleCreateTransferRequest}
                >
                    <Dropdown.Toggle
                        className="button-primary px-3"
                        variant="success"
                        id="dropdown-basic"
                    >
                        Transfer
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="px-3">
                        {branches?.map((branch) => {
                            return (
                                <Dropdown.Item
                                    eventKey={`${branch.id}|${branch.name}`}
                                    disabled={
                                        branch.id === filterConfig.branch_id
                                    }
                                >
                                    To {branch.name}
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>
            );
        } else {
            return null;
        }
    }

    function renderButton(branch_id) {
        switch (branch_id) {
            case "1":
                return (
                    <Col xs={2}>
                        <button
                            type="button"
                            className="button-primary mr-3 "
                            onClick={() => handleCreatePO()}
                        >
                            Create PO
                        </button>
                    </Col>
                );
            case "2": 
                return (
                    <div className="d-flex">
                        <button
                            type="button"
                            className="button-primary me-3"
                            onClick={() => handleCreatePO()}
                        >
                            Create PO
                        </button>
                        <Dropdown
                            className="dropdown-btn custom-dropdown"
                            onSelect={handleCreateTransferRequest}
                        >
                            <Dropdown.Toggle
                                className="button-primary me-3"
                                variant="success"
                                id="dropdown-basic"
                            >
                                Transfer
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {branches?.map((branch) => {
                                    return (
                                        <Dropdown.Item
                                            eventKey={`${branch.id}|${branch.name}`}
                                            disabled={
                                                branch.id ===
                                                filterConfig.branch_id
                                            }
                                        >
                                            To {branch.name}
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                );
            default:
                return (
                    <Col xs={2}>
                        <Dropdown onSelect={handleCreateTransferRequest}>
                            <Dropdown.Toggle
                                className="button-primary me-3"
                                variant="success"
                                id="dropdown-basic"
                            >
                                Transfer
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {branches?.map((branch) => {
                                    return (
                                        <Dropdown.Item
                                            eventKey={`${branch.id}|${branch.name}`}
                                            disabled={
                                                branch.id ===
                                                filterConfig.branch_id
                                            }
                                        >
                                            To {branch.name}
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                );
        }
    }

    const handleTabSelect = (key) => {
        setFilterConfig((prev) => {
            return { ...prev, shop: key };
        });
    };

    React.useEffect(() => {
        fetchData();
    }, [filterConfig]);

    React.useEffect(() => {
        fetchAllBranches();
    }, []);

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
                        <h1 className="page-title"> LOW ON STOCK </h1>
                    </div>
                    {/* input search button */}
                    <div className="col-sm-6 d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
                            placeholder="Search item name..."
                            className="search-bar"
                            value={filterConfig.name}
                            onChange={(e) => handleFilterChange(e)}
                        ></input>
                    </div>
                </div>
                <Row className="mb-4 my-2 PO-filters d-flex filter">
                    <Col xs={20}>
                        <Select
                            className="dropsearch-filter px-0 py-0 me-2"
                            classNamePrefix="react-select"
                            value={branch}
                            options={branchOptions}
                            onChange={handleBranchChange}
                        />
                    </Col>
                   {/*  <Col xs={3}>
                        <Form.Select
                            name="branch_id"
                            className="warehouse me-3"
                            value={`${filterConfig.branch_id}|${filterConfig.branch_name}`}
                            onChange={(e) => {
                                handleFilterChange(e);
                                setCheckedLowStockItems([]);
                            }}
                        >
                            {// !TODO: make this  
                            }
                            {branches?.map((branch) => {
                                return (
                                    <option
                                        value={`${branch.id}|${branch.name}`}
                                        disabled={
                                            userType === "commissary_officer" &&
                                            (branch.id === "1" ||
                                                branch.id === "5")
                                        }
                                        selected={
                                            branch.id === filterConfig.branch_id
                                        }
                                    >
                                        {branch.name}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    </Col>
                    */}
                    <Col xs={2}>
                        {checkedLowStockItems.length !== 0 &&
                            renderCreatePOBtn(filterConfig.branch_id)}
                    </Col>
                </Row>
                <div>
                    {/* table */}
                    {filterConfig.branch_id === "1" && (
                        <Tabs
                            activeKey={filterConfig.shop}
                            defaultActiveKey={filterConfig.shop}
                            id="PO-tabs"
                            className="manager-tabs"
                            onSelect={handleTabSelect}
                        >
                            <Tab eventKey="mango_magic" title="Mango Magic">
                                <div className="my-2 px-4 PO-filters d-flex">
                                    <span className="me-4 align-middle mt-2">
                                        Filter By:
                                    </span>
                                    <Form.Select
                                        name="item_type"
                                        value={filterConfig.item_type}
                                        className="date-filter me-3"
                                        onChange={(e) => handleFilterChange(e)}
                                    >
                                        {classificationOptions.map(
                                            (classification) => {
                                                return (
                                                    <option
                                                        value={
                                                            classification.value
                                                        }
                                                    >
                                                        {classification.label}
                                                    </option>
                                                );
                                            }
                                        )}
                                    </Form.Select>

                                    <Form.Select
                                        name="with_po"
                                        className="date-filter me-2"
                                        defaultValue={filterConfig.with_po}
                                        onChange={(e) => handleFilterChange(e)}
                                    >
                                        <option value="" selected>
                                            All POs
                                        </option>
                                        <option value="1">With PO</option>
                                        <option value="0">No PO</option>
                                    </Form.Select>
                                </div>
                                <Table
                                    tableHeaders={[
                                        "ITEM",
                                        "CUR QTY",
                                        "UNIT",
                                        "PO",
                                        "MIN",
                                        "MAX",
                                    ]}
                                    headerSelector={[
                                        "item_name",
                                        "current_qty",
                                        "inventory_unit_name",
                                        "__ongoing_po_badges__",
                                        "min",
                                        "max",
                                    ]}
                                    tableData={itemList}
                                    ActionBtn={(row) =>
                                        ActionBtn(row, "mango_magic")
                                    }
                                    OngoingPOBadges={(row) =>
                                        OngoingPOBadges(row, "mango")
                                    }
                                    showLoader={showLoader}
                                    tableType="lowOnStock"
                                    handleOnCheck={(row) => handleOnCheck(row)}
                                />
                            </Tab>
                            <Tab eventKey="potato_corner" title="potato corner">
                                <div className="my-2 px-4 PO-filters d-flex">
                                    <span className="me-4 align-middle mt-2">
                                        Filter By:
                                    </span>
                                    <Form.Select
                                        name="item_type"
                                        value={filterConfig.item_type}
                                        className="date-filter me-3"
                                        onChange={(e) => handleFilterChange(e)}
                                    >
                                        {classificationOptions.map(
                                            (classification) => {
                                                return (
                                                    <option
                                                        value={
                                                            classification.value
                                                        }
                                                    >
                                                        {classification.label}
                                                    </option>
                                                );
                                            }
                                        )}
                                    </Form.Select>

                                    <Form.Select
                                        name="with_po"
                                        className="date-filter me-2"
                                        defaultValue={filterConfig.with_po}
                                        onChange={(e) => handleFilterChange(e)}
                                    >
                                        <option value="" selected>
                                            All POs
                                        </option>
                                        <option value="1">With PO</option>
                                        <option value="0">No PO</option>
                                    </Form.Select>
                                </div>
                                <Table
                                    tableHeaders={[
                                        "ITEM",
                                        "CUR QTY",
                                        "UNIT",
                                        "PO",
                                        "MIN",
                                        "MAX",
                                    ]}
                                    headerSelector={[
                                        "item_name",
                                        "current_qty",
                                        "inventory_unit_name",
                                        "__ongoing_po_badges__",
                                        "min",
                                        "max",
                                    ]}
                                    tableData={itemListPotato}
                                    ActionBtn={(row) =>
                                        ActionBtn(row, "potato_corner")
                                    }
                                    OngoingPOBadges={(row) =>
                                        OngoingPOBadges(row, "potato")
                                    }
                                    showLoader={showLoader}
                                    tableType="lowOnStock"
                                    handleOnCheck={(row) => handleOnCheck(row)}
                                />
                            </Tab>
                        </Tabs>
                    )}
                    {parseInt(filterConfig.branch_id) >= 2 
                    // && filterConfig.branch_id <= "5" 
                    && (
                            <Tabs
                                activeKey={filterConfig.shop}
                                defaultActiveKey={filterConfig.shop}
                                id="PO-tabs"
                                className="manager-tabs"
                                onSelect={handleTabSelect}
                            >
                                <Tab eventKey="mango_magic" title="Mango Magic">
                                    <Table
                                        tableHeaders={[

                                            "ITEM",
                                            "CUR QTY",
                                            "UNIT",
                                            "MIN",
                                            "MAX",
                                        ]}
                                        headerSelector={[

                                            "item_name",
                                            "current_qty",
                                            "inventory_unit_name",
                                            "min",
                                            "max",
                                        ]}
                                        tableData={itemList}

                                        ActionBtn={(row) =>
                                            ActionBtn(row, "mango_magic")
                                        }
                                        showLoader={showLoader}
                                        tableType="lowOnStock"
                                        handleOnCheck={(row) =>
                                            handleOnCheck(row)
                                        }
                                    />
                                </Tab>
                            </Tabs>
                        )}
                    <div className="mb-2" />
                </div>
            </div>
            <Delete
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                text="Item List"
            />
            <EditModal
                title="ITEM"
                type="item"
                show={showEditItemModal}
                onHide={handleCloseEditItemModal}
            >
                <div className=" mt-3 edit-form">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            ITEM NAME
                            <span className="required"> * </span>
                            <Form.Control
                                type="text"
                                name="item_name"
                                defaultValue={itemDetail.name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            ITEM CLASSIFICATION
                            <span className="required"> * </span>
                            <select
                                name="type"
                                defaultValue={itemDetail.type}
                                className="ms-0 nc-modal-custom-select nc-modal-custom-input-edit "
                                onChange={(e) => handleEditChange(e)}
                            >
                                {classificationOptions.map((classification) => {
                                    return (
                                        <option
                                            selected={
                                                itemDetail.type ===
                                                classification.value
                                            }
                                            value={classification.value}
                                        >
                                            {classification.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </Col>
                        <Col>
                            ITEM DETAIL
                            <Form.Control
                                type="text"
                                name="detail"
                                defaultValue={itemDetail.detail}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row mb-0">
                        <Col>UNIT OF MEASURE CONVERSION</Col>
                    </Row>
                    <Row>
                        <div className="edit-purchased-items justify-content-center">
                            <div className="not-found mt-0 ">
                               
                            </div>
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => AddItemEdit()}>
                            Add
                        </Button>
                    </Row>
                </div>
            </EditModal>
        </div>
    );
}
