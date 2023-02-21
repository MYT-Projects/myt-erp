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
import toast, { Toaster } from "react-hot-toast";
import { formatDate, isAdmin, toastStyle } from "../../Helpers/Utils/Common";

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
import trash from "../../Assets/Images/trash.png";
import equal from "../../Assets/Images/equal.png";

//api
import { itemsMockData } from "../../Helpers/mockData/mockData";
import {
    getAllItems,
    createItem,
    getItem,
    deleteItem,
    searchItem,
    editItem,
} from "../../Helpers/apiCalls/itemsApi";
import { getUser, refreshPage } from "../../Helpers/Utils/Common";
import { validateItems } from "../../Helpers/Validation/Manage/ItemsValidation";
import {
    createItemPotato,
    deleteItemPotato,
    editItemPotato,
    getAllItemsPotato,
    getItemPotato,
    searchItemPotato,
} from "../../Helpers/apiCalls/PotatoCorner/Manage/ItemsApi";
import ItemLists from "../Inventory/ItemLists";
import { NavLink, useNavigate } from "react-router-dom";

export default function Items() {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(false);
    const [option, setOption] = useState("Select");
    const [showLoader, setShowLoader] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    // MODALS //
    // DELETE
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    // VIEW
    const [showViewItemModal, setShowViewItemModal] = useState(false);
    const handleShowViewItemModal = () => setShowViewItemModal(true);
    const handleCloseViewItemModal = () => setShowViewItemModal(false);

    // EDIT
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const handleShowEditItemModal = () => setShowEditItemModal(true);
    const handleCloseEditItemModal = () => setShowEditItemModal(false);

    // EDIT Conversion
    const [showEditConversionModal, setShowEditConversionModal] = useState(false);
    const handleShowEditConversionModal = () => setShowEditConversionModal(true);
    const handleCloseEditConversionModal = () => setShowEditConversionModal(false);

    // ADD
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const handleShowAddItemModal = () => setShowAddItemModal(true);
    const handleCloseAddItemModal = () => setShowAddItemModal(false);

    // ADD Conversion
    const [showAddConversionModal, setShowAddConversionModal] = useState(false);
    const handleShowAddConversionModal = () => setShowAddConversionModal(true);
    const handleCloseAddConversionModal = () => setShowAddConversionModal(false);

    const [addTo, setAddTo] = useState("");
    const handleAddSelect = (e) => {
        setAddTo(e);
    };

    //API
    const [itemsData, setItemsData] = useState([]);
    const [itemsDataMango, setItemsDataMango] = useState([]);
    const [itemsDataPotato, setItemsDataPotato] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [filterDataMango, setFilterDataMango] = useState([]);
    const [filterDataPotato, setFilterDataPotato] = useState([]);
    const [itemData, setItemData] = useState({});
    const [selectedRow, setSelectedRow] = useState([]);
    const [itemSetData, setItemSetData] = useState({});
    const [selectedID, setSelectedID] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [classificationOptions, setClassificationOptions] = useState([]);
    const [itemDetails, setItemDetails] = useState({
        name: "",
        type: "",
        detail: "",
        added_by: getUser(),
        added_on: formatDate(),
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
    const [filterConfig, setFilterConfig] = useState({
        name: "",
        type: "ingredient",
        tab: "mango_magic",

    });
    const handleTabSelect = (tabKey) => {
        setFilterConfig((prev) => {
            return { ...prev, tab: tabKey };
        });
    };
    const isInitialMount = useRef(true);
    const filterConfigKey = 'manage-items-filterConfig';
    // useEffect(()=>{
    //     if(isInitialMount.current){
    //         isInitialMount.current = false;
    //         setFilterConfig((prev) => {
    //             // console.log("override");
    //             if (window.localStorage.getItem(filterConfigKey) != null){
    //                 // console.log("found");
    //                 handleTabSelect(JSON.parse(window.localStorage.getItem(filterConfigKey)).tab);
    //                 return JSON.parse(window.localStorage.getItem(filterConfigKey))
    //             } else {
    //                 return {...prev}
    //             }
    //         });
    //     } else {
    //         window.localStorage.setItem(filterConfigKey, JSON.stringify(filterConfig));
    //     }
    // }, [filterConfig])


    //ONCHANGE
    //ADD or CREATE ITEM
    const handleAddChange = (e) => {
        const { name, value } = e.target;

        if (name === "is_for_sale") {
            if (itemDetails.is_for_sale === 1) {
                setItemDetails((prevState) => ({
                    ...prevState,
                    [name]: 0,
                }));
            } else {
                setItemDetails((prevState) => ({
                    ...prevState,
                    [name]: 1,
                }));
            }
        } else if (name === "is_dsr") {
            if (itemDetails.is_dsr === 1) {
                setItemDetails((prevState) => ({
                    ...prevState,
                    [name]: 0,
                }));
            } else {
                setItemDetails((prevState) => ({
                    ...prevState,
                    [name]: 1,
                }));
            }
        } else {
            setItemDetails((prevState) => ({
                ...prevState,
                [name]: value,
            }));   
        }
    };

    //EDIT or UPDATE ITEM
    const handleEditChange = (e) => {
        const { name, value } = e.target;

        if (name === "is_for_sale") {
            if(value === "true") {
                setItemData((prevState) => ({
                    ...prevState,
                    [name]: false,
                }));
            } else if(value === "false") {
                setItemData((prevState) => ({
                    ...prevState,
                    [name]: true,
                }));
            } else {
            }
        } else if (name === "is_dsr") {
            if(value === "true") {
                setItemData((prevState) => ({
                    ...prevState,
                    [name]: false,
                }));
            } else if(value === "false") {
                setItemData((prevState) => ({
                    ...prevState,
                    [name]: true,
                }));
            } else {
            }
        } else {
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
                case "smallwares":
                    setItemsDataPotato(
                        filterDataPotato.filter(
                            (data) => data.type === "smallwares"
                        )
                    );

                    return setItemsDataMango(
                        filterDataMango.filter(
                            (data) => data.type === "smallwares"
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

    // SEARCH USER
    function handleOnSearch(e) {
        setFilterConfig((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.value,
            };
        });
    }

    //DELETE or REMOVE ITEM
    function handleDeleteItem() {
        removeItem(selectedID);
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

    function handleFilterChange(e) {
        const { name, value } = e.target;
        setFilterConfig((prev) => {
            return { ...prev, [name]: value };
        });
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
                            VALUE 1 - Warehouse Unit<span className="required">*</span>
                        </th>
                        <th>  </th>
                        <th>
                            VALUE 2 - Store Unit<span className="required">*</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {itemsUnits.map((item, index) => {
                        return (
                            <tr>
                                <td className="row align-contents">
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="inventory_value"
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="inventory_unit"
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
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
                                
                                <td className="row align-contents">
                                    <Col >
                                        <Form.Control
                                            type="number"
                                            name="breakdown_value"
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="breakdown_unit"
                                            className="nc-modal-custom-input"
                                            onChange={(e) =>
                                                handleItemChange(e, index)
                                            }
                                        />
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

    function editTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>
                            VALUE 1 - Warehouse Unit<span className="required">*</span>
                        </th>
                        <th>  </th>
                        <th>
                            VALUE 2 - Store Unit<span className="required">*</span>
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsUnitsMap?.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td className="row align-contents">
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="inventory_value"
                                            className="nc-modal-custom-input"
                                            defaultValue={data.inventory_value}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="inventory_unit"
                                            className="nc-modal-custom-input"
                                            defaultValue={data.inventory_unit}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
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
                                <td className="row align-contents">
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="breakdown_value"
                                            className="nc-modal-custom-input"
                                            defaultValue={data.breakdown_value}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="breakdown_unit"
                                            className="nc-modal-custom-input"
                                            defaultValue={data.breakdown_unit}
                                            onChange={(e) =>
                                                handleItemChangeEdit(e, index)
                                            }
                                        />
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

    function viewTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th> VALUE 1 - Warehouse Unit </th>
                        <th>  </th>
                        <th> VALUE 2 - Store Unit </th>
                    </tr>
                </thead>
                <tbody>
                    {itemsUnitsMap.map((data, index) => {
                        return (
                            <tr key={index}>
                                 <td className="row align-contents">
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="inventory_value"
                                            className="nc-modal-custom-input"
                                            value={data.inventory_value}
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="inventory_unit"
                                            className="nc-modal-custom-input"
                                            defaultValue={data.inventory_unit}
                                            disabled
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
                                <td className="row align-contents">
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="breakdown_value"
                                            className="nc-modal-custom-input"
                                            value={data.breakdown_value}
                                            disabled
                                        />
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="breakdown_unit"
                                            className="nc-modal-custom-input"
                                            defaultValue={data.breakdown_unit}
                                            disabled
                                        />
                                    </Col>
                                </td>
                            </tr>
                        );
                        // })}
                    })}
                </tbody>
            </Table>
        );
    }

    // DROPDOWN SELECT
    function handleSelectChange(e, row) {
        setSelectedRow(row);
        setSelectedType(row.shopType);
        setItemsUnitsMap([]);
        setSelectedID(row.id);
        console.log(row)
        if (e.target.value === "delete-item") {
            fetchItem(row.id, row.shopType);
            handleShowDeleteModal();
        } else if (e.target.value === "edit-item") {
            fetchItem(row.id, row.shopType);
            handleShowEditItemModal();
        } else if (e.target.value === "view-item") {
            fetchItem(row.id, row.shopType);
            handleShowViewItemModal();
        } else if (e.target.value === "item-details") {
            navigate("/itemlists/itemdetails/" + row.id + "/" + row.shoplink)
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
                <option value="view-item" className="color-options">
                    View
                </option>
                <option value="item-details" className="color-options">
                    Item Details
                </option>
                {/* {isAdmin && (
                    <option value="edit-item" className="color-options">
                        Edit
                    </option>
                )} */}
                {/* {isAdmin && (
                    <option value="delete-item" className="color-red">
                        Delete
                    </option>
                )} */}
            </Form.Select>
        );
    }

    //API CALL
    async function fetchAllItems() {
        setShowLoader(true);
        setClassificationOptions([])

        //MANGO
        if (filterConfig.tab === "mango_magic") {
            const response = await searchItem(filterConfig);
            if (response.response) {
                var itemsList = response.response.data;
                response.response.data.map(
                    (data, key) => (itemsList[key].item_name = data.name)
                );
                response.response.data.map(
                    (data, key) =>
                        (itemsList[key].type = data.type.replace("_", " "))
                );
                response.response.data.map(
                    (data, key) => (itemsList[key].shopType = "mango")
                );
                response.response.data.map(
                    (data, key) => (itemsList[key].shoplink = "mango_magic")
                );
                setItemsDataMango(itemsList);
                setFilterDataMango(itemsList);
                
                var classification = response.response.classifications?.map((data) => {
                    var info = {}
                    var name = data.split("_")
                    info.name = name.length < 2 ? data : name[0] + " " + name[1];
                    info.value = data;
                    return info
                })
                setClassificationOptions(classification)


            } else {
                setItemsDataMango([]);
                setShowLoader(false);
            }
        } else if (filterConfig.tab === "potato_corner") {
            //POTATO
            const response2 = await searchItemPotato(filterConfig);
            if (response2.response) {
                var itemsList2 = response2.response.data;
                response2.response.data.map(
                    (data, key) => (itemsList2[key].item_name = data.name)
                );
                response2.response.data.map(
                    (data, key) =>
                        (itemsList2[key].type = data.type.replace("_", " "))
                );
                response2.response.data.map(
                    (data, key) => (itemsList2[key].shopType = "potato")
                );
                response2.response.data.map(
                    (data, key) => (itemsList2[key].shoplink = "potato_corner")
                );
                setItemsDataPotato(itemsList2);
                setFilterDataPotato(itemsList2);
                
                var classification = response2.response.classifications?.map((data) => {
                    var info = {}
                    var name = data.split("_")
                    info.name = name.length < 2 ? data : name[0] + " " + name[1];
                    info.value = data;
                    return info
                })
                setClassificationOptions(classification)

            } else {
                setItemsData([]);
                setShowLoader(false);
            }
        }
        
        setShowLoader(false);
    }

    console.log(classificationOptions)

    async function fetchItem(id, shop) {
        if (shop === "mango") {
            const response = await getItem(id);
            if (response.data[0]) {
                var data = response.data[0];
                response.data.map(
                    (data) => (data.typeSpace = data.type.replace("_", " "))
                );
                response.data.map(
                    (data) => (data.detail = data.detail || "N/A")
                );
                response.data.map(
                    (data) => (data.is_for_sale = (data.is_for_sale === "1" ? true : false))
                );
                response.data.map(
                    (data) => (data.is_dsr = (data.is_dsr === "1" ? true : false))
                );
                if (data.item_units === false) {
                    response.data.map(
                        (data) => (data.item_units = data.item_units || [])
                    );
                    setItemsUnitsMap([]);
                    setItemData(data);
                } else {
                    setItemsUnitsMap(data.item_units);
                    setItemData(data);
                }
            } else {
                setItemData({});
            }
        } else if (shop === "potato") {
            const response = await getItemPotato(id);
            if (response.data[0]) {
                var data = response.data[0];
                response.data.map(
                    (data) => (data.typeSpace = data.type.replace("_", " "))
                );
                response.data.map(
                    (data) => (data.detail = data.detail || "N/A")
                );
                response.data.map(
                    (data) => (data.is_for_sale = (data.is_for_sale === "1" ? true : false))
                );
                response.data.map(
                    (data) => (data.is_dsr = (data.is_dsr === "1" ? true : false))
                );
                if (data.item_units === false) {
                    response.data.map(
                        (data) => (data.item_units = data.item_units || [])
                    );
                    setItemsUnitsMap([]);
                    setItemData(data);
                } else {
                    setItemsUnitsMap(data.item_units);
                    setItemData(data);
                }
            } else {
                setItemData({});
            }
        }
    }

    async function handleSaveItem() {
        var hasUnits = itemsUnits.length > 0 ? true : false;
        if (addTo === "MANGO MAGIC") {
            setIsClicked(true);
            const response = await createItem(itemDetails, itemsUnits);
            if (response.response) {
                setItemDetails((prevState) => ({
                    ...prevState,
                    ["id"]: response.response.data,
                }));
                setTimeout(() => {
                    toast.success("Successfully created item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    handleShowAddConversionModal();
                    setIsClicked(false);
                }, 3000);
            } else {
                toast.error("Error creating new item!", {
                    style: toastStyle(),
                });
            }
        } else if (addTo === "POTATO CORNER") {
            const response = await createItemPotato(
                itemDetails,
                itemsUnits
            );
            if (response.response) {
                setItemDetails((prevState) => ({
                    ...prevState,
                    ["id"]: response.response.data,
                }));
                setTimeout(() => {
                    toast.success("Successfully created item!", {
                        style: toastStyle(),
                    });
                    handleCloseAddItemModal();
                    handleShowAddConversionModal();
                    setIsClicked(false);
                }, 3000);
            } else {
                toast.error("Error creating new item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function handleAddConversion() {

        if (addTo === "MANGO MAGIC") {
            const response = await editItem(itemDetails, itemsUnits);
            if (response.response) {
                setTimeout(() => {
                    toast.success("Successfully added conversion!", {
                        style: toastStyle(),
                    });
                    handleCloseAddConversionModal();
                }, 3000);
            } else {
                toast.error("Error updating item!", {
                    style: toastStyle(),
                });
            }
        } else if (addTo === "POTATO CORNER") {
            const response = await editItemPotato(itemDetails, itemsUnits);
            if (response.response) {
                setTimeout(() => {
                    toast.success("Successfully added conversion!", {
                        style: toastStyle(),
                    });
                    handleCloseAddConversionModal();
                }, 3000);
            } else {
                toast.error("Error updating item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function handleEditItem() {

        if (selectedRow.shopType === "mango") {
            const response = await editItem(itemData, itemsUnitsMap);
            if (response.response) {
                setTimeout(() => {
                    toast.success("Successfully edited item!", {
                        style: toastStyle(),
                    });
                    handleCloseEditItemModal();
                    handleShowEditConversionModal();
                }, 3000);
            } else {
                toast.error("Error updating item!", {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.shopType === "potato") {
            const response = await editItemPotato(itemData, itemsUnitsMap);
            if (response.response) {
                setTimeout(() => {
                    toast.success("Successfully edited item!", {
                        style: toastStyle(),
                    });
                    handleCloseEditItemModal();
                    handleShowEditConversionModal();
                }, 3000);
            } else {
                toast.error("Error updating item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function handleEditConversion() {

        if (selectedRow.shopType === "mango") {
            const response = await editItem(itemData, itemsUnitsMap);
            if (response.response) {
                setTimeout(() => {
                    toast.success("Successfully edited conversion!", {
                        style: toastStyle(),
                    });
                    handleCloseEditConversionModal();
                    refreshPage();
                }, 3000);
            } else {
                toast.error("Error updating item!", {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.shopType === "potato") {
            const response = await editItemPotato(itemData, itemsUnitsMap);
            if (response.response) {
                setTimeout(() => {
                    toast.success("Successfully edited conversion!", {
                        style: toastStyle(),
                    });
                    handleCloseEditConversionModal();
                    refreshPage();
                }, 3000);
            } else {
                toast.error("Error updating item!", {
                    style: toastStyle(),
                });
            }
        }
    }

    async function removeItem(id) {
        if (selectedRow.shopType === "mango") {
            const response = await deleteItem(id);
            if (response.data) {
                toast.success("Successfully deleted item!", {
                    style: toastStyle(),
                });
                handleCloseDeleteModal();
                refreshPage();
            } else {
                toast.error(response.error.data.messages.error, {
                    style: toastStyle(),
                });
            }
        } else if (selectedRow.shopType === "potato") {
            const response = await deleteItemPotato(id);
            if (response.data) {
                toast.success("Successfully deleted item!", {
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
        fetchAllItems();
        return () => {
            setItemData({});
            setItemsUnitsMap([]);
            setItemsDataMango([]);
            setFilterDataMango([]);
            setItemsDataPotato([]);
            setFilterDataPotato([]);
        };
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
                <Row>
                    <Col>
                        <h1 className="page-title"> ITEMS </h1>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <input
                            type="text"
                            name="name"
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
                                value={filterConfig.type}
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

                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "ITEM NAME",
                                "CLASSIFICATION",
                                "ACTIONS",
                            ]}
                            headerSelector={["item_name", "type"]}
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
                                value={filterConfig.type}
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

                        {/* table */}
                        <TableTemplate
                            tableHeaders={[
                                "ITEM NAME",
                                "CLASSIFICATION",
                                "ACTIONS",
                            ]}
                            headerSelector={["item_name", "type"]}
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
                title={`ITEM TO ${addTo}`}
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
                            <span className="required"> * </span>
                            <Form.Control
                                type="text"
                                name="name"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                            <InputError
                                isValid={isError.name}
                                message={"Item name is required"}
                            />
                        </Col>

                        <Col>
                            ITEM CLASSIFICATION
                            <span className="required"> * </span>
                            <select
                                name="type"
                                className="ms-0 nc-modal-custom-select nc-modal-custom-input-edit "
                                onChange={(e) => handleAddChange(e)}
                            >
                                <option
                                    defaultValue
                                    hidden
                                    selected
                                    className="nc-modal-custom-select"
                                >
                                    Select
                                </option>
                                {classificationOptions.length > 0 ? (
                                    classificationOptions.filter((v, i) => {
                                        return (
                                            classificationOptions.map((val) => val.value).indexOf(v.value) == i
                                        );
                                    })
                                    .map((classification) => {
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
                            </select>
                            <InputError
                                isValid={isError.type}
                                message={"Item classification is required"}
                            />
                        </Col>
                        <Col>
                            ITEM DETAIL
                            <Form.Control
                                type="text"
                                name="detail"
                                className="nc-modal-custom-input"
                                onChange={(e) => handleAddChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group
                                className="mt-3"
                                controlId="formBasicCheckbox"
                            >
                                <Form.Check
                                    type="checkbox"
                                    label="This is for sale to Franchisee"
                                    name="is_for_sale"
                                    value="1"
                                    className="pt-2"
                                    onChange={(e) => handleAddChange(e)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group
                                className="mt-3"
                                controlId="formBasicCheckbox"
                            >
                                <Form.Check
                                    type="checkbox"
                                    label="This is a store item"
                                    name="is_dsr"
                                    value="1"
                                    className="pt-2"
                                    onChange={(e) => handleAddChange(e)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </AddModal>
            <AddModal
                title={`UNIT OF MEASURE CONVERSION`}
                type="item"
                show={showAddConversionModal}
                onHide={handleCloseAddConversionModal}
                onSave={handleAddConversion}
                isClicked={isClicked}
            >
                <div className=" mt-3 ">
                    <Row className="nc-modal-custom-row mb-0">
                        <Col>UNIT OF MEASURE CONVERSION</Col>
                    </Row>
                    <Row className="nc-modal-custom-row mt-0">
                        <div className="edit-purchased-items justify-content-center">
                            <div className="not-found mt-0 ">
                                {itemsUnits.length === 0 ? (
                                    <span>
                                        {" "}
                                        No unit of measure conversion found!{" "}
                                    </span>
                                ) : (
                                    renderTable()
                                )}
                            </div>
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => AddItem()}>
                            Add
                        </Button>
                    </Row>
                </div>
            </AddModal>
            <EditModal
                title="ITEM"
                type="item"
                show={showEditItemModal}
                onHide={handleCloseEditItemModal}
                onSave={handleEditItem}
            >
                <div className=" mt-3 ">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            ITEM NAME
                            <span className="required"> * </span>
                            <Form.Control
                                type="text"
                                name="name"
                                defaultValue={itemData.name}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                            <InputError
                                isValid={isErrorEdit.name}
                                message={"Item name is required"}
                            />
                        </Col>
                        <Col>
                            ITEM CLASSIFICATION
                            <span className="required"> * </span>
                            <select
                                name="type"
                                value={itemData.type}
                                className="ms-0 nc-modal-custom-select nc-modal-custom-input-edit "
                                onChange={(e) => handleEditChange(e)}
                            >
                                {classificationOptions.length > 0 ? (
                                    classificationOptions.filter((v, i) => {
                                        return (
                                            classificationOptions.map((val) => val.value).indexOf(v.value) == i
                                        );
                                    })
                                    .map((classification) => {
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
                            </select>
                            <InputError
                                isValid={isErrorEdit.type}
                                message={"Item classification is required"}
                            />
                        </Col>
                        <Col>
                            ITEM DETAIL
                            <Form.Control
                                type="text"
                                name="detail"
                                defaultValue={itemData.detail}
                                className="nc-modal-custom-input-edit"
                                onChange={(e) => handleEditChange(e)}
                                required
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group
                                className="mt-3"
                                controlId="formBasicCheckbox"
                            >
                                <Form.Check
                                    type="checkbox"
                                    label="This is for sale to Franchisee"
                                    name="is_for_sale"
                                    value={itemData.is_for_sale}
                                    className="pt-2"
                                    checked={itemData.is_for_sale}
                                    onChange={(e) => handleEditChange(e)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group
                                className="mt-3"
                                controlId="formBasicCheckbox"
                            >
                                <Form.Check
                                    type="checkbox"
                                    label="This is a store item"
                                    name="is_dsr"
                                    value={itemData.is_dsr}
                                    className="pt-2"
                                    checked={itemData.is_dsr}
                                    onChange={(e) => handleEditChange(e)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </EditModal>
            <EditModal
                title="UNIT OF MEASURE CONVERSION"
                type="item"
                show={showEditConversionModal}
                onHide={handleCloseEditConversionModal}
                onSave={handleEditConversion}
            >
                <div className=" mt-3 ">
                    <Row className="nc-modal-custom-row mb-0">
                        <Col>UNIT OF MEASURE CONVERSION</Col>
                    </Row>
                    <Row>
                        <div className="edit-purchased-items justify-content-center">
                            <div className="not-found mt-0 ">
                                {itemsUnits.length === 0 ? (
                                    <span>
                                        {" "}
                                        No Unit of Measure Conversion Found!{" "}
                                    </span>
                                ) : (
                                    editTable()
                                )}
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
                            
                            <Row>
                                <Col>
                                    <Form.Group
                                        className="mt-3"
                                        controlId="formBasicCheckbox"
                                    >
                                        <Form.Check
                                            type="checkbox"
                                            label="This is for sale to Franchisee"
                                            name="is_for_sale"
                                            className="pt-2"
                                            checked={itemData.is_for_sale}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                <Form.Group
                                        className="mt-3"
                                        controlId="formBasicCheckbox"
                                    >
                                        <Form.Check
                                            type="checkbox"
                                            label="This is a store item"
                                            name="is_dsr"
                                            className="pt-2"
                                            checked={itemData.is_dsr}
                                        />
                                    </Form.Group>
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
