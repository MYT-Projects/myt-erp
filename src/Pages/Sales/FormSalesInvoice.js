import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";

// api
import { getAllBranches } from "../../Helpers/apiCalls/Purchases/purchaseOrderApi";
import { getAllItemsByBranch } from "../../Helpers/apiCalls/itemsApi";

// assets & styles
import {
    getTodayDateISO,
    numberFormat,
    refreshPage,
    toastStyle,
} from "../../Helpers/Utils/Common";
import trash from "./../../Assets/Images/trash.png";
import Navbar from "../../Components/Navbar/Navbar";
import "../Purchases/PurchaseOrders/PurchaseOrders.css";
import "./SalesInvoice.css";
import { Fragment } from "react";
import {
    createSalesInvoice,
    getAllFranchisee,
    getSingleFranchisee,
    getSingleSalesInvoice,
    paySalesInvoice,
    updatePaymentSalesInvoice,
    updateSalesInvoice,
    recordStatusInvoice,
    getAllSaleItemsByBranch,
} from "../../Helpers/apiCalls/franchiseeApi";
import { getAllEmployees } from "../../Helpers/apiCalls/employeesApi";
import { getSingleBranch } from "../../Helpers/apiCalls/branchApi";
import { getAllBanks } from "../../Helpers/apiCalls/banksAPi";
import { validateFranchiseSale } from "../../Helpers/Validation/Franchise/FranchiseSaleValidation";
import InputError from "../../Components/InputError/InputError";
import ReactLoading from "react-loading";

/**
 *  -- COMPONENT: FORM TO ADD OR EDIT FRANCHISEE SALES INVOICE - ORDER REQUEST
 *  -- You cannot create payment in this form yet. That would be done after submitting this order request form
 */
