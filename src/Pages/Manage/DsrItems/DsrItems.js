import React, { useEffect, useState, useRef } from "react";
import {
    Col,
    Container,
    Form,
    Row,
    Button,
    Table,
    Tab,
    Tabs,
    Dropdown,
    DropdownButton,
    ButtonGroup,
} from "react-bootstrap";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { formatDate, isAdmin, toastStyle, numberFormat} from "../../../Helpers/Utils/Common";

//components
import TableTemplate from "../../../Components/TableTemplate/DataTable";
import Navbar from "../../../Components/Navbar/Navbar";
import DeleteModal from "../../../Components/Modals/DeleteModal";
import AddModal from "../../../Components/Modals/AddModal";
import EditModal from "../../../Components/Modals/EditModal";
import ViewModal from "../../../Components/Modals/ViewModal";
import InputError from "../../../Components/InputError/InputError";

//css
import "./../Manage.css";
import "../../../Components/Navbar/Navbar.css";
import trash from "../../../Assets/Images/trash.png";
import equal from "../../../Assets/Images/equal.png";
import DsrModal from "./DsrModal";

//api
import { itemsMockData } from "../../../Helpers/mockData/mockData";
import {
    getAllItems,
    createItem,
    getItem,
    deleteItem,
    searchItem,
    editItem,
} from "../../../Helpers/apiCalls/itemsApi";
import {
    createItemPotato,
    deleteItemPotato,
    editItemPotato,
    getAllItemsPotato,
    getItemPotato,
    searchItemPotato,
} from "../../../Helpers/apiCalls/PotatoCorner/Manage/ItemsApi";
import {
    getAllItemPrices,
    getAllItemPricesPotato,
    getItemPrices,
    getItemPricesPotato,
    createItemPrice,
    createItemPricePotato,
    updateItemForSale,
    updateItemForSalePotato,
    updateDsr,
    updateDsrPotato,
    updateDsrStatus,
    updateDsrStatusPotato,
    searchItemPrice,
    searchItemPricePotato,
    searchFranchiseSaleItem,
    searchFranchiseSaleItemPotato,
    searchDsrItem,
    searchDsrItemPotato,
    deleteItemPrices,
    deleteItemPricesPotato,
    updateItemPrice,
    updateItemPricePotato,
} from "../../../Helpers/apiCalls/Manage/ItemPrice";
import { getUser, refreshPage } from "../../../Helpers/Utils/Common";
import { validateItems } from "../../../Helpers/Validation/Manage/ItemsValidation";
import ItemLists from "../../Inventory/ItemLists";

