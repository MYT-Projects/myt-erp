import React, { useState, useEffect, useRef } from "react";
import { Col, Form, Row, Tab, Tabs, Button, ButtonGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter, getType } from "../../Helpers/Utils/Common";
import {
    getAllItemList,
    getItemHistory,
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
import Table from "../../Components/TableTemplate/Table";
import Delete from "../../Components/Modals/DeleteModal";
import EditModal from "../../Components/Modals/EditModal";

//css
import "./Inventory.css";
import "../../Components/Navbar/Navbar.css";
import { getAllBranches } from "../../Helpers/apiCalls/Manage/Branches";
import { getAllBranchesPotato } from "../../Helpers/apiCalls/PotatoCorner/Manage/Branches";
import { getItem } from "../../Helpers/apiCalls/itemsApi";
import { getItemPotato } from "../../Helpers/apiCalls/PotatoCorner/Inventory/ItemApi";
import InputError from "../../Components/InputError/InputError";

export default function ItemLists() {
    let navigate = useNavigate();
    const [userType, setUserType] = useState(getType());
    const [inactive, setInactive] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [filterData, setFilterData] = useState([]);
    const [filterDataPotato, setFilterDataPotato] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [classificationOptions, setClassificationOptions] = useState([]);
    const [itemListPotato, setItemListPotato] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState("1");
    const [selectedAction, setSelectedAction] = useState("");
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [itemDetail, setItemDetail] = useState({});
    const [fetching, setFetching] = useState(false);

    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => refreshPage();
    const handleShowEditItemModal = () => setShowEditItemModal(true);
    const handleCloseEditItemModal = () => {
        setShowEditItemModal(false);
        setItemDetail({});
        setSelectedAction("");
    };

    const [filterConfig, setFilterConfig] = useState({
        branch_id: "1",
        name: "",
        item_type: "ingredient",
        shop: "mango_magic",
    });

    const isInitialMount = useRef(true);
    const filterConfigKey = 'inventory-itemlists-filterConfig';
    useEffect(()=>{
        if(isInitialMount.current){
            isInitialMount.current = false;
            setFilterConfig((prev) => {
                if (window.localStorage.getItem(filterConfigKey) != null){
                    handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).shop);
                    return JSON.parse(window.localStorage.getItem(filterConfigKey))
                } else {
                    return {...prev}
                }
            });
        } else {
            window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
        }
    }, [filterConfig])

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
    function handleItemChangeEdit(e, id) {
        const { name, value } = e.target;
        var newItemsUnitsMap = itemsUnitsMap;
        if (name === "breakdown_unit") {
            var newBreakdownUnit = newItemsUnitsMap.map((item, index) => {
                if (index === id) {
                    item.breakdown_unit = value;
                }
                return item;
            });
            setItemsUnitsMap(newBreakdownUnit);
        } else if (name === "breakdown_value") {
            var newBreakdownValue = newItemsUnitsMap.map((item, index) => {
                if (index === id) {
                    item.breakdown_value = value;
                }
                return item;
            });
            setItemsUnitsMap(newBreakdownValue);
        } else if (name === "inventory_unit") {
            var newInventoryUnit = newItemsUnitsMap.map((item, index) => {
                if (index === id) {
                    item.inventory_unit = value;
                }
                return item;
            });
            setItemsUnitsMap(newInventoryUnit);
        } else if (name === "inventory_value") {
            var newInventoryValue = newItemsUnitsMap.map((item, index) => {
                if (index === id) {
                    item.inventory_value = value;
                }
                return item;
            });
            setItemsUnitsMap(newInventoryValue);
        } else if (name === "minimum") {
            var newMinimum = newItemsUnitsMap.map((item, index) => {
                if (index === id) {
                    item.minimum = value;
                }
                return item;
            });
            setItemsUnitsMap(newMinimum);
        } else if (name === "maximum") {
            var newMaximum = newItemsUnitsMap.map((item, index) => {
                if (index === id) {
                    item.maximum = value;
                }
                return item;
            });
            setItemsUnitsMap(newMaximum);
        } else if (name === "acceptable_variance") {
            var newAcceptableVatriance = newItemsUnitsMap.map((item, index) => {
                if (index === id) {
                    item.acceptable_variance = value;
                }
                return item;
            });
            setItemsUnitsMap(newAcceptableVatriance);
        }
    }
    function handleItemChange(e, id) {
        const { name, value } = e.target;
        var newItemsUnits = itemsUnits;
        if (name === "breakdown_unit") {
            var newBreakdownUnit = newItemsUnits.map((item, index) => {
                if (index === id) {
                    item.breakdown_unit = value;
                }
                return item;
            });
            setItemsUnits(newBreakdownUnit);
        } else if (name === "breakdown_value") {
            var newBreakdownValue = newItemsUnits.map((item, index) => {
                if (index === id) {
                    item.breakdown_value = value;
                }
                return item;
            });
            setItemsUnits(newBreakdownValue);
        } else if (name === "inventory_unit") {
            var newInventoryUnit = newItemsUnits.map((item, index) => {
                if (index === id) {
                    item.inventory_unit = value;
                }
                return item;
            });
            setItemsUnits(newInventoryUnit);
        } else if (name === "inventory_value") {
            var newInventoryValue = newItemsUnits.map((item, index) => {
                if (index === id) {
                    item.inventory_value = value;
                }
                return item;
            });
            setItemsUnits(newInventoryValue);
        } else if (name === "minimum") {
            var newMinimum = newItemsUnits.map((item, index) => {
                if (index === id) {
                    item.minimum = value;
                }
                return item;
            });
            setItemsUnits(newMinimum);
        } else if (name === "maximum") {
            var newMaximum = newItemsUnits.map((item, index) => {
                if (index === id) {
                    item.maximum = value;
                }
                return item;
            });
            setItemsUnits(newMaximum);
        } else if (name === "acceptable_variance") {
            var newAcceptableVatriance = newItemsUnits.map((item, index) => {
                if (index === id) {
                    item.acceptable_variance = value;
                }
                return item;
            });
            setItemsUnits(newAcceptableVatriance);
        }

    }
    function handleRemoveItem(id, type) {
        if (type === "add") {
            const rowId = id;
            const newItemList = [...itemsUnits];
            newItemList.splice(rowId, 1);
            setItemsUnits(newItemList);
        } else if (type === "edit") {
            const rowId = id;
            const newItemList = [...itemsUnitsMap];
            newItemList.splice(rowId, 1);
            setItemsUnitsMap(newItemList);
        }
    }
    function editTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>
                            Breakdown Unit<span className="required">*</span>
                        </th>
                        <th> = </th>
                        <th>
                            Inventory Unit<span className="required">*</span>
                        </th>
                        <th>
                            Min Level<span className="required">*</span>
                        </th>
                        <th>
                            Max Level<span className="required">*</span>
                        </th>
                        <th>
                            Acceptable Variance
                            <span className="required">*</span>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsUnitsMap.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td className="row align-contents">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="breakdown_value"
                                            className="nc-modal-custom-input"
                                            defaultValue={data?.breakdown_value}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                        />
                                        <select
                                            name="breakdown_unit"
                                            className="nc-modal-custom-select-table nc-modal-custom-input-edit mt-3"
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            defaultValue={data?.breakdown_unit}
                                            required
                                        >
                                            <option value="" selected hidden>
                                                Select
                                            </option>
                                            <option value="pc">pc</option>
                                            <option value="gram">gram</option>
                                            <option value="ml">ml</option>
                                        </select>
                                    </Col>
                                </td>
                                <td>
                                    <img
                                        src={equal}
                                        className="cursor-pointer"
                                        alt="equal to"
                                    />
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="inventory_value"
                                            className="nc-modal-custom-input"
                                            defaultValue={data?.inventory_value}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                        />
                                        <select
                                            name="inventory_unit"
                                            className="nc-modal-custom-select-table nc-modal-custom-input-edit mt-3"
                                            defaultValue={data?.inventory_unit}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            required
                                        >
                                            <option value="" selected hidden>
                                                Select
                                            </option>
                                            <option value="PC">PC</option>
                                            <option value="TUB">TUB</option>
                                            <option value="PACK">PACK</option>
                                            <option value="BUNDLE">
                                                BUNDLE
                                            </option>
                                            <option value="BAG">BAG</option>
                                            <option value="ROLL">ROLL</option>
                                            <option value="JUG">JUG</option>
                                            <option value="KILO">KILO</option>
                                        </select>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="minimum"
                                            defaultValue={data?.min}
                                            className="nc-modal-custom-input "
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            required
                                        />

                                        <span className="span">
                                            {data?.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="maximum"
                                            defaultValue={data?.max}
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            required
                                        />
                                        <span className="span">
                                            {data?.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="acceptable_variance"
                                            defaultValue={
                                                data?.acceptable_variance
                                            }
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            required
                                        />
                                        <span className="span">
                                            {data?.breakdown_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        onClick={() =>
                                            handleRemoveItem(index, "edit")
                                        }
                                        className="cursor-pointer"
                                        alt="delete"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    function ViewPayment(row) {
        return (
            <button
                type="button"
                className="button-primary view-btn me-3"
                onClick={() => handleViewPayment(row.id, row.api_link)}
            >
                Adjust
            </button>
        );
    }

    function handleViewPayment(id, type) {
        window.open(
            "/itemlists/branch-adjustment/" + id + "/" + type, "_blank"
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

    function OngoingPOBadges(row, type) {
        return (
            <ButtonGroup vertical>
            <>
                {row.ongoing_po?.map((po) => {
                    return (
                        <Button
                            className=""
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
                <option value="details-po" className="color-options">
                    Item Details
                </option>
            </Form.Select>
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
            window.open(
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
                , "_blank"
            );
        } else if (e.target.value === "details-po") {
            navigate(
                "/itemlists/itemdetails/" + row.item_id + "/" + type
            );
        }

        setSelectedAction("");
    }

    React.useEffect(() => {
        getItemDetails(selectedItem);
    }, [selectedItem]);

    const [branches, setBranches] = useState([]);


    const [branch, setBranch] = useState({});
    const [branchOptions, setBranchOptions] = useState([]);

    useEffect(()=>{
        // console.log(franchisees)
        console.log(branches);
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
            if(_branch.id === filterConfig.branch_id){
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
        setBranch(currentBranch);
        console.log(branchOptions);
    },[branches])

    function handleBranchChange(e){
        console.log(e)
        setBranch(e);
        const toFilter = {target: {name: "branch_id", value: e.value}};
        handleFilterChange(toFilter);
    }


    async function fetchAllBranches() {
        setShowLoader(true);
        if(filterConfig.shop === "mango_magic") {
            const response = await getAllBranches();
    
            if (response.data) {
                var all = response.data.data.data.filter((data) => {
                    return data.is_franchise === "3"
                });
                setBranches(all);
            }
        } else if(filterConfig.shop === "potato_corner") {
            const response = await getAllBranchesPotato();
    
            if (response.data) {
                var all = response.data.data.data.filter((data) => {
                    return data.is_franchise === "3"
                });
                setBranches(all);
            }
        }
        setShowLoader(false);
    }

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
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

    React.useEffect(() => {
        fetchFilteredItemLists();
    }, [filterConfig]);

    async function fetchFilteredItemLists() {
        setShowLoader(true);
        if (filterConfig.shop === "mango_magic") {
            const mangoRes = await searchInventory(filterConfig);
            if (mangoRes.data) {
                var mangoItems = [];
                mangoRes.data.data.map(async (PO) => {
                    var info = PO;
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
                    info.inventory_unit_name = PO.inventory_unit_name;
                    info.critical_level = "1";
                    info.action = "";
                    info.api_link = "mango_magic";
                    info.item_type = capitalizeFirstLetter(
                        PO.item_type.replace("_", " ")
                    );
                    mangoItems.push(info);
                });
                setItemList(mangoItems);

                var classification = mangoRes.data.item_classifications.map((data) => {
                    var info = {}
                    var name = data.split("_")
                    info.name = name.length < 2 ? data : name[0] + " " + name[1];
                    info.value = data;

                    return info;
                })
                setClassificationOptions(classification)

            } else {
                setItemList([]);
            }
        } else if (filterConfig.shop === "potato_corner") {
            const potatoRes = await searchInventoryPotato(filterConfig);

            if (potatoRes.data) {
                var potatoItems = [];
                potatoRes.data.data.map(async (PO) => {
                    var info = PO;
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
                    info.action = "";
                    info.inventory_unit_name = PO.inventory_unit_name;
                    info.api_link = "potato_corner";
                    info.item_type = capitalizeFirstLetter(
                        PO.item_type.replace("_", " ")
                    );
                    potatoItems.push(info);
                });
                setItemListPotato(potatoItems);

                var classification = potatoRes.data.item_classifications.map((data) => {
                    var info = {}
                    info.name = data;
                    info.value = data;

                    return info;
                })
                setClassificationOptions(classification)

            } else {
                setItemListPotato([]);
            }
        }
        setShowLoader(false);
    }

    const handleTabSelect = (key) => {
        setFilterConfig((prev) => {
            return { ...prev, shop: key };
            // return { ...prev, shop: key, branch_id: "1" };
        });
    };

    React.useEffect(() => {
        fetchAllBranches();
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
                        <h1 className="page-title"> ITEMS LIST </h1>
                    </div>
                    {/* input search button */}
                    <div className="col-sm-6 d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
                            className="search-bar"
                            placeholder="Search item name"
                            value={filterConfig.name}
                            onChange={(e) => handleFilterChange(e)}
                        ></input>
                    </div>
                </div>
                <div className="row mb-4 my-2 PO-filters d-flex filter">
                    <Col xs={20}>
                        <Select
                            className="dropsearch-filter px-2 py-0 me-2 "
                            classNamePrefix="react-select"
                            value={branch}
                            options={branchOptions}
                            onChange={handleBranchChange}
                        />
                    </Col>
                    {/* <Col xs={3}>
                        <Form.Select
                            name="branch_id"
                            className="warehouse me-3"
                            value={filterConfig.branch_id}
                            onChange={(e) => handleFilterChange(e)}
                        >
                            {branches?.map((branch) => {
                                return (
                                    <option
                                        value={branch.id}
                                        disabled={
                                            userType === "commissary_officer" &&
                                            (branch.id === "1" ||
                                                branch.id === "5")
                                        }
                                    >
                                        {branch.name}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    </Col> */}
                </div>
                <div>
                    {/* table */}
                    {selectedBranch === "1" && (
                        <Tabs
                            activeKey={filterConfig.shop}
                            // defaultActiveKey={filterConfig.shop}
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
                                        <option
                                            value=""
                                            selected
                                        >
                                            All Classification
                                        </option>
                                        {classificationOptions.length > 0 ? (
                                            classificationOptions.map((classification) => {
                                                return (
                                                    <option
                                                        value={classification.value}
                                                    >
                                                        {classification.name}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option value="" disabled>
                                                (No classification found)
                                            </option>
                                        )}
                                    </Form.Select>
                                </div>
                                <Table
                                    tableHeaders={[
                                        "-",
                                        "ITEM",
                                        "CUR QTY",
                                        "UNIT",
                                        "PO",
                                        "MIN",
                                        "MAX",
                                        "CLASSIFICATION",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        "item_name",
                                        "current_qty",
                                        "inventory_unit_name",
                                        "__ongoing_po_badges__",
                                        "min",
                                        "max",
                                        "item_type",
                                    ]}
                                    tableData={itemList}
                                    ViewBtn={(row) => ViewPayment(row)}
                                    ActionBtn={(row) =>
                                        ActionBtn(row, "mango_magic")
                                    }
                                    OngoingPOBadges={(row) =>
                                        OngoingPOBadges(row, "mango")
                                    }
                                    showLoader={showLoader}
                                    tableType="itemList"
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
                                        <option
                                            value=""
                                            selected
                                        >
                                            All Classification
                                        </option>
                                        {classificationOptions.length > 0 ? (
                                            classificationOptions.map((classification) => {
                                                return (
                                                    <option
                                                        value={classification.value}
                                                    >
                                                        {classification.name}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option value="" disabled>
                                                (No classification found)
                                            </option>
                                        )}
                                    </Form.Select>
                                </div>
                                <Table
                                    tableHeaders={[
                                        "-",
                                        "ITEM",
                                        "CUR QTY",
                                        "UNIT",
                                        "PO",
                                        "MIN",
                                        "MAX",
                                        "CLASSIFICATION",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        "item_name",
                                        "current_qty",
                                        "inventory_unit_name",
                                        "",
                                        "min",
                                        "max",
                                        "item_type",
                                    ]}
                                    tableData={itemListPotato}
                                    ViewBtn={(row) => ViewPayment(row)}
                                    ActionBtn={(row) =>
                                        ActionBtn(row, "potato_corner")
                                    }
                                    showLoader={showLoader}
                                    tableType="itemList"
                                />
                            </Tab>
                        </Tabs>
                    )}
                    {selectedBranch >= "2" && selectedBranch <= "5" && (
                        <Tabs
                            defaultActiveKey="mango_magic"
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
                                        <option
                                            value=""
                                            hidden
                                            selected
                                            className="text-uppercase"
                                        >
                                            All Classification
                                        </option>
                                        <option value="ingredient">
                                            Ingredient
                                        </option>
                                        <option value="supplies">
                                            Supplies
                                        </option>
                                        <option value="cleaning_supplies">
                                            Cleaning Supplies
                                        </option>
                                        <option value="office_supplies">
                                            Office Supplies
                                        </option>
                                        <option value="equipment">
                                            Equipment
                                        </option>
                                        <option value="uniform">Uniform</option>
                                        <option value="beverage">
                                            Beverage
                                        </option>
                                        <option value="raw_material">
                                            Raw Material
                                        </option>
                                        <option value="store_supplies">
                                            Store Supplies
                                        </option>
                                        <option value="commissary_supplies">
                                            Commissary Supplies
                                        </option>
                                        <option value="commissary_equipment">
                                            Commissary Equipment
                                        </option>
                                        <option value="store_equipment">
                                            Store Equipment
                                        </option>
                                        <option value="carpentry">
                                            Carpentry
                                        </option>
                                        <option value="electrical">
                                            Electrical
                                        </option>
                                        <option value="painting">
                                            Painting
                                        </option>
                                    </Form.Select>
                                </div>
                                <Table
                                    tableHeaders={[
                                        "-",
                                        "ITEM",
                                        "CURRENT QTY",
                                        "UNIT",
                                        "PO",
                                        "MIN",
                                        "MAX",
                                        "CLASSIFICATION",
                                        "ACTIONS",
                                    ]}
                                    headerSelector={[
                                        "-",
                                        "item_name",
                                        "current_qty",
                                        "inventory_unit_name",
                                        "",
                                        "min",
                                        "max",
                                        "item_type",
                                    ]}
                                    tableData={itemList}
                                    ViewBtn={(row) => ViewPayment(row)}
                                    ActionBtn={(row) =>
                                        ActionBtn(row, "mango_magic")
                                    }
                                    showLoader={showLoader}
                                    tableType="itemList"
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
                                <option
                                    selected={itemDetail.type === "ingredient"}
                                    value="ingredient"
                                >
                                    Ingredient
                                </option>
                                <option
                                    selected={itemDetail.type === "supplies"}
                                    value="supplies"
                                >
                                    Supplies
                                </option>
                                <option
                                    selected={
                                        itemDetail.type === "cleaning_supplies"
                                    }
                                    value="cleaning_supplies"
                                >
                                    Cleaning Supplies
                                </option>
                                <option
                                    selected={
                                        itemDetail.type === "office_supplies"
                                    }
                                    value="office_supplies"
                                >
                                    Office Supplies
                                </option>
                                <option
                                    selected={
                                        itemDetail.type === "equipment" ||
                                        itemDetail.type === "store_equipment"
                                    }
                                    value="equipment"
                                >
                                    Equipment
                                </option>
                                <option
                                    selected={itemDetail.type === "uniform"}
                                    value="uniform"
                                >
                                    Uniform
                                </option>
                                <option
                                    selected={itemDetail.type === "beverage"}
                                    value="beverage"
                                >
                                    Beverage
                                </option>
                                <option
                                    selected={
                                        itemDetail.type === "finished_product"
                                    }
                                    value="finished_product"
                                >
                                    Finished Product
                                </option>
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
