import React, { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { sampleItems } from "../../../../Helpers/mockData/mockData";
import Navbar from "../../../../Components/Navbar/Navbar";
import trash from "./../../../../Assets/Images/trash.png";
import Select from "react-select";
import "./../PurchaseOrders.css";
import {
    createSupplier,
    getAllSuppliers,
} from "../../../../Helpers/apiCalls/suppliersApi";
import {
    formatYDM,
    numberFormat,
    numberFormatInt,
    refreshPage,
    toastStyle,
    TokenExpiry,
    getTodayDateISOFormat,
} from "../../../../Helpers/Utils/Common";
import { getAllEmployees } from "../../../../Helpers/apiCalls/employeesApi";
import {
    getPurchaseOrder,
    updatePurchaseOrder,
} from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllItems } from "../../../../Helpers/apiCalls/itemsApi";
import toast from "react-hot-toast";
import AddModal from "../../../../Components/Modals/AddModal";
import { getAllForwarders } from "../../../../Helpers/apiCalls/forwardersApi";
import { getAllBranches } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getItems } from "../../../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { validateAddPO } from "../../../../Helpers/Validation/Purchase/PurchaseOrderValidation";
import InputError from "../../../../Components/InputError/InputError";
import { validateSuppliers } from "../../../../Helpers/Validation/Manage/SuppliersValidation";
import {
    getItemsPotato,
    getPurchaseOrderPotato,
    updatePurchaseOrderPotato,
} from "../../../../Helpers/apiCalls/PotatoCorner/Purchases/purchaseOrderApi";
import { getAllSuppliersPotato } from "../../../../Helpers/apiCalls/PotatoCorner/suppliersApi";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { getAllVendors } from "../../../../Helpers/apiCalls/Manage/Vendors";
import { getAllVendorsPotato } from "../../../../Helpers/apiCalls/PotatoCorner/VendorsApi";

