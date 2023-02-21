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
    searchItemPrice,
    searchItemPricePotato,
    searchFranchiseSaleItem,
    searchFranchiseSaleItemPotato,
    deleteItemPrices,
    deleteItemPricesPotato,
    updateItemPrice,
    updateItemPricePotato,
} from "../../../Helpers/apiCalls/Manage/ItemPrice";
import { getUser, refreshPage } from "../../../Helpers/Utils/Common";
import { validateItems } from "../../../Helpers/Validation/Manage/ItemsValidation";
import ItemLists from "../../Inventory/ItemLists";

export default function ItemPrices() {
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [showLoader, setShowLoader] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    const [filterConfig, setFilterConfig] = useState({
        tab: "mango_magic",

    });
    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };
    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-itemPrices-filterConfig';
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
    const [selectedRow, setSelectedRow] = useState({});
    const [itemSetData, setItemSetData] = useState({});
    const [selectedID, setSelectedID] = useState("");
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

    //onChange
    function handleOnChange(e) {
        const { name, value } = e.target;
        if (name === "type") {
            switch (value) {
                case "ingredient":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "ingredient"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "ingredient"
                        )
                    );
                case "supplies":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "supplies"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "supplies"
                        )
                    );
                case "cleaning_supplies":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "cleaning_supplies"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "cleaning_supplies"
                        )
                    );
                case "office_supplies":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "office_supplies"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "office_supplies"
                        )
                    );
                case "equipment":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "equipment"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "equipment"
                        )
                    );
                case "uniform":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "uniform"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "uniform"
                        )
                    );
                case "beverage":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "beverage"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "beverage"
                        )
                    );
                case "finished_product":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "finished_product"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "finished_product"
                        )
                    );
                case "all":
                    setItemsDataPotato(filterDataPotato);
                    return setItemsDataMango(filterDataMango);
                default:
                    return setItemsDataMango([]);
            }
        } else {
            setItemsDataPotato(fetchAllItems());
            return setItemsDataMango(fetchAllItems());
        }
    }

    const [searchItemName, setSearchItemName] = useState("");

    // SEARCH USER
    function handleOnSearch(e) {
        setSearchItemName(e.target.value);
        fetchSearchItem(e.target.value);
    }

    // FETCH SALE ITEMS
    async function fetchAllSaleItems() {

        if (addTo === "MANGO MAGIC") {
            const response = await searchFranchiseSaleItem();
            var saleItems = response.response.data.sort((a, b) =>
                a.name > b.name 
                    ? 1 
                    : b.name > a.name 
                    ? -1 
                    : 0
            );
            var cleanedArray = saleItems.map((item) => {
                var info = {};
    
                info.name = "item_id";
                info.label = `${item.name} (${item.item_units[0]?.inventory_unit})`;
                info.value = `${item.id}|${item.item_units[0].id}|${item.item_units[0]?.inventory_unit}|${item.type}|${item.name}`;
                
                return info;
            });
            setSaleItems(cleanedArray);
        } else if (addTo === "POTATO CORNER") {
            const response = await searchFranchiseSaleItemPotato();
            var saleItems = response.response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );
            var cleanedArray = saleItems.map((item) => {
                console.log(item)
                var info = {};

                info.name = "item_id";
                info.label = `${item.name} (${item.item_units[0]?.inventory_unit})`;
                info.value = `${item.id}|${item.item_units[0]?.id}|${item.item_units[0]?.inventory_unit}|${item.type}|${item.name}`;

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
            setItemsDataPotato(itemsList);
            setFilterDataPotato(itemsList);
        } else {
            setItemsDataPotato([]);
        }
        setShowLoader(false);
    }

    //DELETE or REMOVE ITEM
    function handleDeleteItem() {
        removeItem(selectedID, selectedRow);
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

    function renderTable() {
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
                    {itemsUnits.map((item, index) => {
                        return (
                            <tr>
                                <td className="row align-contents">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="breakdown_value"
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
                                        <select
                                            name="breakdown_unit"
                                            className="nc-modal-custom-select-table nc-modal-custom-input-edit mt-3"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                            required
                                        >
                                            <option selected hidden>
                                                Select
                                            </option>
                                            <option value="pc">pc</option>
                                            <option value="gram">gram</option>
                                            <option value="ml">ml</option>
                                        </select>
                                        <InputError
                                            isValid={isError.breakdown_unit}
                                            message={"Item name is required"}
                                        />
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
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
                                        <select
                                            name="inventory_unit"
                                            className="nc-modal-custom-select-table nc-modal-custom-input-edit mt-3"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                            required
                                        >
                                            <option
                                                defaultValue
                                                selected
                                                hidden
                                            >
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
                                            className="nc-modal-custom-input "
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                            required
                                        />

                                        <span className="span">
                                            {item.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="maximum"
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                            required
                                        />
                                        <span className="span">
                                            {item.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="acceptable_variance"
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                            required
                                        />
                                        <span className="span">
                                            {item.breakdown_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        onClick={() =>
                                            handleRemoveItem(index, "add")
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
                    {itemsUnitsMap?.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td className="row align-contents">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="breakdown_value"
                                            className="nc-modal-custom-input"
                                            defaultValue={data.breakdown_value}
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
                                            defaultValue={data.breakdown_unit}
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
                                            defaultValue={data.inventory_value}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                        />
                                        <select
                                            name="inventory_unit"
                                            className="nc-modal-custom-select-table nc-modal-custom-input-edit mt-3"
                                            defaultValue={data.inventory_unit}
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
                                            defaultValue={data.min}
                                            className="nc-modal-custom-input "
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            required
                                        />

                                        <span className="span">
                                            {data.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="maximum"
                                            defaultValue={data.max}
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            required
                                        />
                                        <span className="span">
                                            {data.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="acceptable_variance"
                                            defaultValue={
                                                data.acceptable_variance
                                            }
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                            required
                                        />
                                        <span className="span">
                                            {data.breakdown_unit}
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

    function viewTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Breakdown Unit</th>
                        <th> = </th>
                        <th>Inventory Unit</th>
                        <th>Min Level</th>
                        <th>Max Level</th>
                        <th>Acceptable Variance</th>
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
                                            value={data.breakdown_value}
                                            disabled
                                        />
                                        <select
                                            name="breakdown_unit"
                                            className="nc-modal-custom-select-table mt-3 "
                                            defaultValue={data.breakdown_unit}
                                            disabled
                                        >
                                            <option value=""> </option>
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
                                            value={data.inventory_value}
                                            disabled
                                        />
                                        <select
                                            name="inventory_unit"
                                            className="nc-modal-custom-select-table mt-3"
                                            defaultValue={data.inventory_unit}
                                            disabled
                                        >
                                            <option value=""> </option>
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
                                            value={data.min}
                                            className="nc-modal-custom-input "
                                            disabled
                                        />

                                        <span className="span text-uppercase">
                                            {data.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="maximum"
                                            value={data.max}
                                            className="nc-modal-custom-input"
                                            disabled
                                        />
                                        <span className="span text-uppercase">
                                            {data.inventory_unit}
                                        </span>
                                    </Col>
                                </td>
                                <td className="">
                                    <Col className="align-middle">
                                        <Form.Control
                                            type="number"
                                            name="acceptable_variance"
                                            value={data.acceptable_variance}
                                            className="nc-modal-custom-input"
                                            disabled
                                        />
                                        <span className="span text-uppercase">
                                            {data.breakdown_unit}
                                        </span>
                                    </Col>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    // DROPDOWN SELECT
    function handleSelectChange(e, row) {
        console.log(row)
        setItemsUnitsMap([]);
        fetchItem(row.id, row.shopType);
        setSelectedID(row.id);
        setSelectedRow(row);
        if (e.target.value === "delete-item") {
            handleShowDeleteModal();
        } else if (e.target.value === "edit-item") {
            handleShowEditItemModal();
        } else if (e.target.value === "view-item") {
            handleShowViewItemModal();
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
                {isAdmin && (
                    <option value="edit-item" className="color-options">
                        Edit
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

        // //MANGO
        const response = await getAllItemPrices();
        if (response.data?.data) {
            var items = [];
            var sortedData = response.data.data.sort((a, b) =>
                a.item_name > b.item_name
                    ? 1
                    : b.item_name > a.item_name
                    ? -1
                    : 0
            );
            sortedData.map(async (item) =>{
                var info = {};
                info.id = item.id
                info.shopType = "mango";
                info.item_name = item.item_name;
                info.unit = item.unit;
                info.price_1 = item.price_1 ? numberFormat(item.price_1) : "0.00";
                info.price_2 = item.price_2 ? numberFormat(item.price_2) : "0.00";
                info.price_3 = item.price_3 ? numberFormat(item.price_3) : "0.00";
                items.push(info);
            })
            setItemsDataMango(items);
            setFilterDataMango(items);
        } else {
            setItemsDataMango([]);
        }
        //POTATO
        const response2 = await getAllItemPricesPotato();
        if (response2.data?.data) {
            var items2 = [];
            var sortedData = response2.data.data.sort((a, b) =>
                a.item_name > b.item_name
                    ? 1
                    : b.item_name > a.item_name
                    ? -1
                    : 0
            );
            sortedData.map(async (item) =>{
                var info = {};
                info.shopType = "mango";
                info.item_name = item.item_name;
                info.unit = item.unit;
                info.price_1 = item.price_1 ? numberFormat(item.price_1) : "0.00";
                info.price_2 = item.price_2 ? numberFormat(item.price_2) : "0.00";
                info.price_3 = item.price_3 ? numberFormat(item.price_3) : "0.00";
                items2.push(info);
            })

            setItemsDataPotato(items2);
            setFilterDataPotato(items2);
        } else {
            setItemsData([]);
        }
        setShowLoader(false);
    }

    async function fetchItem(id, shop) {
        if (shop === "mango") {
            const response = await getItemPrices(id);
            if (response.data) {
                var data = response.data.data[0];
                data.shopType = "mango";
                setItemData(data);
                setSaleItemsValue({
                    name: "item_id",
                    label: data.item_name,
                    value: data.item_id,
                })
            } else {
                setItemData({});
            }
        } else if (shop === "potato") {
            const response = await getItemPricesPotato(id);
            if (response.data) {
                var data = response.data.data[0];
                data.shopType = "potato";
                setItemData(data);
                setSaleItemsValue({
                    name: "item_id",
                    label: data.item_name,
                    value: data.item_id,
                })
            } else {
                setItemData({});
            }
        }
    }

    async function handleSaveItem() {
        if (addTo === "MANGO MAGIC") {
            setIsClicked(true);
            const response = await createItemPrice(itemDetails);
            if(response.data) {
                if (response.data.status === "success") {
                    setTimeout(() => {
                        toast.success("Successfully created item price!", {
                            style: toastStyle(),
                        });
                        handleCloseAddItemModal();
                        setSaleItemsValue([])
                    }, 3000);
                } else {
                    toast.error("Error adding item price!", {
                        style: toastStyle(),
                    });
                }
            }
        } else if (addTo === "POTATO CORNER") {
            setIsClicked(true);
            const response = await createItemPricePotato(itemDetails);
            if(response.data) {
                if (response.data.status === "success") {
                    setTimeout(() => {
                        toast.success("Successfully created item!", {
                            style: toastStyle(),
                        });
                        handleCloseAddItemModal();
                        refreshPage();
                        setSaleItemsValue([])
                    }, 3000);
                } else {
                    toast.error("Error creating new item!", {
                        style: toastStyle(),
                    });
                }
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
            const response = await deleteItemPrices(id);
            if (response.data) {
                toast.success("Successfully deleted item!", {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                refreshPage();
                setSaleItemsValue([])

            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.shopType === "potato") {
            const response = await deleteItemPricesPotato(id);
            if (response.data) {
                toast.success("Successfully deleted item!", {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                refreshPage();
                setSaleItemsValue([])

            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        }
    }

    React.useEffect(() => {
        fetchAllItems();
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
                        <h1 className="page-title"> ITEM PRICES </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            className="search-bar"
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
                                onChange={(e) => handleOnChange(e)}
                            >
                                <option
                                    value=""
                                    hidden
                                    selected
                                    className="text-uppercase"
                                >
                                    Classification
                                </option>
                                <option value="all">All</option>
                                <option value="ingredient">Ingredient</option>
                                <option value="supplies">Supplies</option>
                                <option value="cleaning_supplies">
                                    Cleaning Supplies
                                </option>
                                <option value="office_supplies">
                                    Office Supplies
                                </option>
                                <option value="equipment">Equipment</option>
                                <option value="uniform">Uniform</option>
                                <option value="beverage">Beverage</option>
                                <option value="finished_product">
                                    Finished Product
                                </option>
                            </Form.Select>
                        </div>

                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "ITEM NAME",
                                "UNIT",
                                "PRICE 1",
                                "PRICE 2",
                                "PRICE 3",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "item_name", 
                                "unit",
                                "price_1",
                                "price_2",
                                "price_3",
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
                                onChange={(e) => handleOnChange(e)}
                            >
                                <option
                                    value=""
                                    hidden
                                    selected
                                    className="text-uppercase"
                                >
                                    Classification
                                </option>
                                <option value="all">All</option>
                                <option value="item_name">Item Name</option>
                                <option value="supplies">Supplies</option>
                                <option value="cleaning_supplies">
                                    Cleaning Supplies
                                </option>
                                <option value="office_supplies">
                                    Office Supplies
                                </option>
                                <option value="equipment">Equipment</option>
                                <option value="uniform">Uniform</option>
                                <option value="beverage">Beverage</option>
                                <option value="finished_product">
                                    Finished Product
                                </option>
                            </Form.Select>
                        </div>

                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "ITEM NAME",
                                "UNIT",
                                "PRICE 1",
                                "PRICE 2",
                                "PRICE 3",
                                "ACTIONS",
                            ]}
                            headerSelector={[
                                "item_name", 
                                "unit",
                                "price_1",
                                "price_2",
                                "price_3",
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
                <div className=" mt-3 ">
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
                        <Col>
                            PRICE 1
                            <Form.Control
                                type="number"
                                name="price_1"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            PRICE 2
                            <Form.Control
                                type="number"
                                name="price_2"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                        <Col>
                            PRICE 3
                            <Form.Control
                                type="number"
                                name="price_3"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
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
                <div className=" mt-3 ">
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
            <ViewModal
                withHeader
                title="ITEM"
                withButtons
                show={showViewItemModal}
                onHide={handleCloseViewItemModal}
                onEdit={handleOnEdit}
            >
                <div className="mt-3 ">
                    <div className="col-sm-12  space mt-0">
                        <div className="container-wrapper mt-0">
                            <Row className="nc-modal-custom-row-view mt-0">
                                <Col>
                                    ITEM NAME
                                    <Row className="nc-modal-custom-row text-capitalize">
                                        <Col> {itemData.name} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    CLASSIFICATION
                                    <Row className="nc-modal-custom-row text-capitalize">
                                        <Col> {itemData.typeSpace} </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    DETAILS
                                    <Row className="nc-modal-custom-row text-capitalize">
                                        <Col> {itemData.detail} </Col>

                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <Row className="nc-modal-custom-row mb-0">
                        <Col>UNIT OF MEASURE CONVERSION</Col>
                    </Row>
                    <div className="container-wrapper mt-0">
                        <div className="edit-purchased-items justify-content-center">
                            <div className="not-found">
                                {itemsUnitsMap.length === 0 ? (
                                    <span>
                                        {" "}
                                        No Unit of Measure Conversion Found!{" "}
                                    </span>
                                ) : (
                                    viewTable()
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </ViewModal>
        </div>
    );
}
