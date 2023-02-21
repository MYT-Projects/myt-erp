import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { toastStyle } from "./Helpers/Utils/Common";

import { getToken, getType } from "./Helpers/Utils/Common";
import { logoutUser, checkTokenStatus } from "./Helpers/apiCalls/authApi";
import { refreshPage, removeUserSession } from "./Helpers/Utils/Common";
import axios from "axios";

import "./Components/FontAwesomeIcons";
import "./Assets/Images/FontAwesomeIcons";
import "./App.css";

/** PAGES **/

/**
 * -- LOGIN SCREEN
 */
import Login from "./Pages/Login/Login";

/**
 * -- DASHBOARD
 */
// import Dashboard2 from "./Pages/Dashboard/Dashboard2";
import Dashboard3 from "./Pages/Dashboard/Dashboard3";

/**
 * -- FRANCHISE
 */
import Franchise from "./Pages/Franchise/Franchise";

// Franchise Sales Invoice
import FormFranchiseInvoice from "./Pages/Franchise/FormFranchiseInvoice";
import SuppliesExpenses from "./Pages/Expenses/SuppliesExpenses/SuppliesExpenses";
import FormSuppliesExpenses from "./Pages/Expenses/SuppliesExpenses/Components/FormSuppliesExpenses";
import ReviewSuppliesExpense from "./Pages/Expenses/SuppliesExpenses/Components/ReviewSuppliesExpense";
import FormPaySupplier from "./Pages/Purchases/Pay Suppliers/Components/FormPaySupplier";
import PrintSuppliesExpense from "./Pages/Expenses/SuppliesExpenses/Components/PrintSuppliesExpense";
import SalesInvoice from "./Pages/Sales/SalesInvoice";
import FormSalesInvoice from "./Pages/Sales/FormSalesInvoice";
import FormCreateSalesInvoice from "./Pages/Sales/FormCreateSalesInvoice";

// Franchise Sales Invoice
import FranchiseSalesReport from "./Pages/Franchise/FranchiseSalesReport";

// Monthly Sales Billing
import FranchiseBilling from "./Pages/Franchise/FranchiseBilling/FranchiseBilling";
import FranchiseBillingForm from "./Pages/Franchise/FranchiseBilling/FranchiseBillingForm";
import FranchiseBillingView from "./Pages/Franchise/FranchiseBilling/FranchiseBillingView";

// Receivables
import Receivables from "./Pages/Franchise/Receivables/Receivables";
import PrintReceivable from "./Pages/Franchise/Receivables/PrintReceivable";
import PrintSalesInvoice from "./Pages/Sales/PrintSalesInvoice";
import PrintFranchiseInvoice from "./Pages/Franchise/PrintFranchiseInvoice";

// Franchisee Payments
import Payments from "./Pages/Franchise/Payments/Payments";
import PaymentsPrint from "./Pages/Franchise/Payments/PrintPayments";

/**
 * -- PURCHASES
 */

// Purchase Orders
import PurchaseOrders from "./Pages/Purchases/PurchaseOrders/PurchaseOrders";
import AddPurchaseOrder from "./Pages/Purchases/PurchaseOrders/Components/AddPurchaseOrder";
import EditPurchaseOrder from "./Pages/Purchases/PurchaseOrders/Components/EditPurchaseOrder";
import PrintPurchaseOrder from "./Pages/Purchases/PurchaseOrders/Components/PrintPurchaseOrder";
import ReviewPurchaseOrder from "./Pages/Purchases/PurchaseOrders/Components/ReviewPurchaseOrder";

// Purchase Invoice
import PurchaseInvoices from "./Pages/Purchases/Purchase Invoice/PurchaseInvoices";
import FormPurchaseInvoice from "./Pages/Purchases/Purchase Invoice/Components/FormPurchaseInvoice";
import PrintPurchaseInvoice from "./Pages/Purchases/Purchase Invoice/Components/PrintPurchaseInvoice";
import PayPurchaseInvoice from "./Pages/Purchases/Purchase Invoice/Components/PayPurchaseInvoice";