function FormSalesInvoice({ add, edit, process, createinvoice }) {
    let navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [isChanged, setIsChanged] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    /**
     *  @franchisee_sale_id - param for edit purchase invoice form
     */
    const { franchisee_sale_id } = useParams();
    const [franchiseeInvoice, setFranchiseeInvoice] = useState({
        franchisee_id: "",
        sales_date: add ? getTodayDateISO() : "",
        order_request_date: add ? getTodayDateISO() : "",
        payment_date: (process || createinvoice) ? getTodayDateISO() : "",
        deposit_date: (process || createinvoice) ? getTodayDateISO() : "",
        delivery_date: "",
        seller_branch_id: "",
        buyer_branch_id: "",
        sales_invoice_no: "",
        franchise_order_no: "",
        transfer_slip_no: "",
        address: "",
        remarks: "",
        sales_staff: "",
        item_ids: [],
        units: [],
        prices: [],
        quantities: [],
        discounts: [],
        buyer_branch_addr: "",
        seller_branch_addr: "",
        ship_via: "",
        payment_type: "cash",
        paid_amount: "",
    });

    // DATA HANDLERS
    const [banks, setBanks] = useState([]);
    const [depositedTo, setDepositedTo] = useState([]);
    const [salesStaff, setSalesStaff] = useState([]);
    const [sellerBranches, setSellerBranches] = useState([]);
    const [buyerBranches, setBuyerBranches] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [prices, setPrices] = useState([]);
    const [exceed, setExceed] = useState(false);
    const [additionalItemList, setAdditionalItemList] = useState([]);
    const [showLoader, setShowLoader] = useState(false);

    // SELECT DROPSEARCH HANDLERS
    const [bankValue, setBankValue] = useState({
        name: "from_bank_id",
        label: "",
        value: "",
    });
    const [depositedToValue, setDepositedToValue] = useState({
        name: "to_bank_id",
        label: "",
        value: "",
    });
    const [buyerBranchValue, setBuyerBranchValue] = useState({
        name: "buyer_branch_id",
        label: "",
        value: "",
    });
    const [sellerBranchValue, setSellerBranchValue] = useState({
        name: "seller_branch_id",
        label: "",
        value: "",
    });
    const [salesStaffValue, setSalesStaffValue] = useState({
        name: "sales_staff",
        label: "",
        value: "",
    });

    //ERROR HANDLING
    const [isError, setIsError] = useState({
        franchisee_id: false,
        delivery_address: false,
        delivery_date: false,
        seller_branch_id: false,
        sales_invoice_no: false,
        list: false,
    });

    function handleSelectChange(e) {
        var newList = franchiseeInvoice;
        newList[e.name] = e.value;

        switch (e.name) {
            case "from_bank_id":
                setBankValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                newList.from_bank_id = e.value;
                break;
            case "to_bank_id":
                setDepositedToValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                newList.to_bank_id = e.value;
                break;
            case "seller_branch_id":
                setSellerBranchValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                if (e.value === "1") {
                    setSalesStaffValue({
                        name: "sales_staff",
                        label: "Antonette Varona",
                        value: "4",
                    });
                    newList.sales_staff = "4";
                } else if (e.value === "2") {
                    setSalesStaffValue({
                        name: "sales_staff",
                        label: "Maria Angelica Colis",
                        value: "7",
                    });
                    newList.sales_staff = "7";
                } else {
                    setSalesStaffValue({
                        name: "sales_staff",
                        label: "Frederick Rodrigo",
                        value: "11",
                    });
                    newList.sales_staff = "11";
                }

                break;
            case "buyer_branch_id":
                setBuyerBranchValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                var val = e.value.split("|");
                newList.franchisee_id = val[0];
                newList.buyer_branch_id = val[1];
                break;
            case "sales_staff":
                setSalesStaffValue({
                    name: e.name,
                    label: e.label,
                    value: e.value,
                });
                break;
        }
        setFranchiseeInvoice(newList);
    }

    function handleCreateInvoice(e) {
        const newList = { ...franchiseeInvoice };
        const { name, value } = e.target;
        newList[name] = value;
        if (name === "service_fee" || name === "delivery_fee") {
            setIsChanged(!isChanged);
        }
        setFranchiseeInvoice(newList);
    }

    /**
     *  ORDER ITEMS
     */
    const [orderItems, setOrderItems] = useState([]);
    function addNewOrder() {
        const newItem = {
            qty: "",
            unit: "",
            name: "",
            item_id: "",
            priceValue: "",
            price: "0.00",
            unit_discount: "0.00",
            total: "0.00",
        };
        setOrderItems((oldItems) => [...oldItems, newItem]);
    }
    function deleteOrder(row) {
        setIsChanged(true);

        console.log(row)
        const updatedOrderList = [...orderItems];
        updatedOrderList.splice(row, 1);
        setOrderItems(updatedOrderList);

        setTimeout(() => setIsChanged(false), 10);
    }
    console.log(orderItems)
    function handleOrderItemsChange(e, row, type) {
        setIsChanged(true);
        var temp = orderItems;
        if (type === "item_id") {
            temp[row].item_id = { label: e.label, value: e.value };
            temp[row].price = e.price_1;
            temp[row].unit = e.unit;
            temp[row].name = null;
            temp[row].current_qty = e.current_qty;
            temp[row].priceValue = { label: e.price_1, value: e.price_1 };

            setPrices([
                { name: "price", label: e.price_1, value: e.price_1 },
                { name: "price", label: e.price_2, value: e.price_2 },
                { name: "price", label: e.price_3, value: e.price_3 },
            ])
            var subtotal =
                temp[row].qty && temp[row].price
                    ? parseFloat(
                            parseInt(temp[row].qty) *
                                parseFloat(temp[row].price)
                        ).toString()
                    : "0.00";
                temp[row].exceed = false;
                if (temp[row].unit_discount) {
                temp[row].total = (
                    parseFloat(subtotal) -
                    parseFloat(temp[row].unit_discount)
                ).toString();
            } else {
                temp[row].total = subtotal;
            }
        } else if (type === "prices") {
            temp[row].priceValue = { label: e.label, value: e.value };
            temp[row].price = e.value;

            if (parseInt(temp[row].qty) > parseInt(temp[row].current_qty)) {
                toast.error(
                    "Quantity exceeds current inventory quantity.",
                    {
                        style: toastStyle(),
                    }
                );
                toast.error(
                    temp[row].item_id.label +
                        " current quantity: " +
                        temp[row].current_qty,
                    {
                        style: toastStyle(),
                    }
                );
                setExceed(true);
                var subtotal =
                    temp[row].qty && temp[row].price
                        ? parseFloat(
                              parseInt(temp[row].qty) *
                                  parseFloat(temp[row].price)
                          ).toString()
                        : "0.00";
                    temp[row].exceed = true;
                    if (temp[row].unit_discount) {
                    temp[row].total = (
                        parseFloat(subtotal) -
                        parseFloat(temp[row].unit_discount)
                    ).toString();
                } else {
                    temp[row].total = subtotal;
                }
                setExceed(true);
            } else {
                var subtotal =
                    temp[row].qty && temp[row].price
                        ? parseFloat(
                              parseInt(temp[row].qty) *
                                  parseFloat(temp[row].price)
                          ).toString()
                        : "0.00";
                    temp[row].exceed = false;
                    if (temp[row].unit_discount) {
                    temp[row].total = (
                        parseFloat(subtotal) -
                        parseFloat(temp[row].unit_discount)
                    ).toString();
                } else {
                    temp[row].total = subtotal;
                }
                setExceed(false);
            }
        } else {
            const { name, value } = e.target;
            temp[row][name] = value;
            if (
                name === "qty" ||
                name === "unit_discount"
            ) {
                if (parseInt(temp[row].qty) > parseInt(temp[row].current_qty)) {
                    toast.error(
                        "Quantity exceeds current inventory quantity.",
                        {
                            style: toastStyle(),
                        }
                    );
                    toast.error(
                        temp[row].item_id.label +
                            " current quantity: " +
                            temp[row].current_qty,
                        {
                            style: toastStyle(),
                        }
                    );
                    setExceed(true);
                    var subtotal =
                        temp[row].qty && temp[row].price
                            ? parseFloat(
                                parseInt(temp[row].qty) *
                                    parseFloat(temp[row].price)
                            ).toString()
                            : "0.00";
                        temp[row].exceed = true;
                        if (temp[row].unit_discount) {
                        temp[row].total = (
                            parseFloat(subtotal) -
                            parseFloat(temp[row].unit_discount)
                        ).toString();
                    } else {
                        temp[row].total = subtotal;
                    }
                    setExceed(true);
                } else {
                    var subtotal =
                        temp[row].qty && temp[row].price
                            ? parseFloat(
                                parseInt(temp[row].qty) *
                                    parseFloat(temp[row].price)
                            ).toString()
                            : "0.00";
                        temp[row].exceed = false;
                        if (temp[row].unit_discount) {
                        temp[row].total = (
                            parseFloat(subtotal) -
                            parseFloat(temp[row].unit_discount)
                        ).toString();
                    } else {
                        temp[row].total = subtotal;
                    }
                    setExceed(false);
                }
            }
            if (name === "unit") {
                var itemInfo = allItems?.filter(
                    (info) => info.id === temp[row].item_id
                );
                var unitInfo = itemInfo[0].item_units?.filter(
                    (info) => info.inventory_unit === value
                );
                temp[row].price = unitInfo[0].previous_item_price;
            }
            
        }
        setOrderItems(temp);
        setTimeout(() => setIsChanged(false), 1);
    }


    async function handleSubmitInvoice() {
        if (isClicked) {
            return;
        }
        if (validateFranchiseSale(franchiseeInvoice, orderItems, additionalItemList, setIsError)) {
            setIsClicked(true);
            const response = await createSalesInvoice(
                orderItems,
                additionalItemList,
                franchiseeInvoice
            );
            if (response.data) {
                if (response.data.status === "error") {
                    toast.error(response.data.response, {
                        style: toastStyle(),
                    });
                    setTimeout(() => refreshPage(), 1000);
                } else if (response.data.status === "success") {
                    toast.success("Successfully created order request", {
                        style: toastStyle(),
                    });
                    setTimeout(() => navigate("/salesinvoice"), 1000);
                }
            } else {
                var errMsg = response.error.response;
                toast.error(errMsg, { style: toastStyle() });
                setIsClicked(false);
            }
            setIsClicked(false);
            
        } else {
            toast.error(
                "Please fill in all fields and check if order quantity is greater than 0",
                { style: toastStyle() }
            );
        }

    }
    async function handleUpdatePI() {
        setIsClicked(true);
        const response = await updateSalesInvoice(
            franchisee_sale_id,
            orderItems,
            additionalItemList,
            franchiseeInvoice
        );
        if (response.data?.status === "success") {
            toast.success("Successfully updated sales invoice", {
                style: toastStyle(),
            });
            setTimeout(
                () => navigate("/salesinvoice/print/" + franchisee_sale_id),
                1000
            );
        } else if (response.error) {
            toast.error("Error updating sales invoice", {
                style: toastStyle(),
            });
            setIsClicked(false);
        }
        setIsClicked(false);
    }

    console.log(franchiseeInvoice)
    async function handleProcess() {
        //if naay payment
        if(parseFloat(franchiseeInvoice.paid_amount) !== 0) {
            //if ang payment kay equal sa grand total, mo update siya
            if(parseFloat(franchiseeInvoice.paid_amount) === parseFloat(franchiseeInvoice.grand_total)) {
                console.log("with payment | paid amount equals grand total - ok")
                setIsClicked(true);
                const response = await updateSalesInvoice(
                    franchisee_sale_id,
                    orderItems,
                    additionalItemList,
                    franchiseeInvoice
                );
                if (response.data) {
                    toast.success(
                        "Successfully processed quotation",
                        {
                            style: toastStyle(),
                        }
                    );
                    setTimeout(
                        () =>
                            navigate(
                                "/salesinvoice"
                            ),
                        1000
                    );
                } else if (response.error) {
                    toast.error("Error updating sales invoice", {
                        style: toastStyle(),
                    });
                }
                setIsClicked(false);
            } else if (parseFloat(franchiseeInvoice.paid_amount) < parseFloat(franchiseeInvoice.grand_total)) {
                console.log("paid amount is less than grand total")
                //if less than ang payment sa grand total, dapat grand_total - paid_amount is less than or equal to credit limit
                if((parseFloat(franchiseeInvoice.grand_total) - parseFloat(franchiseeInvoice.paid_amount)) <= parseFloat(franchiseeInvoice.current_credit_limit)) {
                    console.log("with payment | grand total - paid amount <= credit limit - ok")
                    setIsClicked(true);
                    const response = await updateSalesInvoice(
                        franchisee_sale_id,
                        orderItems,
                        additionalItemList,
                        franchiseeInvoice
                    );
                    if (response.data) {
                        toast.success(
                            "Successfully processed quotation",
                            {
                                style: toastStyle(),
                            }
                        );
                        setTimeout(
                            () =>
                                navigate(
                                    "/salesinvoice"
                                ),
                            1000
                        );
                    } else if (response.error) {
                        toast.error("Error updating sales invoice", {
                            style: toastStyle(),
                        });
                    }
                    setIsClicked(false);
                } else {
                    console.log("grand total - paid amount > credit limit - not ok")
                    toast.error(
                        "Exceeds credit limit",
                        { style: toastStyle() }
                    );
                }
            }
        } else {
            if(parseFloat(franchiseeInvoice.grand_total) <= parseFloat(franchiseeInvoice.current_credit_limit)) {
                console.log("no payment | grand total <= credit limit - ok")
                setIsClicked(true);
                const response = await updateSalesInvoice(
                    franchisee_sale_id,
                    orderItems,
                    additionalItemList,
                    franchiseeInvoice
                );
                if (response.data) {
                    toast.success(
                        "Successfully processed quotation",
                        {
                            style: toastStyle(),
                        }
                    );
                    setTimeout(
                        () =>
                            navigate(
                                "/salesinvoice"
                            ),
                        1000
                    );
                } else if (response.error) {
                    toast.error("Error updating sales invoice", {
                        style: toastStyle(),
                    });
                }
                setIsClicked(false);
            } else {
                console.log("no payment | grand total > credit limit - not ok")

                toast.error(
                    "Exceeds credit limit",
                    { style: toastStyle() }
                );
            }
        }
        // if((parseFloat(franchiseeInvoice.balance) <= parseFloat(franchiseeInvoice.current_credit_limit)) && parseFloat(franchiseeInvoice.paid_amount) === 0) { //checking if amount exceeds cred limit
        //     setIsClicked(true);
        //     const response = await updateSalesInvoice(
        //         franchisee_sale_id,
        //         orderItems,
        //         additionalItemList,
        //         franchiseeInvoice
        //     );
        //     if (response.data) {
        //         toast.success(
        //             "Successfully processed quotation",
        //             {
        //                 style: toastStyle(),
        //             }
        //         );
        //         setTimeout(
        //             () =>
        //                 navigate(
        //                     "/salesinvoice"
        //                 ),
        //             1000
        //         );
        //     } else if (response.error) {
        //         toast.error("Error updating sales invoice", {
        //             style: toastStyle(),
        //         });
        //     }
        //     setIsClicked(false);
        // } else if(parseFloat(franchiseeInvoice.balance) === parseFloat(franchiseeInvoice.paid_amount)){ //payment === total
        //     setIsClicked(true);
        //     const response = await updateSalesInvoice(
        //         franchisee_sale_id,
        //         orderItems,
        //         additionalItemList,
        //         franchiseeInvoice
        //     );
        //     if (response.data) {
        //         toast.success(
        //             "Successfully processed quotation",
        //             {
        //                 style: toastStyle(),
        //             }
        //         );
        //         setTimeout(
        //             () =>
        //                 navigate(
        //                     "/salesinvoice"
        //                 ),
        //             1000
        //         );
        //     } else if (response.error) {
        //         toast.error("Error updating sales invoice", {
        //             style: toastStyle(),
        //         });
        //     }
        //     setIsClicked(false);
        // } else if ((parseFloat(franchiseeInvoice.balance) >= parseFloat(franchiseeInvoice.current_credit_limit)) && parseFloat(franchiseeInvoice.paid_amount) !== 0){ //naay payment
        //     if(parseFloat(franchiseeInvoice.current_credit_limit) + parseFloat(franchiseeInvoice.paid_amount) >= parseFloat(franchiseeInvoice.balance)){ //if naay payment pero gamay ra, dapat dako pa sa grand total ang cred limit + paid_amount
        //         setIsClicked(true);
        //         const response = await updateSalesInvoice(
        //             franchisee_sale_id,
        //             orderItems,
        //             additionalItemList,
        //             franchiseeInvoice
        //         );
        //         if (response.data) {
        //             toast.success(
        //                 "Successfully processed quotation",
        //                 {
        //                     style: toastStyle(),
        //                 }
        //             );
        //             setTimeout(
        //                 () =>
        //                     navigate(
        //                         "/salesinvoice"
        //                     ),
        //                 1000
        //             );
        //         } else if (response.error) {
        //             toast.error("Error updating sales invoice", {
        //                 style: toastStyle(),
        //             });
        //         }
        //         setIsClicked(false);
        //     } else {
        //         setIsClicked(false);
        //         toast.error(
        //             "Grand total exceeds credit limit",
        //             { style: toastStyle() }
        //         );
        //     }
        // } else if ((parseFloat(franchiseeInvoice.balance) <= parseFloat(franchiseeInvoice.current_credit_limit)) && parseFloat(franchiseeInvoice.paid_amount) !== 0){
        //     if(parseFloat(franchiseeInvoice.current_credit_limit) + parseFloat(franchiseeInvoice.paid_amount) >= parseFloat(franchiseeInvoice.balance)){
        //         setIsClicked(true);
        //         const response = await updateSalesInvoice(
        //             franchisee_sale_id,
        //             orderItems,
        //             additionalItemList,
        //             franchiseeInvoice
        //         );
        //         if (response.data) {
        //             toast.success(
        //                 "Successfully processed quotation",
        //                 {
        //                     style: toastStyle(),
        //                 }
        //             );
        //             setTimeout(
        //                 () =>
        //                     navigate(
        //                         "/salesinvoice"
        //                     ),
        //                 1000
        //             );
        //         } else if (response.error) {
        //             toast.error("Error updating sales invoice", {
        //                 style: toastStyle(),
        //             });
        //         }
        //         setIsClicked(false);
        //     } else {
        //         setIsClicked(false);
        //         toast.error(
        //             "Balance exceeds credit limit",
        //             { style: toastStyle() }
        //         );
        //     }
        // } else {
        //     toast.error(
        //         "Balance exceeds credit limit",
        //         { style: toastStyle() }
        //     );
        // }
    }

    async function handleCreateInvoiceBtn() {
        if(franchiseeInvoice.payment_status === "closed_bill") {
            setIsClicked(true);
            const response = await updateSalesInvoice(
                franchisee_sale_id,
                orderItems,
                additionalItemList,
                franchiseeInvoice
            );
            if (response.data) {
                const record = await recordStatusInvoice(franchisee_sale_id, "invoiced");
                if(record.data) {
                    toast.success(
                        "Successfully created invoice",
                        {
                            style: toastStyle(),
                        }
                    );
                    setTimeout(
                        () =>
                            navigate(
                                "/salesinvoice/print/" + franchisee_sale_id
                            ),
                        1000
                    );
                }
            } else if (response.error) {
                toast.error("Error updating sales invoice", {
                    style: toastStyle(),
                });
            }
            setIsClicked(false);
        }
        else {
            //if naay payment
            if(parseFloat(franchiseeInvoice.paid_amount) !== 0) {
                //if ang payment kay equal sa grand total, mo update siya
                if(parseFloat(franchiseeInvoice.paid_amount) === parseFloat(franchiseeInvoice.grand_total)) {
                    console.log("with payment | paid amount equals grand total - ok")
                    setIsClicked(true);
                    const response = await updateSalesInvoice(
                        franchisee_sale_id,
                        orderItems,
                        additionalItemList,
                        franchiseeInvoice
                    );
                    if (response.data) {
                        const record = await recordStatusInvoice(franchisee_sale_id, "invoiced"); 
                        if(record.data) {
                            toast.success(
                                "Successfully created invoice",
                                {
                                    style: toastStyle(),
                                }
                            );
                            setTimeout(
                                () =>
                                    navigate(
                                        "/salesinvoice/print/" + franchisee_sale_id
                                    ),
                                1000
                            );
                        }
                    } else if (response.error) {
                        toast.error("Error updating sales invoice", {
                            style: toastStyle(),
                        });
                    }
                    setIsClicked(false);
                } else if (parseFloat(franchiseeInvoice.paid_amount) < parseFloat(franchiseeInvoice.grand_total)) {
                    console.log("paid amount is less than grand total")
                    //if less than ang payment sa grand total, dapat grand_total - paid_amount is less than or equal to credit limit
                    if((parseFloat(franchiseeInvoice.grand_total) - parseFloat(franchiseeInvoice.paid_amount)) <= parseFloat(franchiseeInvoice.current_credit_limit)) {
                        console.log("with payment | grand total - paid amount <= credit limit - ok")
                        setIsClicked(true);
                        const response = await updateSalesInvoice(
                            franchisee_sale_id,
                            orderItems,
                            additionalItemList,
                            franchiseeInvoice
                        );
                        if (response.data) {
                            const record = await recordStatusInvoice(franchisee_sale_id, "invoiced"); 
                            if(record.data) {
                                toast.success(
                                    "Successfully created invoice",
                                    {
                                        style: toastStyle(),
                                    }
                                );
                                setTimeout(
                                    () =>
                                        navigate(
                                            "/salesinvoice/print/" + franchisee_sale_id
                                        ),
                                    1000
                                );
                            }
                        } else if (response.error) {
                            toast.error("Error updating sales invoice", {
                                style: toastStyle(),
                            });
                        }
                        setIsClicked(false);
                    } else {
                        console.log("grand total - paid amount > credit limit - not ok")
                        toast.error(
                            "Exceeds credit limit",
                            { style: toastStyle() }
                        );
                    }
                }
            } else {
                if(parseFloat(franchiseeInvoice.grand_total) <= parseFloat(franchiseeInvoice.current_credit_limit)) {
                    console.log("no payment | grand total <= credit limit - ok")
                    setIsClicked(true);
                    const response = await updateSalesInvoice(
                        franchisee_sale_id,
                        orderItems,
                        additionalItemList,
                        franchiseeInvoice
                    );
                    if (response.data) {
                        const record = await recordStatusInvoice(franchisee_sale_id, "invoiced"); 
                        if(record.data) {
                            toast.success(
                                "Successfully created invoice",
                                {
                                    style: toastStyle(),
                                }
                            );
                            setTimeout(
                                () =>
                                    navigate(
                                        "/salesinvoice/print/" + franchisee_sale_id
                                    ),
                                1000
                            );
                        }
                    } else if (response.error) {
                        toast.error("Error updating sales invoice", {
                            style: toastStyle(),
                        });
                    }
                    setIsClicked(false);
                } else {
                    console.log("no payment | grand total > credit limit - not ok")

                    toast.error(
                        "Exceeds credit limit",
                        { style: toastStyle() }
                    );
                }
            }
            // if((parseFloat(franchiseeInvoice.balance) <= parseFloat(franchiseeInvoice.current_credit_limit)) && parseFloat(franchiseeInvoice.paid_amount) === 0) { //checking if amount exceeds cred limit
            //     setIsClicked(true);
            //     const response = await updateSalesInvoice(
            //         franchisee_sale_id,
            //         orderItems,
            //         additionalItemList,
            //         franchiseeInvoice
            //     );
            //     if (response.data) {
            //         const record = await recordStatusInvoice(franchisee_sale_id, "invoiced"); 
            //         if(record.data) {
            //             toast.success(
            //                 "Successfully created invoice",
            //                 {
            //                     style: toastStyle(),
            //                 }
            //             );
            //             setTimeout(
            //                 () =>
            //                     navigate(
            //                         "/salesinvoice/print/" + franchisee_sale_id
            //                     ),
            //                 1000
            //             );
            //         }
            //     } else if (response.error) {
            //         toast.error("Error updating sales invoice", {
            //             style: toastStyle(),
            //         });
            //     }
            //     setIsClicked(false);

            // } else if ((parseFloat(franchiseeInvoice.balance) >= parseFloat(franchiseeInvoice.current_credit_limit)) && parseFloat(franchiseeInvoice.paid_amount) !== 0){
            //     if(parseFloat(franchiseeInvoice.current_credit_limit) + parseFloat(franchiseeInvoice.paid_amount) >= parseFloat(franchiseeInvoice.balance)){
            //         setIsClicked(true);
            //         const response = await updateSalesInvoice(
            //             franchisee_sale_id,
            //             orderItems,
            //             additionalItemList,
            //             franchiseeInvoice
            //         );
            //         if (response.data) {
            //             const record = await recordStatusInvoice(franchisee_sale_id, "invoiced");
            //             if(record.data) {
            //                 toast.success(
            //                     "Successfully created invoice",
            //                     {
            //                         style: toastStyle(),
            //                     }
            //                 );
            //                 setTimeout(
            //                     () =>
            //                         navigate(
            //                             "/salesinvoice/print/" + franchisee_sale_id
            //                         ),
            //                     1000
            //                 );
            //             }
            //         } else if (response.error) {
            //             toast.error("Error updating sales invoice", {
            //                 style: toastStyle(),
            //             });
            //         }
            //         setIsClicked(false);
            //     } else {
            //         toast.error(
            //             "Grand total exceeds credit limit",
            //             { style: toastStyle() }
            //         );
            //     }
            // } else if ((parseFloat(franchiseeInvoice.balance) <= parseFloat(franchiseeInvoice.current_credit_limit)) && parseFloat(franchiseeInvoice.paid_amount) !== 0){
            //     if(parseFloat(franchiseeInvoice.current_credit_limit) + parseFloat(franchiseeInvoice.paid_amount) >= parseFloat(franchiseeInvoice.balance)){
            //         setIsClicked(true);
            //         const response = await updateSalesInvoice(
            //             franchisee_sale_id,
            //             orderItems,
            //             additionalItemList,
            //             franchiseeInvoice
            //         );
            //         if (response.data) {
            //             const record = await recordStatusInvoice(franchisee_sale_id, "invoiced");
            //             if(record.data) {
            //                 toast.success(
            //                     "Successfully created invoice",
            //                     {
            //                         style: toastStyle(),
            //                     }
            //                 );
            //                 setTimeout(
            //                     () =>
            //                         navigate(
            //                             "/salesinvoice/print/" + franchisee_sale_id
            //                         ),
            //                     1000
            //                 );
            //             }
            //         setIsClicked(false);
            //         } else if (response.error) {
            //             toast.error("Error updating sales invoice", {
            //                 style: toastStyle(),
            //             });
            //         }
            //     } else {
            //         toast.error(
            //             "Balance exceeds credit limit",
            //             { style: toastStyle() }
            //         );
            //     }
            // } else {
            //     toast.error(
            //         "Balance exceeds credit limit",
            //         { style: toastStyle() }
            //     );
            // }
        }
        
    }

    const handleSubmit = () => {
        if (add) handleSubmitInvoice();
        else if (edit) handleUpdatePI();
        else if (process) handleProcess();
        else if (createinvoice) handleCreateInvoiceBtn();
    };

    /** FOR EDIT - Fetch Sales Invoice Details */
    async function fetchFranchiseeInvoice() {
        const response = await getSingleSalesInvoice(franchisee_sale_id);
        if (response.data) {
            var SI = response.data.data[0];
            SI.order_request_date = SI.order_request_date
            if(process || createinvoice) {
                SI.payment_type = "cash";
                SI.paid_amount = "0"
                SI.payment_date = getTodayDateISO()
                SI.deposit_date = getTodayDateISO()
            }

            var ordered_items = SI.franchisee_sale_items.map((item) => {
                var info = item;
                info.total =
                    parseFloat(item.price) * parseFloat(item.qty) -
                    parseFloat(item.discount);
                info.item_id = { label: item.item_name, value: item.item_id };
                info.priceValue = { label: item.price, value: item.price };
                if(item.item_id.value !== null) {
                    setOrderItems((prev) => [...prev, info]);
                } else if(item.item_id.value === null) {
                    info.name = item.item_name;
                    setAdditionalItemList((prev) => [...prev, info]);
                } 
                return info;
            });

            var _subtotal = ordered_items
                .map((item) => parseFloat(item.total))
                .reduce((a, b) => a + b, 0);

            SI.subtotal = _subtotal;

            setFranchiseeInvoice(SI);
            setBankValue({
                name: "bank_id",
                label: SI.bank_name,
                value: SI.bank_id,
            });
            setBuyerBranchValue({
                name: "buyer_branch_id",
                label: SI.buyer_branch_name,
                value: SI.buyer_branch_id,
            });
            setSellerBranchValue({
                name: "seller_branch_id",
                label: SI.seller_branch_name,
                value: SI.seller_branch_id,
            });
            setSalesStaffValue({
                name: "sales_staff",
                label: SI.sales_staff_name,
                value: SI.sales_staff,
            });
        }
    }

    function handleCreatePayment(e) {
        const paymentInfo = { ...franchiseeInvoice };
        const { name, value, id } = e.target;
        if (name === "service_fee" || name === "delivery_fee") {
            const paymentEdit = { ...franchiseeInvoice };
            paymentEdit[name] = value;
            setFranchiseeInvoice(paymentEdit);
            setIsChanged(!isChanged);
        }

        if (name === "to_bank_id" || name === "from_bank_id") {
            paymentInfo[name] = value;
        } else {
            paymentInfo[name] = value;
        }

        setFranchiseeInvoice(paymentInfo);
    }

    function handleAddNewRow() {
        const newItem = {
            item_id: { value: null},
            name: "",
            qty: "",
            unit_discount: "0",
            unit: "",
            price: "",
            type: "",
            se_id: "0",
        };
        setAdditionalItemList((oldItems) => [...oldItems, newItem]);
    }

    function handleDelRow(id) {
        setIsChanged(true);

        const newList = [...additionalItemList];
        newList.splice(id, 1);
        setAdditionalItemList(newList);

        setTimeout(() => setIsChanged(false), 1);
    }

    function handleAddTblChange(e, id) {
        setIsChanged(true);

        const { name, value } = e.target;
        var temp = additionalItemList;

        if (name === "qty" || name === "price") {
            temp.map((item, index) => {
                if (index === id) {
                    item[name] = value;
                    item.amount = item.qty * item.price;
                    item.total = item.qty * item.price;

                    return item;
                }
            });
        } else {
            temp.map((item, index) => {
                if (index === id) {
                    item[name] = value;
                    return item;
                }
            });
        }
        setAdditionalItemList(temp);
        setTimeout(() => setIsChanged(false), 1);

    }

    // FETCH API
    async function fetchAllFranchisees() {
        const response = await getAllFranchisee();
        var franchisees = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = franchisees.map((franchisee) => {
            var info = {};

            info.name = "buyer_branch_id";
            info.label = `${franchisee.name} (${franchisee.branch_name} Branch)`;
            info.value = `${franchisee.id}|${franchisee.branch_id}`;

            return info;
        });
        setBuyerBranches(cleanedArray);
    }

    async function fetchBranches() {
        setSellerBranches([])
        const response = await getAllBranches();

        if (response.data) {
            let result = response.data.data.map((a) => {
                if (a.is_franchise === "3" && a.id !== "5") {
                    var info = {};
                    info.name = "seller_branch_id";
                    info.label = a.name;
                    info.value = a.id;

                    setSellerBranches((prev) => [...prev, info]);
                }
            });
        }
    }

    async function fetchSalesStaff() {
        const response = await getAllEmployees();
        var employees = response.data.data.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );

        var cleanedArray = employees.map((employee) => {
            var info = {};

            info.name = "sales_staff";
            info.label = `${employee.first_name} ${employee.last_name}`;
            info.value = employee.id;

            return info;
        });
        setSalesStaff(cleanedArray);
    }
    async function fetchBanks() {
        const response = await getAllBanks();
        if (response.error) {
        } else {
            setBanks(response.data.data);
        }
    }
    async function fetchItemsByBranch(branch_id) {
        setAllItems([]);
        const response = await getAllSaleItemsByBranch(branch_id);

        if (response.response.status === "success") {
            var data = response.response.data
                .sort((a, b) =>
                    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                )
                .map((data, i) => {
                    return {
                        label: data.item_name,
                        value: data.item_id,
                        name: "item_id",
                        id: data.item_id,
                        unit: data.unit,
                        price_1: data.price_1,
                        price_2: data.price_2,
                        price_3: data.price_3,
                        current_qty: data.current_qty,
                    };
                });
            setAllItems(data);
        }
    }
    async function getFranchiseeAndBranchAddress() {
        console.log(buyerBranchValue)
        if(add) {
            const response = await getSingleFranchisee(buyerBranchValue.value.split("|")[0]);
            console.log(response)
            if (response.data) {
                var franchisee_name = response.data.data[0].name;
                var delivery_addr = response.data.data[0].address;
                var current_credit_limit = response.data.data[0].current_credit_limit;
                setFranchiseeInvoice((prev) => {
                    return {
                        ...prev,
                        franchisee_name: franchisee_name,
                        address: delivery_addr,
                        current_credit_limit: current_credit_limit,
                    };
                });
            }
        }
    }
    
    useEffect(() => {
        fetchItemsByBranch(sellerBranchValue.value);
    }, [sellerBranchValue]);

    useEffect(() => {
        getFranchiseeAndBranchAddress();
    }, [buyerBranchValue]);

    // FOR DYNAMIC CALCULATION
    useEffect(() => {

        var tempServiceFee = franchiseeInvoice.service_fee
            ? parseFloat(franchiseeInvoice.service_fee)
            : 0;
        var tempDeliveryFee = franchiseeInvoice.delivery_fee
            ? parseFloat(franchiseeInvoice.delivery_fee)
            : 0;

        var _subtotal = orderItems
            .map((item) => parseFloat(item.total))
            .reduce((a, b) => a + b, 0);

        var _subtotal2 = additionalItemList
            .map((item) => parseFloat(item.total))
            .reduce((a, b) => a + b, 0);

        var _grandTotal = _subtotal + _subtotal2 + tempServiceFee + tempDeliveryFee;
        var _itemsTotal = _subtotal + _subtotal2;
        setFranchiseeInvoice((prev) => {
            return {
                ...prev,
                subtotal: _itemsTotal.toFixed(2),
                grand_total: _grandTotal.toFixed(2),
            };
        });
    }, [isChanged]);

    // DATA FETCHING
    useEffect(() => {
        if (edit || process || createinvoice) {
            fetchFranchiseeInvoice();
            // getFranchiseeAndBranchAddress();
        }
        fetchBranches();
        fetchAllFranchisees();
        fetchSalesStaff();
        fetchBanks();
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"FRANCHISE"}
                />
            </div>

            <div className={`container ${inactive ? "inactive" : "active"}`}>
                {/* header */}
                <div className="d-flex justify-content-between align-items-center my-3 pb-4">
                    <h1 className="page-title mb-0">
                        {add ? "ADD ORDER QUOTATION (Franchisee Sales Invoice)"
                             : process ? "PROCESS ORDER QUOTATION (Franchisee Sales Invoice)"
                             : createinvoice ? "CREATE INVOICE"
                             : (edit && franchiseeInvoice.fs_status === "quoted") ? "EDIT ORDER QUOTATION (Franchisee Sales Invoice)"
                             : (edit && franchiseeInvoice.fs_status === "processing") ? "EDIT ORDER REQUEST (Franchisee Sales Invoice)"
                             : (edit && franchiseeInvoice.fs_status === "invoiced") ? "EDIT INVOICE (Franchisee Sales Invoice)" : ""
                        }
                    </h1>
                </div>

                {/* content */}
                <div className="edit-form">
                    {/* FRANCHISEE SALES INVOICE DETAILS */}
                    <Fragment>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Franchisee Branch
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">
                                    Available Credit Limit
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Sales Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select franchisee..."
                                    value={buyerBranchValue}
                                    options={buyerBranches}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                                <InputError
                                    isValid={isError.franchisee_id}
                                    message={"Franchisee Branch is required"}
                                />
                            </Col>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="current_credit_limit"
                                    defaultValue={franchiseeInvoice.current_credit_limit}
                                    className="nc-modal-custom-text"
                                    disabled
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="sales_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={franchiseeInvoice.sales_date}
                                    onChange={(e) => handleCreateInvoice(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Delivery Address
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">Order Date</span>
                                <span className="color-red"> *</span>
                            </Col>
                            <Col xs={3}>
                                <span className="edit-label">
                                    Delivery Date
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="delivery_address"
                                    defaultValue={franchiseeInvoice.address}
                                    className="nc-modal-custom-text"
                                    disabled
                                />
                                <InputError
                                    isValid={isError.delivery_address}
                                    message={"Franchisee Branch is required"}
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="order_request_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoice.order_request_date
                                    }
                                    onChange={(e) => handleCreateInvoice(e)}
                                />
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="date"
                                    name="delivery_date"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoice.delivery_date
                                    }
                                    onChange={(e) => handleCreateInvoice(e)}
                                />
                                <InputError
                                    isValid={isError.delivery_date}
                                    message={"Delivery date is required"}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Release From
                                    <span className="color-red"> *</span>
                                </span>
                            </Col>
                            <Col>
                                <span className="edit-label">Release By</span>
                            </Col>
                            <Col>
                                <span className="edit-label">Ship Via</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Branch..."
                                    value={sellerBranchValue}
                                    options={sellerBranches}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                                {/* <InputError
                                    isValid={isError.seller_branch_id}
                                    message={"Branch is required"}
                                /> */}
                            </Col>
                            <Col>
                                <Select
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Forwarder..."
                                    value={salesStaffValue}
                                    options={salesStaff}
                                    onChange={(e) => handleSelectChange(e)}
                                />
                            </Col>
                            <Col>
                                <select
                                    className="nc-modal-custom-select"
                                    name="ship_via"
                                    value={franchiseeInvoice.ship_via}
                                    onChange={(e) => handleCreateInvoice(e)}
                                >
                                    <option value="">Select...</option>
                                    <option value="pick_up">Pick Up</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                            </Col>
                        </Row>

                        <Row className="mt-4 mb-2">
                            {edit &&
                                franchiseeInvoice.franchisee_sale_payments
                                    ?.length !== 0 && (
                                    <>
                                        <Col>
                                            <span className="edit-label">
                                                Franchisee Invoice No.
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Franchisee Order Request No.
                                            </span>
                                        </Col>
                                    </>
                                )}
                            <Col>
                                <span className="edit-label">
                                    Transfer Slip No.
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            {edit &&
                                franchiseeInvoice.franchisee_sale_payments
                                    ?.length !== 0 && (
                                    <>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="sales_invoice_no"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.id
                                                }
                                                onChange={(e) =>
                                                    handleCreateInvoice(e)
                                                }
                                                disabled
                                            />
                                            <InputError
                                                isValid={isError.id}
                                                message={
                                                    "Sales invoice number is required"
                                                }
                                            />
                                        </Col>

                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="franchise_order_no"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.id
                                                }
                                                onChange={(e) =>
                                                    handleCreateInvoice(e)
                                                }
                                                required
                                                disabled
                                            />
                                        </Col>
                                    </>
                                )}
                            <Col>
                                <Form.Control
                                    type="text"
                                    name="transfer_slip_no"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoice.transfer_slip_no
                                    }
                                    onChange={(e) => handleCreateInvoice(e)}
                                />
                            </Col>
                        </Row>
                        <Row className="mt-4 mb-2">
                            <Col>
                                <span className="edit-label">
                                    Remarks
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Control
                                    type="textarea"
                                    name="remarks"
                                    className="nc-modal-custom-text"
                                    defaultValue={
                                        franchiseeInvoice.remarks
                                    }
                                    onChange={(e) => handleCreateInvoice(e)}
                                />
                            </Col>
                        </Row>
                    </Fragment>

                    {/* ORDER ITEMS */}
                    <Row className="mt-4 pt-3">
                        <Col>
                            <span className="edit-label mb-2">
                                Choose Items to Order
                                <span className="color-red"> *</span>
                            </span>
                            <div className="edit-purchased-items">
                                {orderItems.length !== 0 ? (
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th className="color-gray">
                                                    item
                                                </th>
                                                <th className="color-gray">
                                                    quantity
                                                </th>
                                                <th className="color-gray">
                                                    unit
                                                </th>
                                                <th className="color-gray">
                                                    price
                                                </th>
                                                <th className="color-gray">
                                                    total
                                                </th>
                                                <th className="color-gray">
                                                    actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item, index) => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <Select
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                placeholder="Select item..."
                                                                value={
                                                                    item.item_id
                                                                }
                                                                options={
                                                                    allItems
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index,
                                                                        "item_id"
                                                                    )
                                                                }
                                                            />
                                                            {item.exceed? <p></p> : ""}
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="qty"
                                                                value={
                                                                    item.qty
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                            {item.exceed? <h7 className="red">Quantity exceeds</h7> : ""}
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                name="unit"
                                                                value={
                                                                    item.unit
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                            {item.exceed? <p></p> : ""}
                                                        </td>

                                                        <td>
                                                            <Select
                                                                className="react-select-container"
                                                                classNamePrefix="react-select"
                                                                placeholder="Select price..."
                                                                value={
                                                                    item.priceValue
                                                                }
                                                                options={
                                                                    prices
                                                                }
                                                                onChange={(e) =>
                                                                    handleOrderItemsChange(
                                                                        e,
                                                                        index,
                                                                        "prices"
                                                                    )
                                                                }
                                                            />
                                                            {item.exceed? <p></p> : ""}
                                                        </td>
                                                        <td className="color-green">
                                                            {numberFormat(
                                                                item.total
                                                            )}
                                                            {item.exceed? <p></p> : ""}
                                                        </td>
                                                        <td className="text-center">
                                                            <img
                                                                src={trash}
                                                                onClick={() =>
                                                                    deleteOrder(
                                                                        index
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="entries-not-found">
                                        There is no ordered items yet.
                                    </div>
                                )}
                            </div>
                            <InputError
                                isValid={isError.list}
                                message={"Please add an item or additional item"}
                            />
                        </Col>
                    </Row>

                    {/* ADD ITEM BUTTON */}
                    <Row className="pt-3 PO-add-item">
                        <Button
                            type="button"
                            disabled={!franchiseeInvoice.seller_branch_id}
                            onClick={() => addNewOrder()}
                        >
                            Add Item
                        </Button>
                    </Row>

                    <Row className="mt-4 pt-3">
                        <span className="edit-label mb-2">
                            Additional Order Items
                        </span>
                        <div className="edit-purchased-items">
                            {additionalItemList.length !== 0 ? (
                                <Table>
                                    <thead>
                                        <tr>
                                            <th className="color-gray">item</th>
                                            <th className="color-gray">
                                                quantity
                                            </th>
                                            <th className="color-gray">unit</th>
                                            <th className="color-gray">
                                                unit price
                                            </th>
                                            <th className="color-gray">
                                                amount
                                            </th>
                                            <th className="color-gray">
                                                actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {additionalItemList.map(
                                            (item, index) => {
                                                return (
                                                    <tr>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                name="name"
                                                                value={
                                                                    item.name
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="qty"
                                                                value={
                                                                    item.qty
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="text"
                                                                name="unit"
                                                                value={
                                                                    item.unit
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <Form.Control
                                                                type="number"
                                                                name="price"
                                                                value={
                                                                    item.price
                                                                }
                                                                onChange={(e) =>
                                                                    handleAddTblChange(
                                                                        e,
                                                                        index
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td className="color-green">
                                                            {item.qty &&
                                                            item.price
                                                                ? numberFormat(
                                                                      item.price *
                                                                          item.qty
                                                                  )
                                                                : "0.00"}
                                                        </td>
                                                        <td className="text-center">
                                                            <img
                                                                src={trash}
                                                                onClick={() =>
                                                                    handleDelRow(
                                                                        index
                                                                    )
                                                                }
                                                                className="cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="entries-not-found">
                                    There is no additional purchased items
                                    recorded yet.
                                </div>
                            )}
                        </div>
                    </Row>

                    {/* ADD ITEM BUTTON */}
                    <Row className="pt-3 PO-add-item">
                        <Button type="button" onClick={() => handleAddNewRow()}>
                            Add Item
                        </Button>
                    </Row>

                    {/* SUBTOTAL, FREIGHT COST, DISCOUNT, & GRAND TOTAL */}
                    <Fragment>
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
                                    {numberFormat(franchiseeInvoice?.subtotal)}
                                </span>
                            </Col>
                        </Row>
                        <Row className="align-right pt-3">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray">
                                    Service Fee
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="number"
                                    name="service_fee"
                                    defaultValue={
                                        franchiseeInvoice?.service_fee
                                    }
                                    className="align-middle nc-modal-custom-text"
                                    onChange={(e) => {
                                        handleCreateInvoice(e);
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row className="align-right pt-3">
                            <Col xs={2} className="text-end">
                                <span className="edit-label color-gray">
                                    Delivery Fee
                                </span>
                            </Col>
                            <Col xs={1} className="text-end">
                                <span className="edit-label align-middle">
                                    PHP
                                </span>
                            </Col>
                            <Col xs={3}>
                                <Form.Control
                                    type="number"
                                    name="delivery_fee"
                                    defaultValue={
                                        franchiseeInvoice?.delivery_fee
                                    }
                                    className="align-middle nc-modal-custom-text"
                                    onChange={(e) => {
                                        handleCreateInvoice(e);
                                    }}
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
                                    {numberFormat(
                                        franchiseeInvoice?.grand_total
                                    )}
                                </span>
                            </Col>
                        </Row>
                        {((process || createinvoice) && franchiseeInvoice.payment_status !== "closed_bill" ) && (
                            <>
                                <Row className="align-right pt-3">
                                    <Col xs={2} className="text-end">
                                        <span className="edit-label color-gray">
                                            Payment Type
                                        </span>
                                    </Col>
                                    <Col xs={1} className="text-end"></Col>
                                    <Col xs={3}>
                                        <Form.Check
                                            inline
                                            label="Cash"
                                            name="payment_type"
                                            value="cash"
                                            type="radio"
                                            defaultChecked={
                                                franchiseeInvoice.payment_type ===
                                                "cash"
                                            }
                                            onClick={(e) => {
                                                handleCreatePayment(e);
                                            }}
                                        />
                                        <Form.Check
                                            inline
                                            label="Check"
                                            name="payment_type"
                                            type="radio"
                                            value="check"
                                            defaultChecked={
                                                franchiseeInvoice.payment_type ===
                                                "check"
                                            }
                                            onClick={(e) => {
                                                handleCreatePayment(e);
                                            }}
                                        />
                                        <Form.Check
                                            inline
                                            label="Others"
                                            name="payment_type"
                                            value="others"
                                            defaultChecked={
                                                franchiseeInvoice.payment_type ===
                                                "others"
                                            }
                                            type="radio"
                                            onClick={(e) => {
                                                handleCreatePayment(e);
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row className="align-right pt-3">
                                    <Col xs={2} className="text-end">
                                        <span className="edit-label color-gray">
                                            Paid Amount
                                            <span className="color-red">
                                                {" "}
                                                *
                                            </span>
                                        </span>
                                    </Col>
                                    <Col xs={1} className="text-end">
                                        <span className="edit-label align-middle">
                                            PHP
                                        </span>
                                    </Col>
                                    <Col xs={3}>
                                        <Form.Control
                                            type="number"
                                            name="paid_amount"
                                            defaultValue={
                                                franchiseeInvoice.paid_amount
                                            }
                                            className="align-middle nc-modal-custom-text"
                                            onChange={(e) =>
                                                handleCreatePayment(e)
                                            }
                                        />
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Fragment>

                    {((process || createinvoice) && franchiseeInvoice.payment_status !== "closed_bill" ) && (
                        <>
                            {franchiseeInvoice.payment_type ===
                                "cash" && (
                                <>
                                    <div className="mt-5"></div>
                                    <hr />
                                    <div className="payment-header-wrapper mb-5">
                                        <h5 className="payment-header">
                                            Payment Details
                                        </h5>
                                    </div>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Payment Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="date"
                                                name="payment_date"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.payment_date
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.payment_date}
                                                message={
                                                    "Payment date is required"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Invoice Number
                                                <label className="badge-required">{` *`}</label>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="invoice_no"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.invoice_no
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.invoice_no}
                                                message={
                                                    "Invoice Number is required"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Deposit Date
                                                <span className="color-red"> *</span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="date"
                                                name="deposit_date"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.deposit_date
                                                }
                                                onChange={(e) => handleCreatePayment(e)}
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Deposited To
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                name="to_bank_id"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.to_bank_id
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            >
                                                <option value="">
                                                    Select a bank...
                                                </option>
                                                {banks.map((data) => {
                                                    return (
                                                        <option value={data.id}>
                                                            {data.bank_name}
                                                        </option>
                                                    );
                                                })}
                                            </Form.Select>
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Term (days)
                                                <span className="edit-optional px-2">
                                                    (Optional)
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="term_day"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.term_day
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Remarks
                                                <span className="edit-optional px-2">
                                                    (Optional)
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                as="textarea"
                                                name="payment_remarks"
                                                defaultValue={
                                                    franchiseeInvoice.payment_remarks
                                                }
                                                className="nc-modal-custom-text"
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* CHECK PAYMENT DETAILS */}
                            {franchiseeInvoice.payment_type ===
                                "check" && (
                                <>
                                    <div className="mt-5"></div>
                                    <hr />
                                    <div className="payment-header-wrapper mb-5">
                                        <h5 className="payment-header">
                                            Payment Details
                                        </h5>
                                    </div>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Payment Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Invoice Number
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Check Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="date"
                                                name="payment_date"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.payment_date
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="invoice_no"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.invoice_no
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.invoice_no}
                                                message={
                                                    "Invoice Number is required"
                                                }
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="date"
                                                name="cheque_date"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.cheque_date
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.cheque_date}
                                                message={
                                                    "Check date is required"
                                                }
                                            />
                                        </Col>
                                    </Row>

                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Bank Name
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Check Number
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="bank_name"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.bank_name
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.bank_name}
                                                message={"Bank is required"}
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="cheque_number"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.cheque_number
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={isError.cheque_number}
                                                message={
                                                    "Check number is required"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Deposited To
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                name="to_bank_id"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.to_bank_id
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            >
                                                <option value="">
                                                    Select a bank...
                                                </option>
                                                {banks.map((data) => {
                                                    return (
                                                        <option value={data.id}>
                                                            {data.bank_name}
                                                        </option>
                                                    );
                                                })}
                                            </Form.Select>
                                            <InputError
                                                isValid={isError.to_bank_id}
                                                message={
                                                    "Check number is required"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Term (days)
                                                <span className="edit-optional px-2">
                                                    (Optional)
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="term_day"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.term_day
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Remarks
                                                <span className="edit-optional px-2">
                                                    (Optional)
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                as="textarea"
                                                name="payment_remarks"
                                                defaultValue={
                                                    franchiseeInvoice.payment_remarks
                                                }
                                                className="nc-modal-custom-text"
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}

                            {/* OTHERS PAYMENT DETAILS */}
                            {franchiseeInvoice.payment_type ===
                                "others" && (
                                <>
                                    <div className="mt-5"></div>
                                    <hr />
                                    <div className="payment-header-wrapper mb-5">
                                        <h5 className="payment-header">
                                            Payment Details
                                        </h5>
                                    </div>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Payment Date
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="date"
                                                name="payment_date"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.payment_date
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Invoice Number
                                                <label className="badge-required">{` *`}</label>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="invoice_no"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.invoice_no
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Reference Number
                                                <label className="badge-required">{` *`}</label>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="reference_number"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.reference_number
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                            <InputError
                                                isValid={
                                                    isError.reference_number
                                                }
                                                message={
                                                    "Reference number is required"
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Payment Description
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="payment_remarks"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.payment_remarks
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Deposited To
                                                <span className="color-red">
                                                    {" "}
                                                    *
                                                </span>
                                            </span>
                                        </Col>
                                        <Col>
                                            <span className="edit-label">
                                                Term (days)
                                                <span className="edit-optional px-2">
                                                    (Optional)
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Select
                                                type="text"
                                                name="to_bank_id"
                                                className="nc-modal-custom-text"
                                                value={
                                                    franchiseeInvoice.to_bank_id
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            >
                                                <option value="">
                                                    Select a bank...
                                                </option>
                                                {banks.map((data) => {
                                                    return (
                                                        <option value={data.id}>
                                                            {data.bank_name}
                                                        </option>
                                                    );
                                                })}
                                            </Form.Select>
                                            <InputError
                                                isValid={isError.to_bank_id}
                                                message={
                                                    "Deposited to is required"
                                                }
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="term_day"
                                                className="nc-modal-custom-text"
                                                defaultValue={
                                                    franchiseeInvoice.term_day
                                                }
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                    <Row className="mt-4 mb-2">
                                        <Col>
                                            <span className="edit-label">
                                                Remarks
                                                <span className="edit-optional px-2">
                                                    (Optional)
                                                </span>
                                            </span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Control
                                                as="textarea"
                                                name="payment_remarks"
                                                defaultValue={
                                                    franchiseeInvoice.payment_remarks
                                                }
                                                className="nc-modal-custom-text"
                                                onChange={(e) =>
                                                    handleCreatePayment(e)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </>
                    )}

                    {/* FOOTER: CANCEL & SUBMIT BUTTONS */}
                    <div className="d-flex justify-content-end pt-5 pb-3">
                        <button
                            type="button"
                            className="button-secondary me-3"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        {isClicked ? (
                            <div className="button-primary d-flex justify-content-center">
                                <ReactLoading
                                    type="bubbles"
                                    color="#FFFFFF"
                                    height={50}
                                    width={50}
                                />
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="button-primary"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

FormSalesInvoice.defaultProps = {
    add: false,
    edit: false,
};

export default FormSalesInvoice;