export default function EditPurchaseOrder() {
    const { id, type, shopType } = useParams();
    let navigate = useNavigate();
    var idInfo = id.split("-");
    var poID = idInfo[1].replace(/\s/g, "");

    const [inactive, setInactive] = useState(true);
    const [editPO, setEditPO] = useState({});
    const [items, setItems] = useState([
        { id: "", ingredient_id: "", qty: 1, unit: "", price: 0, amount: 0 },
        { id: "", ingredient_id: "", qty: 1, unit: "", price: 0, amount: 0 },
        { id: "", ingredient_id: "", qty: 1, unit: "", price: 0, amount: 0 },
    ]);
    const [branches, setBranches] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [itemsList, setItemsList] = useState([]);
    const [itemsOptions, setItemsOptions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isChanged, setIsChanged] = useState(false);

    const [suppliersValue, setSuppliersValue] = useState({
        name: "supplier_id",
        label: "",
        value: "",
    });
    const [forwardersValue, setForwardersValue] = useState({
        name: "forwarder_id",
        label: "",
        value: "",
    });
    const [branchValue, setBranchValue] = useState({
        name: "branch_id",
        label: "",
        value: "",
    });

    // ADD
    const [supplierDetails, setSupplierDetails] = useState({
        trade_name: "",
        trade_address: "",
        bir_name: "",
        bir_address: "",
        tin: "",
        terms: "",
        requirements: "",
        phone_no: "",
        email: "",
        contact_person: "",
        bank_primary: "",
        bank_alternate: "",
        payee: "",
    });

    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const handleShowAddSupplierModal = () => setShowAddSupplierModal(true);
    const handleCloseAddSupplierModal = () => {
        setShowAddSupplierModal(false);
    };

    function handleAddItem() {
        {
            window.open("/items", "_blank");
        }
    }

    async function handleSaveSupplier() {
        if (validateSuppliers(supplierDetails, setIsError)) {
            const response = await createSupplier(supplierDetails);
            if (response.response) {
                toast.success(response.response.response, {
                    style: toastStyle(),
                });
                handleCloseAddSupplierModal();
                refreshPage();
            } else {
                TokenExpiry(response);
                toast.error("Error Creating New Supplier", {
                    style: toastStyle(),
                });
            }
        }
    }

    const [isError, setIsError] = useState({
        supplierName: false,
        purchase_date: false,
        delivery_date: false,
        requisitioner: false,
        delivery_address: false,
        price: false,
        POItems: false,
    });

    async function fetchPO() {
        setEditPO({});
        setItems([]);

        setIsChanged(true);

        if (shopType === "mango") {
            const response = await getPurchaseOrder(poID);

            if (response.error) {
                TokenExpiry(response);
            } else {
                var PO = response.response.data[0];
                PO.purchase_date = getTodayDateISOFormat(PO.purchase_date)
                PO.delivery_date = getTodayDateISOFormat(PO.delivery_date)
                // PO.delivery_date = new Date(
                //     PO.delivery_date
                // ).toLocaleDateString("en-CA");
                PO.requisitioner = {
                    label: PO.requisitioner_name,
                    value: PO.requisitioner,
                };
                PO.supplier_id = PO.supplier_id
                    ? "supplier-" + PO.supplier_id
                    : "";
                PO.vendor_id = PO.vendor_id ? "vendor-" + PO.vendor_id : "";
                setEditPO(PO);

                fetchItems(PO.branch_id);
                setSuppliersValue({
                    name: "supplier_id",
                    label: PO.supplier_trade_name
                        ? PO.supplier_trade_name
                        : PO.vendor_trade_name,
                    value: PO.supplier_id ? PO.supplier_id : PO.vendor_id,
                });
                setForwardersValue({
                    name: "forwarder_id",
                    label: PO.forwarder_name,
                    value: PO.forwarder_id,
                });
                setBranchValue({
                    name: "branch_id",
                    label: PO.branch_name,
                    value: PO.branch_id,
                });

                var list = [];

                PO.purchase_items.map((data) => {
                    var obj = {};
                    obj.added_by = data.added_by;
                    obj.added_on = data.added_on;
                    obj.amount = data.amount;
                    obj.current_qty = data.current_qty
                        ? data.current_qty
                        : data.inventory_qty;
                    obj.id = data.id;
                    obj.inventory_qty = data.inventory_qty;
                    obj.is_deleted = data.is_deleted;
                    obj.item_id = {
                        value: data.item_id,
                        label: data.item_name,
                    };
                    obj.item_name = data.item_name;
                    obj.prev_received_qty = data.prev_received_qty;
                    obj.price = data.price;
                    obj.purchase_id = data.purchase_id;
                    obj.qty = data.qty;
                    obj.received_qty = data.received_qty;
                    obj.status = data.status;
                    obj.unit = data.unit;
                    obj.updated_by = data.updated_by;
                    obj.updated_on = data.updated_on;
                    obj.remarks = data.remarks;

                    list.push(obj);
                });

                setItems(list);
            }
        } else if (shopType === "potato") {
            const response = await getPurchaseOrderPotato(poID);

            if (response.error) {
                TokenExpiry(response);
            } else {
                var PO = response.response.data[0];
                PO.purchase_date = new Date(
                    PO.purchase_date
                ).toLocaleDateString("en-CA");
                PO.delivery_date = new Date(
                    PO.delivery_date
                ).toLocaleDateString("en-CA");
                PO.requisitioner = {
                    label: PO.requisitioner_name,
                    value: PO.requisitioner,
                };
                PO.supplier_id = PO.supplier_id
                    ? "supplier-" + PO.supplier_id
                    : "";
                PO.vendor_id = PO.vendor_id ? "vendor-" + PO.vendor_id : "";
                setEditPO(PO);

                fetchItems(PO.branch_id);
                setSuppliersValue({
                    name: "supplier_id",
                    label: PO.supplier_trade_name,
                    value: PO.supplier_id,
                });
                setForwardersValue({
                    name: "forwarder_id",
                    label: PO.forwarder_name,
                    value: PO.forwarder_id,
                });
                setBranchValue({
                    name: "branch_id",
                    label: PO.branch_name,
                    value: PO.branch_id,
                });

                var list = [];

                PO.purchase_items.map((data) => {
                    var obj = {};
                    obj.added_by = data.added_by;
                    obj.added_on = data.added_on;
                    obj.amount = data.amount;
                    obj.current_qty = data.current_qty
                        ? data.current_qty
                        : data.inventory_qty;
                    obj.id = data.id;
                    obj.inventory_qty = data.inventory_qty;
                    obj.is_deleted = data.is_deleted;
                    obj.item_id = {
                        value: data.item_id,
                        label: data.item_name,
                    };
                    obj.item_name = data.item_name;
                    obj.prev_received_qty = data.prev_received_qty;
                    obj.price = data.price;
                    obj.purchase_id = data.purchase_id;
                    obj.qty = data.qty;
                    obj.received_qty = data.received_qty;
                    obj.status = data.status;
                    obj.unit = data.unit;
                    obj.updated_by = data.updated_by;
                    obj.updated_on = data.updated_on;
                    obj.remarks = data.remarks;

                    list.push(obj);
                });

                setItems(list);
            }
        }
        setTimeout(() => setIsChanged(false), 1);

    }

    /** Suppliers **/
    const [suppliers, setSuppliers] = useState([]);

    React.useEffect(() => {
        fetchIngredients();
        fetchPO();
        fetchSuppliers();
        fetchForwarders();
        fetchBranches();
        fetchEmployees();
    }, []);

    React.useEffect(() => {
        fetchItems(branchValue.value);
    }, [branchValue]);

    React.useEffect(() => {
        var tempServiceFee = editPO.service_fee
            ? parseFloat(editPO.service_fee)
            : 0;

        var tempDiscount = editPO.discount
            ? parseFloat(editPO.discount)
            : 0;

        var _subtotal = items
            .map((item) => parseFloat(item.amount))
            .reduce((a, b) => a + b, 0);

        var _grandTotal = (_subtotal + tempServiceFee) - tempDiscount;
        setEditPO((prev) => {
            return {
                ...prev,
                subtotal: _subtotal.toFixed(2),
                grand_total: _grandTotal.toFixed(2),
            };
        });
    }, [isChanged]);

    async function fetchItems(branchId) {
        if (shopType === "mango") {
            const response = await getItems({ branchId: branchId });
            if (response.data) {
                setItemsList(response.data.data);
                let result = response.data.data.map((a) => {
                    return {
                        label: a.name,
                        value: a.id,
                    };
                });
                setItemsOptions(result);
            } else {
                TokenExpiry(response);
            }
        } else if (shopType === "potato") {
            const response = await getItemsPotato({ branchId: branchId });
            if (response.data) {
                setItemsList(response.data.data);
                let result = response.data.data.map((a) => {
                    return {
                        label: a.name,
                        value: a.id,
                    };
                });
                setItemsOptions(result);
            } else {
                TokenExpiry(response);
            }
        }
    }

    async function fetchBranches() {
        const response = await getAllBranches();
        if (response.data) {
            var branches_list = response.data.data;
            branches_list.map((branch) => {
                var info = {};
                if (branch.name === "Warehouse" || branch.id === "2") {
                    info.name = "branch_id";
                    info.label = branch.name;
                    info.value = branch.id;
                    info.address = branch.address;

                    setBranchList((prev) => [...prev, info]);
                }
            });
        } else {
            TokenExpiry(response);
        }
    }

    async function fetchSuppliers() {
        setSuppliers([]);

        if (shopType === "mango") {
            const response = await getAllSuppliers();
            const response2 = await getAllVendors();

            if (response.error) {
                TokenExpiry(response);
            } else {
                var suppliers = response.data.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                suppliers.map((supplier) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = supplier.trade_name;
                    info.value = "supplier-" + supplier.id;
                    info.address = supplier.trade_address;

                    setSuppliers((prev) => [...prev, info]);
                });
            }

            if (response2.error) {
                TokenExpiry(response2);
            } else {
                var vendors = response2.response.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                vendors.map((vendor) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = vendor.trade_name;
                    info.value = "vendor-" + vendor.id;
                    info.address = vendor.trade_address;

                    setSuppliers((prev) => [...prev, info]);
                });
            }
        } else if (shopType === "potato") {
            const response = await getAllSuppliersPotato();
            const response2 = await getAllVendors();

            if (response.error) {
                TokenExpiry(response);
            } else {
                var suppliers = response.response.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                suppliers.map((supplier) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = supplier.trade_name;
                    info.value = "supplier-" + supplier.id;
                    info.address = supplier.trade_address;

                    setSuppliers((prev) => [...prev, info]);
                });
            }

            if (response2.error) {
                TokenExpiry(response2);
            } else {
                var vendors = response2.response.data.sort((a, b) =>
                    a.trade_name > b.trade_name
                        ? 1
                        : b.trade_name > a.trade_name
                        ? -1
                        : 0
                );

                vendors.map((vendor) => {
                    var info = {};

                    info.name = "supplier_id";
                    info.label = vendor.trade_name;
                    info.value = "vendor-" + vendor.id;
                    info.address = vendor.trade_address;

                    setSuppliers((prev) => [...prev, info]);
                });
            }
        }
    }

    /** Forwarders **/
    const [forwarders, setForwarders] = useState([]);

    async function fetchForwarders() {
        setForwarders([]);

        const response = await getAllForwarders();

        if (response.data) {
            var forwarders = response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );

            forwarders.map((forwarder) => {
                var info = {};

                info.name = "forwarder_id";
                info.label = forwarder.name;
                info.value = forwarder.id;

                setForwarders((prev) => [...prev, info]);
            });
        } else {
            TokenExpiry(response);
        }
    }

    /** Employees */
    async function fetchEmployees() {
        setEmployees([]);
        const response = await getAllEmployees();
        if (response.data) {
            let result = response.data.data.map((data) => {
                return {
                    label:
                        data.first_name +
                        " " +
                        data.middle_name +
                        " " +
                        data.last_name,
                    value: data.id,
                };
            });
            setEmployees(result);
        } else {
            TokenExpiry(response);
        }
    }

    /** Ingredients **/
    const [ingredients, setIngredients] = useState([]);

    async function fetchIngredients() {
        setIngredients([]);

        const response = await getAllItems();

        if (response.data) {
            var ingredients = response.response.data.sort((a, b) =>
                a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );

            setIngredients(ingredients);
        } else {
            TokenExpiry(response);
        }
    }

    function handleSelectChange(e, type) {
        const newList = editPO;
        newList[e.name] = e.value;
        setEditPO(newList);

        if (type === "requisitioner") {
            setEditPO({
                ...editPO,
                requisitioner: { label: e.label, value: e.value },
            });
        } else if (e.name === "supplier_id") {
            setSuppliersValue({ name: e.name, label: e.label, value: e.value });
            if (e.value.split("-")[0] === "vendor") {
                setEditPO({
                    ...editPO,
                    vendor_id: e.value,
                    supplier_id: "",
                });
            } else if (e.value.split("-")[0] === "supplier") {
                setEditPO({
                    ...editPO,
                    vendor_id: "",
                    supplier_id: e.value,
                });
            }
        } else if (e.name === "branch_id") {
            setBranchValue({ name: e.name, label: e.label, value: e.value });
            var address = branchList.filter((data) => data.value === e.value)[0]
                .address;
            setEditPO({
                ...editPO,
                delivery_address: address !== null ? address : "",
                branch_id: e.value,
            });
        } else {
            setForwardersValue({
                name: e.name,
                label: e.label,
                value: e.value,
            });
        }
    }

    function handlePOChange(e) {
        const { name, value } = e.target;
        setEditPO((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        if (name === "service_fee" || name === "discount" ) {
            setIsChanged(!isChanged);
        }
    }

    function handleAddressChange(e) {
        setEditPO({ ...editPO, delivery_address: e.target.value });
    }

    async function savePO() {
        editPO.is_save = 1;
        editPO.status = "pending";

        if (typeof items === "object") {
            var list = [];

            items.map((data) => {
                var obj = {};
                obj.added_by = data.added_by;
                obj.added_on = data.added_on;
                obj.amount = data.amount;
                obj.current_qty = data.current_qty;
                obj.id = data.id;
                obj.inventory_qty = data.inventory_qty;
                obj.is_deleted = data.is_deleted;
                obj.item_id = data.item_id.value;
                obj.item_name = data.item_name;
                obj.prev_received_qty = data.prev_received_qty;
                obj.price = data.price;
                obj.purchase_id = data.purchase_id;
                obj.qty = data.qty;
                obj.received_qty = data.received_qty;
                obj.status = data.status;
                obj.unit = data.unit;
                obj.updated_by = data.updated_by;
                obj.updated_on = data.updated_on;
                obj.remarks = data.remarks;

                list.push(obj);
            });

            if (shopType === "mango") {
                const response = await updatePurchaseOrder(editPO, list);

                if (response.status === 200) {
                    toast.success("Purchase Order Saved Succesfully", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/purchaseorders"), 1000);
                } else {
                    TokenExpiry(response);

                    toast.error("Error Saving Purchase Order", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            } else if (shopType === "potato") {
                const response = await updatePurchaseOrderPotato(editPO, list);

                if (response.status === 200) {
                    toast.success("Purchase Order Saved Succesfully", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/purchaseorders"), 1000);
                } else {
                    TokenExpiry(response);

                    toast.error("Error Saving Purchase Order", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            }
        } else {
            if (shopType === "mango") {
                const response = await updatePurchaseOrder(editPO, items);

                if (response.status === 200) {
                    toast.success("Purchase Order Saved Succesfully", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/purchaseorders"), 1000);
                } else {
                    TokenExpiry(response);

                    toast.error("Error Saving Purchase Order", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            } else if (shopType === "potato") {
                const response = await updatePurchaseOrderPotato(editPO, items);

                if (response.status === 200) {
                    toast.success("Purchase Order Saved Succesfully", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/purchaseorders"), 1000);
                } else {
                    TokenExpiry(response);

                    toast.error("Error Saving Purchase Order", {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                }
            }
        }
    }

    async function submitPO() {
        editPO.is_save = 0;
        editPO.status = "for approval";
        var hasItems = items.length > 0 ? true : false;
        var hasItemContent = hasItems
            ? items[0].qty != "" &&
              items[0].unit != "" &&
              items[0].qty != "0" &&
              items[0].unit != 0
            : false;
        isError["POItems"] = !(hasItems && hasItemContent);

        if (typeof items === "object") {
            var list = [];

            items.map((data) => {
                var obj = {};
                obj.added_by = data.added_by;
                obj.added_on = data.added_on;
                obj.amount = data.amount;
                obj.current_qty = data.current_qty;
                obj.id = data.id;
                obj.inventory_qty = data.inventory_qty;
                obj.is_deleted = data.is_deleted;
                obj.item_id = data.item_id.value;
                obj.item_name = data.item_name;
                obj.prev_received_qty = data.prev_received_qty;
                obj.price = data.price;
                obj.purchase_id = data.purchase_id;
                obj.qty = data.qty;
                obj.received_qty = data.received_qty;
                obj.status = data.status;
                obj.unit = data.unit;
                obj.updated_by = data.updated_by;
                obj.updated_on = data.updated_on;
                obj.remarks = data.remarks;

                list.push(obj);
            });
            if (validateAddPO(editPO, list, setIsError) && !isError.POItems) {
                if (shopType === "mango") {
                    const response = await updatePurchaseOrder(editPO, list);

                    if (response.status === 200) {
                        toast.success("Purchase Order Updated Succesfully", {
                            style: toastStyle(),
                        });
                        setTimeout(
                            () =>
                                navigate(
                                    "/purchaseorders"
                                ),
                            1000
                        );
                    } else {
                        TokenExpiry(response);

                        toast.error("Error Updating Purchase Order", {
                            style: toastStyle(),
                        });
                    }
                } else if (shopType === "potato") {
                    const response = await updatePurchaseOrderPotato(
                        editPO,
                        list
                    );

                    if (response.status === 200) {
                        toast.success("Purchase Order Updated Succesfully", {
                            style: toastStyle(),
                        });
                        setTimeout(
                            () =>
                                navigate(
                                    "/purchaseorders/review/0/" +
                                        shopType +
                                        "/potato - " +
                                        poID
                                ),
                            1000
                        );
                    } else {
                        TokenExpiry(response);

                        toast.error("Error Updating Purchase Order", {
                            style: toastStyle(),
                        });
                    }
                }
            } else {
            }
        } else {
            if (validateAddPO(editPO, list, setIsError) && !isError.POItems) {

                if (shopType === "mango") {
                    const response = await updatePurchaseOrder(editPO, list);

                    if (response.status === 200) {
                        toast.success("Purchase Order Updated Succesfully", {
                            style: toastStyle(),
                        });
                        setTimeout(
                            () => navigate("/purchaseorders/review/0/" + poID),
                            1000
                        );
                    } else {
                        toast.error("Error Updating Purchase Order", {
                            style: toastStyle(),
                        });
                        setTimeout(() => refreshPage(), 1000);
                    }
                } else if (shopType === "potato") {
                    const response = await updatePurchaseOrder(editPO, list);

                    if (response.status === 200) {
                        toast.success("Purchase Order Updated Succesfully", {
                            style: toastStyle(),
                        });
                        setTimeout(
                            () => navigate("/purchaseorders/review/0/" + poID),
                            1000
                        );
                    } else {
                        toast.error("Error Updating Purchase Order", {
                            style: toastStyle(),
                        });
                        setTimeout(() => refreshPage(), 1000);
                    }
                }
            }
        }
    }

    function handleRemoveItem(id) {
        setIsChanged(true);

        setShowLoader(true);
        const rowId = id;
        const newItemList = [...items];
        newItemList.splice(rowId, 1);
        setItems(newItemList);

        editPO.grand_total = newItemList
            .map((item) => item.amount)
            .reduce((a, b) => a + b, 0);

        setTimeout(() => setShowLoader(false), 1);
        setTimeout(() => setIsChanged(false), 1);
    }

    function AddItem() {
        const newItem = {
            id: "",
            ingredient_id: "",
            qty: 1,
            unit: "",
            price: 0,
            amount: 0,
        };
        setItems((prevItems) => [...prevItems, newItem]);
    }

    const [showLoader, setShowLoader] = useState(false);

    function handleItemChange(e, id, search) {
        setIsChanged(true);

        if (search) {
            const list = [...items];
            list[id]["item_id"] = { label: e.label, value: e.value };

            itemsList?.map((data) => {
                data.item_units.map((info) => {
                    if (e.value === info.item_id) {
                        if (parseInt(info.current_qty) < parseInt(info.max)) {
                            list[id]["qty"] = info.max - info.current_qty;
                        } else {
                            list[id]["qty"] = parseInt(info.max);
                        }

                        list[id]["unit"] = info.inventory_unit;
                        list[id]["current_qty"] = info.current_qty;
                        list[id]["price"] =
                            info.price === null || info.price === "0"
                                ? info.previous_item_price
                                : info.price;
                        list[id]["amount"] =
                            parseFloat(list[id]["qty"] ? list[id]["qty"] : 0) *
                            parseFloat(
                                list[id]["price"] ? list[id]["price"] : 0
                            );
                    }
                });
            });
            setItems(list);
        } else {
            const { name, value } = e.target;
            const list = [...items];

            if (name === "item_id") {
                let values = value.split("|");
                var ingredient_id = values[0];
                var unit_id = values[1];
                var unit = parseFloat(values[2]).toFixed(2);
                var qty =
                    values[3] === "null" || values[3] === "undefined"
                        ? 0
                        : parseFloat(values[3]);
                var price = values[4] === "null" ? 0 : parseFloat(values[4]);

                items.map((item, index) => {
                    if (index === id) {
                        item["item_id"] = ingredient_id;
                        item["qty"] = qty;
                        item.unit = unit;
                        item["price"] = price;

                        item.amount = item.qty * item.price;
                    }
                });

                editPO.grand_total = items
                    .map((item) => parseFloat(item.amount))
                    .reduce((a, b) => a + b, 0);
                setShowLoader(true);
            }

            if (name === "qty" || name === "price") {
                setShowLoader(true);
                items.map((item, index) => {
                    if (index === id) {
                        item[name] = value;

                        item.amount = parseFloat(item.qty * item.price);
                    }
                });
                editPO.grand_total = items
                    .map((item) => parseFloat(item.amount))
                    .reduce((a, b) => a + b, 0);
            } else {
                items.map((item, index) => {
                    if (index === id) {
                        item[name] = value;

                        item.amount = parseFloat(item.qty * item.price);
                    }
                });

                editPO.grand_total = items
                    .map((item) => parseFloat(item.amount))
                    .reduce((a, b) => a + b, 0);
            }
            if (name === "item_id") {
                itemsList?.map((data) => {
                    data.item_units.map((info) => {
                        if (value === info.item_id) {
                            if (info.current_qty < info.max) {
                                list[id]["qty"] = info?.max
                                    ? info?.max
                                    : 0 - info?.current_qty
                                    ? info?.current_qty
                                    : 0;
                            }

                            list[id]["unit"] = parseFloat(
                                info.inventory_unit
                            ).toFixed(2);
                            list[id]["price"] =
                                info.previous_item_price === null
                                    ? 0.0
                                    : parseFloat(
                                          info.previous_item_price
                                      ).toFixed(2);
                            list[id]["amount"] =
                                (info.max - info.current_qty) *
                                (info.previous_item_price === null
                                    ? 0.0
                                    : parseFloat(
                                          info.previous_item_price
                                      ).toFixed(2));
                        }
                    });
                });

                setItems(list);
            }

            if (name === "unit") {
                itemsList?.map((data) => {
                    data.item_units.map((info) => {
                        if (list[id]["item_id"] === info.item_id) {
                            if (value === info.inventory_unit) {
                                list[id]["price"] =
                                    info.info.previous_item_price === null
                                        ? 0.0
                                        : parseFloat(
                                              info.previous_item_price
                                          ).toFixed(2);
                                list[id]["amount"] =
                                    (info.max - info.current_qty) *
                                    (info.previous_item_price === null
                                        ? 0.0
                                        : parseFloat(
                                              info.previous_item_price
                                          ).toFixed(2));
                            }
                        }
                    });
                });

                setItems(list);
            } else {
                const list = [...items];
                list[id][e.name] = e.value;

                setItems(list);
            }

            setTimeout(() => setShowLoader(false), 1);
            setTimeout(() => setIsChanged(false), 1);

        }
    }

    function renderTable() {
        return (
            <Table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Current Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Amount</th>
                        <th>Remarks</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        return (
                            <tr key={item.id}>
                                <td>
                                    <Select
                                        options={itemsOptions}
                                        defaultValue={item.item_id}
                                        name="item_id"
                                        placeholder="Choose item"
                                        onChange={(e) =>
                                            handleItemChange(e, index, true)
                                        }
                                        search={true}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        name="qty"
                                        className="nc-modal-custom-input"
                                        value={item.qty}
                                        onChange={(e) =>
                                            handleItemChange(e, index, false)
                                        }
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="current_qty"
                                        className="nc-modal-custom-input"
                                        value={item.current_qty}
                                        disabled
                                    />
                                </td>
                                <td>
                                    <Form.Select
                                        name="unit"
                                        id={item.id}
                                        value={item.unit}
                                        onChange={(e) =>
                                            handleItemChange(e, index, false)
                                        }
                                    >
                                        <option value="">Select</option>
                                        {itemsList
                                            ?.filter(
                                                (info) =>
                                                    info.id === item.item_id ||
                                                    info.id ===
                                                        item.item_id?.value
                                            )
                                            .map((data) => {
                                                return data.item_units.map(
                                                    (info) => {
                                                        return (
                                                            <option
                                                                value={
                                                                    info.inventory_unit
                                                                }
                                                            >
                                                                {
                                                                    info.inventory_unit
                                                                }
                                                            </option>
                                                        );
                                                    }
                                                );
                                            })}
                                    </Form.Select>
                                </td>
                                <td className="row align-contents">
                                    <Col xs={2} className="align-middle">
                                        PHP
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="number"
                                            name="price"
                                            value={item.price}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    e,
                                                    index,
                                                    false
                                                )
                                            }
                                        />
                                        <InputError
                                            isValid={isError.price}
                                            message={"Price is required"}
                                        />
                                    </Col>
                                </td>
                                <td>PHP {numberFormat(item.amount)}</td>
                                <td>
                                    <Form.Control
                                        type="text"
                                        name="remarks"
                                        value={item.remarks}
                                        onChange={(e) =>
                                            handleItemChange(e, index, false)
                                        }
                                    />
                                </td>
                                <td>
                                    <img
                                        src={trash}
                                        onClick={() => handleRemoveItem(index)}
                                        className="cursor-pointer"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        );
    }

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"PURCHASES"}
                />
            </div>
            <div className={`container ${inactive ? "inactive" : "active"}`}>
                <div className="row">
                    <h1 className="page-title mb-4">EDIT PURCHASE ORDER</h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    <Row className="pt-3 mb-2">
                        <Col xs={6}>
                            <span className="edit-label">
                                Supplier Name{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={3}>
                            <span className="edit-label">
                                Purchase Date{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={3}>
                            <span className="edit-label">
                                Delivery Date{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Supplier..."
                                value={suppliersValue}
                                options={suppliers}
                                onChange={(e) => handleSelectChange(e)}
                            />
                            <InputError
                                isValid={isError.supplierName}
                                message={"Supplier Name is required"}
                            />
                            <div className="d-flex justify-content-end">
                                <span
                                    className="edit-label"
                                    style={{ color: "#df1227" }}
                                >
                                    Supplier Not Found?{" "}
                                    <a
                                        onClick={handleShowAddSupplierModal}
                                        className="add-supplier-label"
                                    >
                                        Click here to add supplier
                                    </a>
                                </span>
                            </div>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="date"
                                name="purchase_date"
                                className="nc-modal-custom-text"
                                value={editPO.purchase_date}
                                onChange={(e) => handlePOChange(e)}
                            />
                            <InputError
                                isValid={isError.purchase_date}
                                message={"Purchase date is required"}
                            />
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="date"
                                name="delivery_date"
                                className="nc-modal-custom-text"
                                value={editPO.delivery_date}
                                onChange={(e) => handlePOChange(e)}
                            />
                            <InputError
                                isValid={isError.delivery_date}
                                message={"delivery date is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 mb-2">
                        <Col xs={4}>
                            <span className="edit-label">
                                Branch
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">Forwarder</span>
                        </Col>
                        <Col xs={4}>
                            <span className="edit-label">
                                Requested by{" "}
                                <label className="badge-required">{` *`}</label>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Branch..."
                                value={branchValue}
                                options={branchList}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>

                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Forwarder..."
                                value={forwardersValue}
                                options={forwarders}
                                onChange={(e) => handleSelectChange(e)}
                            />
                        </Col>
                        <Col xs={4}>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select Forwarder..."
                                value={editPO.requisitioner}
                                options={employees}
                                onChange={(e) =>
                                    handleSelectChange(e, "requisitioner")
                                }
                            />
                            <InputError
                                isValid={isError.requisitioner}
                                message={"requisitioner is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 mb-2">
                        <Col xs={7}>
                            <span className="edit-label">
                                Delivery Address
                                <label className="badge-required">{` *`}</label>
                            </span>
                            <br />
                        </Col>
                        <Col xs={5}>
                            <span className="edit-label">
                                Remarks
                                <span className="edit-optional px-2">
                                    (Optional)
                                </span>
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={7}>
                            <Form.Control
                                type="text"
                                name="delivery_address"
                                className="nc-modal-custom-input"
                                value={editPO.delivery_address}
                                onChange={handleAddressChange}
                            />
                            <InputError
                                isValid={isError.delivery_address}
                                message={"Delivery Address is required"}
                            />
                        </Col>
                        <Col xs={5}>
                            <Form.Control
                                type="text"
                                name="remarks"
                                className="nc-modal-custom-input"
                                value={editPO.remarks}
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>
                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">
                            Purchased Items
                            <label className="badge-required">{` *`}</label>
                        </span>
                        <div className="edit-purchased-items">
                            {items.length === 0 ? (
                                <span>No Purchased Item Found!</span>
                            ) : (
                                renderTable()
                            )}
                            <InputError
                                isValid={isError.POItems}
                                message={
                                    "You must add at least 1 purchased item"
                                }
                            />
                        </div>
                        <div className="d-flex justify-content-end">
                            <span
                                className="edit-label"
                                style={{ color: "#df1227" }}
                            >
                                Item Not Found?{" "}
                                <a
                                    onClick={handleAddItem}
                                    className="add-supplier-label"
                                >
                                    Click here to add item
                                </a>
                            </span>
                        </div>
                    </Row>
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => AddItem()}>
                            Add Item
                        </Button>
                    </Row>

                    <Row className="align-right pt-3">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray">
                                    Subtotal
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3} className="text-end">
                                <span className="edit-label align-middle">
                                    {numberFormat(editPO.subtotal)}
                                </span>
                            </Col>
                        </Row>
                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Delivery/Service Fee
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="service_fee"
                                value={editPO.service_fee}
                                min={0}
                                step="0.01"
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>

                    <Row className="align-right pt-3">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray">
                                Discount
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle">PHP</span>
                        </Col>
                        <Col xs={3}>
                            <Form.Control
                                type="number"
                                name="discount"
                                value={editPO.discount}
                                min={0}
                                step="0.01"
                                className="align-middle nc-modal-custom-text"
                                onChange={(e) => handlePOChange(e)}
                            />
                        </Col>
                    </Row>

                    <Row className="align-right py-5">
                        <Col xs={2} className="text-end">
                            <span className="edit-label color-gray grand-total-text">
                                Grand Total
                            </span>
                        </Col>
                        <Col xs={1} className="text-end">
                            <span className="edit-label align-middle grand-total-text">
                                PHP
                            </span>
                        </Col>
                        <Col xs={3} className="text-end">
                            <span className="edit-label align-middle grand-total-text">
                                {"PHP " + numberFormat(editPO.grand_total)} 
                            </span>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Close
                        </button>
                        {type !== "for_approval" && (
                            <button
                                type="button"
                                className="button-tertiary me-3"
                                onClick={() => savePO()}
                            >
                                Save
                            </button>
                        )}
                        <button
                            type="button"
                            className="button-primary"
                            onClick={() => submitPO()}
                        >
                            {type === "for_approval" ? "Done" : "Submit"}
                        </button>
                    </div>
                </div>
            </div>

            <AddModal
                title="SUPPLIER"
                show={showAddSupplierModal}
                onHide={handleCloseAddSupplierModal}
                onSave={handleSaveSupplier}
            >
                <div className="mt-3 edit-form">
                    <Row className="nc-modal-custom-row mt-0">
                        <Col>
                            BIR NAME{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="bir_name"
                                value={supplierDetails.bir_name}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.bir_name}
                                message={"BIR name is required"}
                            />
                        </Col>
                        <Col>
                            TRADE NAME{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="trade_name"
                                value={supplierDetails.trade_name}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.trade_name}
                                message={"Trade name is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            BIR-REGISTERED ADDRESS
                            <Form.Control
                                type="text"
                                name="bir_address"
                                value={supplierDetails.bir_address}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                        <Col>
                            TRADE ADDRESS{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="trade_address"
                                value={supplierDetails.trade_address}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.trade_address}
                                message={"Trade address is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            TIN NUMBER{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="tin"
                                value={supplierDetails.tin}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.tin}
                                message={"Tin is required"}
                            />
                        </Col>
                        <Col>
                            BIR NUMBER
                            <Form.Control
                                type="text"
                                name="bir_number"
                                className="nc-modal-custom-input"
                                value={supplierDetails.bir_number}
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                        <Col xl={3}>
                            TERM (DAYS)
                            <Form.Control
                                type="text"
                                name="terms"
                                value={supplierDetails.terms}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col xl={4}>
                            CONTACT PERSON{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="contact_person"
                                value={supplierDetails.contact_person}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.contact_person}
                                message={"Contact Person is required"}
                            />
                        </Col>
                        <Col xl={4}>
                            PHONE NUMBER{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="text"
                                name="phone_no"
                                value={supplierDetails.phone_no}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.phone_no}
                                message={"Phone number is required"}
                            />
                        </Col>
                        <Col>
                            PAYEE{" "}
                            <label className="badge-required">{` *`}</label>
                            <Form.Control
                                type="email"
                                name="payee"
                                value={supplierDetails.payee}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                isValid={isError.payee}
                                message={"Payee is required"}
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            PRIMARY BANK NAME
                            <Form.Control
                                type="text"
                                name="bank_primary"
                                value={supplierDetails.bank_primary}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            PRIMARY ACCOUNT NO.
                            <Form.Control
                                type="number"
                                name="primary_account_no"
                                className="nc-modal-custom-input"
                                required
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                        <Col xl={5}>
                            PRIMARY ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="primary_account_name"
                                className="nc-modal-custom-input"
                                required
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            ALTERNATE BANK NAME
                            <Form.Control
                                type="text"
                                name="bank_alternate"
                                value={supplierDetails.bank_alternate}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                        <Col>
                            ALTERNATE ACCOUNT NO.
                            <Form.Control
                                type="number"
                                name="alternate_account_no"
                                className="nc-modal-custom-input"
                                required
                                value={supplierDetails.alternate_account_no}
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                            />
                        </Col>
                        <Col xl={5}>
                            ALTERNATE ACCOUNT NAME
                            <Form.Control
                                type="text"
                                name="alternate_account_name"
                                className="nc-modal-custom-input"
                                value={supplierDetails.alternate_account_name}
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="nc-modal-custom-row">
                        <Col xl={4}>
                            COMPANY EMAIL
                            <Form.Control
                                type="email"
                                name="email"
                                value={supplierDetails.email}
                                className="nc-modal-custom-input"
                                onChange={(e) =>
                                    setSupplierDetails({
                                        ...supplierDetails,
                                        [e.target.name]: e.target.value,
                                    })
                                }
                                required
                            />
                        </Col>
                    </Row>
                    <Row className="m-divider mt-3 mb-3"></Row>
                    <Row className="nc-modal-custom-row">
                        <Col>
                            REQUIREMENTS
                            <Form.Control
                                type="file"
                                multiple
                                name="requirements"
                                className="nc-modal-custom-input"
                                required
                            />
                        </Col>
                    </Row>
                </div>
            </AddModal>
        </div>
    );
}