// Pay Supplier
import ViewPaySupplier from "./Pages/Purchases/Pay Suppliers/Components/ViewPaySupplier";
import PaySuppliers from "./Pages/Purchases/Pay Suppliers/PaySuppliers";
import ViewInvoice from "./Pages/Purchases/Pay Suppliers/Components/ViewInvoice";

/**
 * -- SUPPLIES
 */

// Purchase Orders
import PO from "./Pages/Expenses/PurchaseOrders/PurchaseOrders";
import AddPO from "./Pages/Expenses/PurchaseOrders/Components/AddPurchaseOrder";
import EditPO from "./Pages/Expenses/PurchaseOrders/Components/EditPurchaseOrder";
import PrintPO from "./Pages/Expenses/PurchaseOrders/Components/PrintPurchaseOrder";
import ReviewPO from "./Pages/Expenses/PurchaseOrders/Components/ReviewPurchaseOrder";
import SEFormPurchaseInvoice from "./Pages/Expenses/Purchase Invoice/Components/SEFormPurchaseInvoice";

// Purchase Invoice
import AddPI from "./Pages/Expenses/Purchase Invoice/Components/AddPurchaseInvoice";
import EditPI from "./Pages/Expenses/Purchase Invoice/Components/EditPurchaseInvoice";
import PrintPI from "./Pages/Expenses/Purchase Invoice/Components/PrintPurchaseInvoice";
import PayPI from "./Pages/Expenses/Purchase Invoice/Components/PayPurchaseInvoice";
import PI from "./Pages/Expenses/Purchase Invoice/PurchaseInvoices";

// Pay Suppliers
import ViewPaySupplierE from "./Pages/Expenses/Pay Suppliers/Components/ViewPaySupplier";
import PaySuppliersE from "./Pages/Expenses/Pay Suppliers/PaySuppliers";
import FormPaySupplierE from "./Pages/Expenses/Pay Suppliers/Components/FormPaySupplier";
import ViewInvoiceSe from "./Pages/Expenses/Pay Suppliers/Components/ViewInvoice";

/**
 * -- INVENTORY
 */
import ItemLists from "./Pages/Inventory/ItemLists";
import LowOnStock from "./Pages/Inventory/LowOnStock";
import BranchAdjustment from "./Pages/Inventory/ItemList/BranchAdjustment";
import ItemHistory from "./Pages/Inventory/ItemList/ItemHistory";
import ItemHistorySearch from "./Pages/Inventory/ItemList/ItemHistorySearch";
import ItemDetails from "./Pages/Inventory/ItemList/ItemDetails";
import ItemDetails2 from "./Pages/Inventory/ItemList/ItemDetails2";
import Requests from "./Pages/Inventory/Requests";
import ViewRequests from "./Pages/Inventory/Requests/ViewRequest";
import Transfers from "./Pages/Inventory/Transfers";
import IncomingTransfers from "./Pages/Inventory/IncomingTransfers";
import ViewTransfer from "./Pages/Inventory/ViewTransfer";
import ReviewTransfer from "./Pages/Inventory/ReviewTransfer";
import FormTransfer from "./Pages/Inventory/FormTransfer";
import FormReceiveTransfer from "./Pages/Inventory/FormReceiveTransfer";
import ViewTransferReceive from "./Pages/Inventory/ViewTransferReceive";
import BranchInventory from "./Pages/Inventory/BranchInventory";
// import ItemHistoryFilter from "./Pages/Inventory/ItemHistory";
import Adjustments from "./Pages/Inventory/Adjustments";
import StoreAdjustments from "./Pages/Inventory/StoreAdjustments";
import ViewAdjustment from "./Pages/Inventory/Adjustment/ViewAdjustment";

/**
 * -- REPORTS
 */