export default function DsrItems() {
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [showLoader, setShowLoader] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewItemModal, setShowViewItemModal] = useState(false);
    const handleShowViewItemModal = () => setShowViewItemModal(true);
    const handleCloseViewItemModal = () => {
        refreshPage()
        setShowViewItemModal(false)
    };

    // EDIT
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const handleShowEditItemModal = () => setShowEditItemModal(true);
    const handleCloseEditItemModal = () => {
        refreshPage()
        setShowEditItemModal(false)
    };

    // ADD
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const handleShowAddItemModal = () => setShowAddItemModal(true);
    const handleCloseAddItemModal = () => {
        refreshPage()
        setAddTo("")
        setShowAddItemModal(false);
    }

    /* Approve Modal */
    const [showApproveModal, setShowApproveModal] = useState(false);
    const handleShowApproveModal = () => setShowApproveModal(true);
    const handleCloseApproveModal = () => setShowApproveModal(false);

    //API
    const [itemsData, setItemsData] = useState([]);
    const [itemsDataMango, setItemsDataMango] = useState([]);
    const [itemsDataPotato, setItemsDataPotato] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [filterDataMango, setFilterDataMango] = useState([]);
    const [filterDataPotato, setFilterDataPotato] = useState([]);
    const [itemData, setItemData] = useState({
        is_for_sale: 1,
    });
    const [classificationOptions, setClassificationOptions] = useState([]);
    const [selectedRow, setSelectedRow] = useState({});
    const [itemSetData, setItemSetData] = useState({});
    const [selectedID, setSelectedID] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [itemDetails, setItemDetails] = useState({
        name: "",
        type: "",
        detail: "",
        added_by: getUser(),
        added_on: formatDate(),
    });

    const [saleItems, setSaleItems] = useState([]);
    const [saleItemsValue, setSaleItemsValue] = useState({
        name: "item_id",
        label: "",
        value: "",
    });

    const [filterConfig, setFilterConfig] = useState({
        tab: "mango_magic",
        is_dsr: "1"
    });

    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { 
                ...prev, 
                tab: tabKey,
                type: ""
             };
        });
    };

    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-dsrItems-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 // console.log("found");
    //                 // handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])

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

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        name: false,
        type: false,
        items: false,
        itemsUnitsNoInput: false,
    });

    const [isErrorEdit, setIsErrorEdit] = useState({
        name: false,
        type: false,
        items: false,
        itemsUnitsNoInput: false,
    });

    const handleAddChange = (e, type) => {
        if(type === "dropdown"){
            setSaleItemsValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
            setItemDetails((prevState) => ({
                ...prevState,
                ["item_id"]: e.value.split("|")[0],
                ["item_unit_id"]: e.value.split("|")[1],
                ["unit"]: e.value.split("|")[2],
                ["type"]: e.value.split("|")[3],
                ["name"]: e.value.split("|")[4],
            }));
        } else {
            const { name, value } = e.target;
            setItemDetails((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
        
    };

    //EDIT or UPDATE ITEM
    const handleEditChange = (e, type) => {
        if(type === "dropdown"){
            setSaleItemsValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
            setItemDetails((prevState) => ({
                ...prevState,
                ["item_id"]: e.value.split("|")[0],
                ["item_unit_id"]: e.value.split("|")[1],
                ["unit"]: e.value.split("|")[2],
                ["type"]: e.value.split("|")[3],
            }));
        } else {
            const { name, value } = e.target;
            setItemData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    //onEdit
    function handleOnEdit() {
        handleCloseViewItemModal();
        handleShowEditItemModal();
    }

    const [searchItemName, setSearchItemName] = useState("");

    // SEARCH USER
    // function handleOnSearch(e) {
    //     setSearchItemName(e.target.value);
    //     fetchAllItems(e.target.value);
    // }

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
    }

    // FETCH SALE ITEMS
    async function fetchAllSaleItems() {

        if (addTo === "MANGO MAGIC") {
            const response = await searchDsrItem(0, {name: "", type: ""});
            var saleItems = response.response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );
            var cleanedArray = saleItems.map((item) => {
                var info = {};
    
                info.name = "item_id";
                info.label = `${item.name} (${item.item_units[0]?.inventory_unit})`;
                info.value = `${item.id}|${item.id}|${item.item_units[0]?.inventory_unit}|${item.type}|${item.name}`;
                
                return info;
            });
            setSaleItems(cleanedArray);
        } else if (addTo === "POTATO CORNER") {
            const response = await searchDsrItemPotato(0, {name: "", type: ""});
            var saleItems = response.response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );
            var cleanedArray = saleItems.map((item) => {
                var info = {};

                info.name = "item_id";
                info.label = `${item.name} (${item.item_units[0]?.inventory_unit})`;
                info.value = `${item.id}|${item.id}|${item.item_units[0]?.inventory_unit}|${item.type}|${item.name}`;

                return info;
            });
            setSaleItems(cleanedArray);
        }
    }

    //API CALL
    async function fetchSearchItem(name) {
        setShowLoader(true);

         // //MANGO
         const response = await searchItemPrice(name);
         if (response.response) {
             var itemsList = response.response.data;
             response.response.data.map(
                 (data, key) => (itemsList[key].shopType = "mango")
             );
             response.response.data.map(
                 (data, key) => ( itemsList[key].price_1 = numberFormat(data.price_1) )
             );
             response.response.data.map(
                 (data, key) => ( itemsList[key].price_2 = numberFormat(data.price_2) )
             );
             response.response.data.map(
                 (data, key) => ( itemsList[key].price_3 = numberFormat(data.price_3) )
             );
             setItemsDataMango(itemsList);
             setFilterDataMango(itemsList);
         } else {
             setItemsDataMango([]);
         }
         //POTATO
         const response2 = await searchItemPricePotato(name);
         if (response2.response) {
            var itemsList = response2.data.data;
            response2.response.data.map(
                (data, key) => (itemsList[key].shopType = "potato")
            );
            response2.response.data.map(
                (data, key) => ( itemsList[key].price_1 = numberFormat(data.price_1) )
            );
            response2.response.data.map(
                (data, key) => ( itemsList[key].price_2 = numberFormat(data.price_2) )
            );
            response2.response.data.map(
                (data, key) => ( itemsList[key].price_3 = numberFormat(data.price_3) )
            );
            setItemsDataMango(itemsList);
            setFilterDataMango(itemsList);
        } else {
            setItemsDataPotato([]);
        }
        setShowLoader(false);
    }

    //DELETE or REMOVE ITEM
    function handleDeleteItem() {
        removeItem(selectedID, selectedRow);
    }

    function handleChangeDsrStatus() {
        changeDsrStatus(selectedID, selectedRow);
    }

    //DELETE ROW
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
    // ADD ROW
    function AddItem() {
        const newItem = {
            breakdown_value: "",
            breakdown_unit: "",
            inventory_value: "",
            inventory_unit: "",
            minimum: "",
            maximum: "",
            acceptable_variance: "",
        };
        setItemsUnits((prevItemsUnits) => [...prevItemsUnits, newItem]);
    }

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
    //HANDLE
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
    

    // DROPDOWN SELECT
    function handleSelectChange(e, row) {
        setItemsUnitsMap([]);
        setSelectedID(row.id);
        setSelectedStatus(row.status);
        setSelectedRow(row);
        if (e.target.value === "delete-item") {
            handleShowDeleteModal();
        } else if (e.target.value === "activate" || e.target.value === "deactivate") {
            handleShowApproveModal();
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
                {isAdmin && row.status === "Inactive" && (
                    <option value="activate" className="color-options">
                        Activate
                    </option>
                )}
                {isAdmin && row.status === "Active" && (
                    <option value="deactivate" className="color-options">
                        Deactivate
                    </option>
                )}
                {isAdmin && (
                    <option value="delete-item" className="color-red">
                        Delete
                    </option>
                )}
            </Form.Select>
        );
    }

    //API CALL
    async function fetchAllItems() {
        setShowLoader(true);
        console.log(filterConfig)
        //MANGO
        if(filterConfig.tab === "mango_magic") {
            const response = await searchDsrItem(1, filterConfig);
            if (response.response?.data) {
                var itemsList = response.response.data;
                response.response.data.map(
                    (data, key) => (itemsList[key].shopType = "mango")
                );
                response.response.data.map(
                    (data, key) => ( itemsList[key].status = data.is_active === "1" ? "Active" : "Inactive" )
                );
                setItemsDataMango(itemsList);
                setFilterDataMango(itemsList);
    
                var classifications = response.response.classifications.map((data) => {
                    var info = {}
                    var name = data.split("_")
                    info.name = name.length < 2 ? data : name[0] + " " + name[1];
                    info.value = data;
    
                    return info;
                })
                setClassificationOptions(classifications)
    
            } else {
                setItemsDataMango([]);
            }
        } else {
            //POTATO
            const response2 = await searchDsrItemPotato(1, filterConfig);
            if (response2.response?.data) {
                var itemsList2 = response2.response.data;
                response2.response.data.map(
                    (data, key) => (itemsList2[key].shopType = "potato")
                );
                response2.response.data.map(
                    (data, key) => ( itemsList2[key].status = data.is_active === "1" ? "Active" : "Inactive" )
                );

                setItemsDataPotato(itemsList2);
                setFilterDataPotato(itemsList2);

                var classifications = response2.response.classifications.map((data) => {
                    var info = {}
                    info.name = data;
                    info.value = data;

                    return info;
                })
                setClassificationOptions(classifications)
            } else {
                setItemsDataPotato([]);
            }
        }
        
        setShowLoader(false);
    }

    async function handleSaveItem() {
        if (addTo === "MANGO MAGIC") {
            setIsClicked(true);
            const response = await updateDsr(itemDetails.item_id, 1);
            if (response.response.status === "success") {
                setTimeout(() => {
                    toast.success("Successfully added DSR Item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                    setSaleItemsValue([])
                }, 3000);
            } else {
                toast.error("Error adding DSR Item!", {
                    style: toastStyle(),
                });
            }
        } else if (addTo === "POTATO CORNER") {
            setIsClicked(true);
            const response = await updateDsrPotato(itemDetails.item_id, 1);
            if (response.response.status === "success") {
                setTimeout(() => {
                    toast.success("Successfully added DSR Item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                    setSaleItemsValue([])
                }, 3000);
            } else {
                toast.error("Error adding DSR Item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function handleEditItem() {
        if (itemData.shopType === "mango") {
            setIsClicked(true);
            const response = await updateItemPrice(itemData, selectedRow.id);
            if (response.data) {
                setTimeout(() => {
                    toast.success("Successfully updated item price!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                }, 3000);
            } else {
                toast.error("Error adding item price!", {
                    style: toastStyle(),
                });
            }
        } else if (itemData.shopType === "potato") {
            setIsClicked(true);
            const response = await updateItemPricePotato(itemData);
            if (response.data) {
                setTimeout(() => {
                    toast.success("Successfully updated item price!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                }, 3000);
            } else {
                toast.error("Error creating new item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function removeItem(id, row) {
        if (selectedRow.shopType === "mango") {
            setIsClicked(true);
            const response = await updateDsr(selectedID, 0);
            if (response.response.status === "success") {
                setTimeout(() => {
                    toast.success("Successfully deleted DSR Item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                    setSaleItemsValue([])
                }, 3000);
            } else {
                toast.error("Error deleting DSR Item!", {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.shopType === "potato") {
            setIsClicked(true);
            const response = await updateDsr(selectedID, 0);
            if (response.response.status === "success") {
                setTimeout(() => {
                    toast.success("Successfully deleted DSR Item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                    setSaleItemsValue([])
                }, 3000);
            } else {
                toast.error("Error deleting DSR Item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function changeDsrStatus(id, row) {
        var value = row.is_active === "1" ? 0 : 1
        if (selectedRow.shopType === "mango") {
            setIsClicked(true);
            const response = await updateDsrStatus(selectedID, value);
            if (response.response.status === "success") {
                setTimeout(() => {
                    toast.success("Successfully deleted DSR Item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                    setSaleItemsValue([])
                }, 3000);
            } else {
                toast.error("Error deleting DSR Item!", {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.shopType === "potato") {
            setIsClicked(true);
            const response = await updateDsrStatusPotato(selectedID, value);
            if (response.response.status === "success") {
                setTimeout(() => {
                    toast.success("Successfully deleted DSR Item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    refreshPage();
                    setSaleItemsValue([])
                }, 3000);
            } else {
                toast.error("Error deleting DSR Item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    React.useEffect(() => {
        fetchAllItems();
    }, [filterConfig]);

    React.useEffect(() => {
        return () => {
            setItemData({});
            setItemsUnitsMap([]);
            setItemsDataMango([]);
            setFilterDataMango([]);
            setItemsDataPotato([]);
            setFilterDataPotato([]);
        };
    }, []);

    React.useEffect(() => {
        fetchAllSaleItems();
        return () => {
            setItemData({});
            setItemsUnitsMap([]);
            setItemsDataMango([]);
            setFilterDataMango([]);
            setItemsDataPotato([]);
            setFilterDataPotato([]);
        };
    }, [addTo]);

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
                <Row>
                    <Col>
                        <h1 className="page-title"> DAILY SALES REPORT ITEMS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="search"
                            name="name"
                            placeholder="Search Item Name..."
                            value={filterConfig.name}
                            onChange={(e) => handleFilterChange(e)}
                            className="search-bar"
                        />
                        <DropdownButton
                            as={ButtonGroup}
                            title="Add"
                            id="bg-nested-dropdown"
                            className="add-btn"
                            onSelect={handleAddSelect}
                        >
                            <Dropdown.Item
                                eventKey="MANGO MAGIC"
                                onClick={handleShowAddItemModal}
                            >
                                To Mango Magic
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="POTATO CORNER"
                                onClick={handleShowAddItemModal}
                            >
                                To Potato Corner
                            </Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>

                <Tabs
                    activeKey={filterConfig.tab}
                    defaultActiveKey={filterConfig.tab}
                    id="PO-tabs"
                    className="manager-tabs"
                    onSelect={handleTabSelect}
                >
                    <Tab eventKey="mango_magic" title="Mango Magic">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="type"
                                className="date-filter form-select-custom ms-3 "
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option
                                    value=""
                                    selected
                                    className="text-uppercase"
                                >
                                    Classification
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

                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "ITEM NAME",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "name", 
                                "status",
                            ]}
                            tableData={itemsDataMango}
                            ActionBtn={(row) => ActionBtn(row)}
                            showLoader={showLoader}
                        />

                        <div className="mb-2" />
                    </Tab>
                    <Tab eventKey="potato_corner" title="potato corner">
                        {/* filters */}
                        <div className="my-2 px-4 PO-filters d-flex">
                            <span className="me-4 align-middle mt-2">
                                Filter By:
                            </span>
                            <Form.Select
                                name="type"
                                className="date-filter form-select-custom ms-3 "
                                onChange={(e) => handleFilterChange(e)}
                            >
                                <option
                                    value=""
                                    selected
                                    className="text-uppercase"
                                >
                                    Classification
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

                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "ITEM NAME",
                                "STATUS",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "name", 
                                "status",
                            ]}
                            tableData={itemsDataPotato}
                            ActionBtn={(row) => ActionBtn(row)}
                            showLoader={showLoader}
                        />

                        <div className="mb-2" />
                    </Tab>
                </Tabs>
            </div>

            {/* MODALS */}
            <DeleteModal
                text="item"
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onDelete={handleDeleteItem}
            />
            <AddModal
                title={`ITEM PRICE TO ${addTo}`}
                type="item"
                show={showAddItemModal}
                onHide={handleCloseAddItemModal}
                onSave={handleSaveItem}
                isClicked={isClicked}
            >
                <div className=" mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            ITEM NAME
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select item..."
                                value={saleItemsValue}
                                options={saleItems}
                                onChange={(e) => handleAddChange(e, "dropdown")}
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title="ITEM PRICES"
                type="item"
                show={showEditItemModal}
                onHide={handleCloseEditItemModal}
                onSave={handleEditItem}
            >
                <div className=" mt-3">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            ITEM NAME
                            <Form.Control
                                type="text"
                                name="item_name"
                                defaultValue={itemData.item_name}
                                className="nc-modal-custom-input"
                                disabled
                            />
                        </Col>
                        <Col>
                            ITEM UNIT
                            <Form.Control
                                type="text"
                                name="item_unit"
                                defaultValue={itemData.unit}
                                className="nc-modal-custom-input"
                                disabled
                            />
                        </Col>
                        <Col>
                            PRICE 1
                            <Form.Control
                                type="number"
                                name="price_1"
                                defaultValue={itemData.price_1}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            PRICE 2
                            <Form.Control
                                type="number"
                                name="price_2"
                                defaultValue={itemData.price_2}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            PRICE 3
                            <Form.Control
                                type="number"
                                name="price_3"
                                defaultValue={itemData.price_3}
                                className="nc-modal-custom-input"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <DsrModal
                show={showApproveModal}
                hide={handleCloseApproveModal}
                type={selectedStatus}
                handler={handleChangeDsrStatus}
            />
        </div>
    );
}