import CustomerPaymentsReports from "./Pages/Reports/CustomerPaymentReports/CustomerPaymentReports";
import DailyAttendanceList from "./Pages/Reports/DailyAttendanceList/DailyAttendanceList";
import DailyCashCounts from "./Pages/Reports/DailyCashCounts/DailyCashCounts";
import DailyExpenses from "./Pages/Reports/DailyExpenses/DailyExpenses";
import DailyWastage from "./Pages/Reports/DailyWastage/DailyWastage";
import DailySales from "./Pages/Reports/DailySales/DailySales";
import DailyOrders from "./Pages/Reports/DailyOrders/DailyOrders";
import PrintDailySales from "./Pages/Reports/DailySales/PrintDailySales";
import WastageReports from "./Pages/Reports/WastageReports/WastageReports";

/**
 * -- REPORTS VIEw
 */
import ViewDailyCashCount from "./Pages/Reports/DailyCashCounts/ViewDailyCashCount";
import ViewDailyExpenses from "./Pages/Reports/DailyExpenses/ViewDailyExpenses";
import PrintDailyExpenses from "./Pages/Reports/DailyExpenses/PrintDailyExpenses";
 import ViewDailyWastage from "./Pages/Reports/DailyWastage/ViewDailyWastage";
import ViewDailyAttendanceList from "./Pages/Reports/DailyAttendanceList/ViewDailyAttendanceList";
import EmployeeHours from "./Pages/Reports/DailyAttendanceList/EmployeeHours";
import BranchDailyOrders from "./Pages/Reports/DailyOrders/BranchDailyOrders";
import StoreDeposit from "./Pages/Reports/StoreDeposit/StoreDeposit";
import ViewDailySales from "./Pages/Reports/DailySales/ViewDailySales";


/**
 * -- OFFICE REPORTS
 */
import Payables from "./Pages/OfficeReports/Payables";
import TotalSales from "./Pages/OfficeReports/TotalSales/TotalSales";
import FranchiseeSalesReport from "./Pages/OfficeReports/FranchiseeSalesReport/FranchiseeSalesReport";
import SalesByItem from "./Pages/OfficeReports/SalesByItem/SalesByItem";
import ListOfStores from "./Pages/OfficeReports/Stores";
import ListOfBranches from "./Pages/Reports/BranchList/BranchList";
import PurchasedItemsSummary from "./Pages/OfficeReports/PurchasedItemsSummary/PurchasedItemsSummary";
import TransferHistory from "./Pages/OfficeReports/TransferHistory/TransferHistory";
import ViewTransferHistory from "./Pages/OfficeReports/TransferHistory/ViewTransferHistory";
import ProductionReport from "./Pages/OfficeReports/ProductionReport/ProductionReport";


/**
 * -- MANAGE
 */

// Suppliers
import Suppliers from "./Pages/Manage/Suppliers";

// Vendors
import Vendors from "./Pages/Manage/Vendors";

// Banks
import Banks from "./Pages/Manage/Banks";

// Branches
import Branches from "./Pages/Manage/Branches";
import Warehouses from "./Pages/Manage/Warehouses";

// Branch Group
import BranchGroup from "./Pages/Manage/BranchGroup";

// Inventory Level
import InventoryLevel from "./Pages/Manage/InventoryLevel";
import FormInventoryLevel from "./Pages/Manage/InventoryLevel/FormInventoryLevel";

// Items
import Items from "./Pages/Manage/Items";

// Products
import Products from "./Pages/Manage/Products";

// Products
import ItemPrices from "./Pages/Manage/ItemPrices/ItemPrices";


//DSR Items
import DsrItems from "./Pages/Manage/DsrItems/DsrItems";

// Price Levels
import PriceLevels from "./Pages/Manage/PriceLevels";
import AddPriceLevel from "./Pages/Manage/Components/AddPL";
import EditPriceLevel from "./Pages/Manage/Components/EditPL";
import ViewPriceLevel from "./Pages/Manage/Components/ViewPL";

// Users
import Users from "./Pages/Manage/Users";

// Employees
import Employees from "./Pages/Manage/Employees";

// Forwarders
import Forwarders from "./Pages/Manage/Forwarders";

// BuildItem
import BuildItem from "./Pages/Manage/BuildItem";
import BuildItemView from "./Pages/Manage/BuildItemView";

// PettyCash
import PettyCash from "./Pages/PettyCash/PettyCash";
import PettyCashCashInForm from "./Pages/PettyCash/PettyCashCashInForm";
import PettyCashCashInView from "./Pages/PettyCash/PettyCashCashInView";
import PettyCashCashOutForm from "./Pages/PettyCash/PettyCashCashOutForm";
import PettyCashCashOutView from "./Pages/PettyCash/PettyCashCashOutView";
/**
 * -- EMPLOYEES
 */
// ! Employees tab not yet implemented

/**
 *  ---- App ----
 */
function App() {
    document.title = "MANGO MAGIC";
    document.body.style = "background: #F8F7F7;";

    const [token, setAuthentication] = useState(getToken());
    const type = getType();

    React.useEffect(() => {
        setAuthentication(getToken());
    }, []);

    async function handleLogout() {
        //console.log("Logging out...");
        const response = await logoutUser();

        toast.error("Expired Token. Logging out...", { style: toastStyle() });

        removeUserSession();

        // Adding delay before reloading
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    async function checkToken() {
        //console.log("Checking token status...");
        let isNotExpired = await checkTokenStatus();

        if (!isNotExpired) handleLogout();
    }

    // Auto logout when the token expires
    React.useEffect(() => {
        let user = localStorage.getItem("user");
        if (!user) return;

        let token = localStorage.getItem("token");
        if (!token) {
            //console.log("No token found");
            handleLogout();
        } else {
            //console.log("Token found");
            checkToken();
        }
    }, []);

    return (
        <div className="page">
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{ style: { toastStyle } }}
            />
            <Router>
                <Routes>
                    {/* -------------------------------------------------- */}
                    {/* DASHBOARD */}

                    {/* ! hide dashboard for now exceprt for admin people */}
                    <Route
                        path="/"
                        element={token ? <Dashboard3 /> : <Login />}
                    />
                    <Route
                        path="/dashboard"
                        element={token ? <Dashboard3 /> : <Navigate to="/" />}
                    />
                    {/* <Route
                        path="/"
                        element={
                            token ? (
                                type === "admin" ? (
                                    <Dashboard3 />
                                ) : (
                                    <Franchise />
                                )
                            ) : (
                                <Login />
                            )
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            token ? (
                                type === "admin" ? (
                                    <Dashboard3 />
                                ) : (
                                    <Franchise />
                                )
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    /> */}

                    {/* -------------------------------------------------- */}
                    {/* FRANCHISE - Franchise Register */}
                    <Route
                        path="/franchise"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <Franchise />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/franchise/add"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FormFranchiseInvoice add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/franchise/edit/:pi_id"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "franchise_officer") ? (
                                <FormFranchiseInvoice edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/franchise/print/:franchisee_id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <PrintFranchiseInvoice />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* FRANCHISE - Franchise Sales Invoice */}
                    <Route
                        path="/salesinvoice"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <SalesInvoice />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/salesinvoice/add"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FormSalesInvoice add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/salesinvoice/edit/:franchisee_sale_id"
                        element={
                            token && (type === "admin" ||
                            type === "franchise_officer") ? (
                                <FormSalesInvoice edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/salesinvoice/process/:franchisee_sale_id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FormSalesInvoice process />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/salesinvoice/createinvoice/:franchisee_sale_id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FormSalesInvoice createinvoice />
                            ) : (
                                // <FormCreateSalesInvoice edit />
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/salesinvoice/print/:franchisee_sale_id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <PrintSalesInvoice />
                            ) : (
                                <Navigate to="/salesinvoice" />
                            )
                        }
                    />

                    {/* FRANCHISE - Franchise Sales Report */}
                    <Route
                        path="/franchise_sales_report"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FranchiseSalesReport />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* FRANCHISE - Monthly Sales Billing */}
                    <Route
                        path="/franchisebilling"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FranchiseBilling />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/franchisebilling/reports"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FranchiseBilling reports />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/franchisebilling/add/"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FranchiseBillingForm add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    {/* <Route
                        path="/franchisebilling/add/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FranchiseBillingForm add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    /> */}
                    <Route
                        path="/franchisebilling/edit/:id"
                        element={
                            token && (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FranchiseBillingForm edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    <Route
                        path="/franchisebilling/view/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <FranchiseBillingView add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    {/* FRANCHISE - Receivables */}
                    <Route
                        path="/receivables"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <Receivables />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/receivables/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <PrintReceivable />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    {/* FRANCHISE - Payments */}
                    <Route
                        path="/payments"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <Payments />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/payments/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer") ? (
                                <PaymentsPrint />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* -------------------------------------------------- */}
                    {/* PURCHASES */}

                    {/* PURCHASES - Purchase Order Register */}
                    <Route
                        path="/purchaseorders"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PurchaseOrders />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseorders/add/:shopType"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <AddPurchaseOrder />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseorders/edit/:shopType/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <EditPurchaseOrder />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseorders/review/:state/:shopType/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff") ? (
                                <ReviewPurchaseOrder />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseorders/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff") ? (
                                <PrintPurchaseOrder />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    {/* PURCHASES - Purchase Invoice Register */}
                    <Route
                        path="/purchaseinvoices"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff") ? (
                                <PurchaseInvoices />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseinvoices/add/:po_id/:shopType"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff") ? (
                                <FormPurchaseInvoice add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseinvoices/edit/:pi_id/:shopType"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                // (type === "admin" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer" ||
                                //     type === "purchasing_staff" ||
                                //     type === "purchasing_staff" ||
                                //     type === "purchasing_staff") ? (
                                <FormPurchaseInvoice edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseinvoices/print/:id/:shopType"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff") ? (
                                <PrintPurchaseInvoice />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseinvoices/pay-check"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff" ||
                                type === "purchasing_staff") ? (
                                <PayPurchaseInvoice />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    {/* PURCHASES - Pay Supplier */}
                    <Route
                        path="/paysuppliers"
                        element={token ? <PaySuppliers /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/paysuppliers/add/:type/:shopType"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <FormPaySupplier add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/paysuppliers/edit/:id/:type/:shopType"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer" ||
                                //     type === "purchasing_staff") ? (
                                <FormPaySupplier edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/paysuppliers/view/:id/:type/:shopType"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <ViewPaySupplier />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/paysuppliers/view-invoice/:id/:shopType/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <ViewInvoice />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* -------------------------------------------------- */}
                    {/* SUPPLIES */}
                    <Route
                        path="/suppliesexpenses"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <SuppliesExpenses />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    <Route
                        path="/suppliesexpenses/add"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <FormSuppliesExpenses add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/suppliesexpenses/review/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <ReviewSuppliesExpense />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    <Route
                        path="/suppliesexpenses/edit/:type/:id"
                        element={
                            token && (type === "admin" ||
                                    type === "purchasing_officer") ? (
                                // (type === "admin" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer" ||
                                //     type === "purchasing_staff") ? (
                                <FormSuppliesExpenses edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    <Route
                        path="/suppliesexpenses/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PrintSuppliesExpense />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* SUPPLIES -- Purchase Order Register */}
                    <Route
                        path="/se/purchaseorders"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PO />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseorders/add"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <AddPO />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseorders/edit/:id"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer" ||
                                //     type === "purchasing_staff") ? (
                                <EditPO />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseorders/review/:state/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <ReviewPO />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseorders/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PrintPO />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* SUPPLIES -- Purchase Invoice Register */}
                    <Route
                        path="/se/purchaseinvoices"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PI />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseinvoices/add/:po_id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <SEFormPurchaseInvoice add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseinvoices/edit/:pi_id"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer" ||
                                //     type === "purchasing_staff") ? (
                                <SEFormPurchaseInvoice edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseinvoices/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PrintPI />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/purchaseinvoices/pay-check"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PayPI />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* SUPPLIES - Pay Suppliers */}
                    <Route
                        path="/se/paysuppliers"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <PaySuppliersE />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/paysuppliers/add/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <FormPaySupplierE add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/paysuppliers/edit/:id/:type"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer" ||
                                //     type === "purchasing_staff") ? (
                                <FormPaySupplierE edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/paysuppliers/view/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <ViewPaySupplierE />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/se/paysuppliers/view-invoice/:id/:bank/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <ViewInvoiceSe />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* -------------------------------------------------- */}
                    {/* INVENTORY  */}
                    <Route
                        path="/itemlists"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "franchise_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <ItemLists />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/itemlists/branch-adjustment/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <BranchAdjustment />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/itemlists/itemdetails/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <ItemDetails2 />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/itemlists/history/:branch_id/:item_id/:item_unit_id/:unit"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "franchise_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <ItemHistory />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/itemhistorysearch/"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "franchise_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <ItemHistorySearch />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/lowonstock"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "franchise_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "purchasing_staff") ? (
                                <LowOnStock />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <Transfers />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/incomingtransfers"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <IncomingTransfers />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/view/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <ViewTransfer />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/review/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <ReviewTransfer />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/add/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <FormTransfer add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/edit/:id/:type"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "commissary_officer" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer") ? (
                                <FormTransfer edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/add/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <FormTransfer request />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/receive/:type/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "commissary_officer" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <FormReceiveTransfer edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/receive/:type/:id"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "commissary_officer" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer") ? (
                                <FormReceiveTransfer edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transfers/receive/view/:id"
                        element={
                            token && type === "admin" ? (
                                // (type === "admin" ||
                                //     type === "commissary_officer" ||
                                //     type === "inventory_officer" ||
                                //     type === "purchasing_officer") ? (
                                <ViewTransferReceive edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/requests"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <Requests />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/requests/view/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer") ? (
                                <ViewRequests />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/branchinventory"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <BranchInventory />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    {/* <Route
                        path="/itemhistory"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "purchasing_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <ItemHistoryFilter />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    /> */}
                    {
                        <Route
                            path="/adjustments"
                            element={
                                token &&
                                (type === "admin" ||
                                    type === "franchise_officer" ||
                                    type === "inventory_officer" ||
                                    type === "commissary_officer" ||
                                    type === "purchasing_officer") ? (
                                    <Adjustments />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                    }

                    {
                        <Route
                        path="/storeadjustments"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "franchise_officer" ||
                                type === "inventory_officer" ||
                                type === "commissary_officer" ||
                                type === "purchasing_officer") ? (
                                <StoreAdjustments />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    }

                    <Route
                        path="/adjustments/view/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "commissary_officer" ||
                                type === "purchasing_officer") ? (
                                <ViewAdjustment />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    <Route
                        path="/buildItem"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "commissary_officer" ||
                                type === "purchasing_officer") ? (
                                <BuildItem />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/buildItem/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "inventory_officer" ||
                                type === "commissary_officer" ||
                                type === "purchasing_officer") ? (
                                <BuildItemView />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* -------------------------------------------------- */}
                    {/* STORE REPORTS */}
                    <Route
                        path="/dailyattendancelist"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "hr_officer" ||
                                type === "fielder_officer_2") ? (
                                <DailyAttendanceList />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailyattendancelist/view/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "hr_officer" ||
                                type === "fielder_officer_2") ? (
                                <ViewDailyAttendanceList />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailyattendancelist/view/employeehours/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "hr_officer" ||
                                type === "fielder_officer_2") ? (
                                <EmployeeHours />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/employeehours"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "hr_officer" ||
                                type === "fielder_officer_2") ? (
                                <EmployeeHours />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailycashcount"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <DailyCashCounts />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailycashcount/view/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <ViewDailyCashCount />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailyexpenses"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <DailyExpenses />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailyexpenses/view/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <ViewDailyExpenses />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailyexpenses/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <PrintDailyExpenses />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailysales"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <DailySales />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailysales/view/:id"
                        // path="/dailysales/view/"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <ViewDailySales />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailysales/print/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <PrintDailySales />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailywastage"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <DailyWastage />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailywastage/view/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <ViewDailyWastage />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/wastagereports"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <WastageReports />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/customerpaymentreports"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <CustomerPaymentsReports />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailyorders"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <DailyOrders />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dailyorders/branch/:id"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <BranchDailyOrders />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/storedeposit"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "accounts_officer" ||
                                type === "operations_manager" ||
                                type === "fielder_officer_1" ||
                                type === "fielder_officer_2") ? (
                                <StoreDeposit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* -------------------------------------------------- */}
                    {/* OFFICE REPORTS */}
                    <Route
                        path="/payables"
                        element={
                            token && (type === "admin" ||
                            type === "purchasing_officer") ? (
                                <Payables />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/totalsales"
                        element={
                            token && (type === "admin" ) ? (
                                <TotalSales />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/franchiseesalesreport"
                        element={
                            token && (type === "admin" ) ? (
                                <FranchiseeSalesReport />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/salesbyitem"
                        element={
                            token && (type === "admin" ) ? (
                                <SalesByItem />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/listofstores"
                        element={
                            token && (type === "admin" ) ? (
                                <ListOfStores />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/listofbranches"
                        element={
                            token && (type === "admin" ) ? (
                                <ListOfBranches />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/purchaseditems"
                        element={
                            token && (type === "admin" ) ? (
                                <PurchasedItemsSummary />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transferhistory"
                        element={
                            token && (type === "admin" ) ? (
                                <TransferHistory />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/transferhistory/view/:id"
                        element={
                            token && (type === "admin" ) ? (
                                <ViewTransferHistory />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                     <Route
                        path="/productionreport"
                        element={
                            token && (type === "admin") ? (
                                <ProductionReport />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    

                    {/* -------------------------------------------------- */}
                    {/* MANAGE */}
                    <Route
                        path="/suppliers"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <Suppliers />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/vendors"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <Vendors />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/banks"
                        element={
                            token && type === "admin" ? (
                                <Banks />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/items"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <Items />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/branches"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <Branches />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/warehouses"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <Warehouses />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/branchgroup"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <BranchGroup />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/inventorylevel"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <InventoryLevel />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/inventorylevel/add/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <FormInventoryLevel add/>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/inventorylevel/edit/:id/:type"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <FormInventoryLevel edit/>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/inventorylevel/add"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <InventoryLevel />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/products"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <Products />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/itemprices"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer" ||
                                type === "franchise_officer") ? (
                                <ItemPrices />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/dsritems"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <DsrItems />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pricelevels"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <PriceLevels />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pricelevels/add/:destination"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <AddPriceLevel />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pricelevels/edit/:id/:destination"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <EditPriceLevel />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pricelevels/view/:id/:destination"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <ViewPriceLevel />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <Users />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/forwarders"
                        element={
                            token &&
                            (type === "admin" ||
                                type === "purchasing_officer") ? (
                                <Forwarders />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* EMPLOYEES  */}
                    <Route
                        path="/employees"
                        element={
                            token &&
                            (type === "admin" || type === "hr_officer") ? (
                                <Employees />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pettycash"
                        element={
                            token && (type === "admin" ||
                            type === "purchasing_officer" ||
                            type === "office_staff") ? (
                                <PettyCash />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pettycash/cashin"
                        element={
                            token && (type === "admin" ||
                            type === "purchasing_officer" ||
                            type === "office_staff") ? (
                                <PettyCashCashInForm add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pettycash/cashin/:id/edit"
                        element={
                            token && (type === "admin" ||
                            type === "office_staff") ? (
                                <PettyCashCashInForm edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pettycash/cashin/:id"
                        element={
                            token && (type === "admin" ||
                            type === "office_staff") ? (
                                <PettyCashCashInView />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pettycash/cashout"
                        element={
                            token && (type === "admin" ||
                            type === "purchasing_officer" ||
                            type === "office_staff") ? (
                                <PettyCashCashOutForm add />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                     <Route
                        path="/pettycash/cashout/:id/edit"
                        element={
                            token && (type === "admin" ||
                            type === "office_staff") ? (
                                <PettyCashCashOutForm edit />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/pettycash/cashout/:id"
                        element={
                            token && (type === "admin" ||
                            type === "office_staff") ? (
                                <PettyCashCashOutView />
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
