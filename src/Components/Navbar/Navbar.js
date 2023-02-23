/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { refreshPage, removeUserSession } from "../../Helpers/Utils/Common";
import { getName, getType, getRole } from "../../Helpers/Utils/Common";
import MenuItem from "./MenuItem";
import { logoutUser } from "../../Helpers/apiCalls/authApi";
import { toastStyle } from "../../Helpers/Utils/Common";

import toast from "react-hot-toast";

//css
import "../Navbar/Navbar.css";

//icons
import logout from "../../Assets/Images/Navbar/logout.png";
import logo from "../../Assets/Images/Login/logo_2.png";
// import po from "../../Assets/Images/Navbar/po.png";
import supplies from "../../Assets/Images/Navbar/supplies.png";
import sales from "../../Assets/Images/Navbar/sales.png";
import cp from "../../Assets/Images/Navbar/cp.png";
// import reports from "../../Assets/Images/Navbar/reports.png";
// import storeReport from "../../Assets/Images/Navbar/storeReport.png";
// import dsReport from "../../Assets/Images/Navbar/dsReports.png";
// import franchiseReport from "../../Assets/Images/Navbar/franchiseReport.png";
// import inventory from "../../Assets/Images/Navbar/inventory.png";
import manage from "../../Assets/Images/Navbar/manage.png";
import employee from "../../Assets/Images/Navbar/employee.png";
import pettycashicon from "../../Assets/Images/Navbar/pettycash.png";

const Navbar = (props) => {
    //ADMIN
    const adminMenu = [
        {
            name: "DASHBOARD",
            exact: true,
            to: "/dashboard",
            iconClassName: cp,
            expand: true,
        },
        {
            name: "SALES",
            exact: true,
            to: "/",
            iconClassName: sales,
            subMenus: [
                { name: "Franchise Register", to: "/franchise" },
                { name: "Franchise Sales Invoice", to: "/salesinvoice" },
                // {
                //     name: "Franchise Sales Report",
                //     to: "/franchise_sales_report",
                // },
                // { name: "Monthly Sales Billing", to: "/franchisebilling" },
                // { name: "Franchisee Payments", to: "/payments" },
                // { name: "Item Prices", to: "/itemprices" },
            ],
            expand: true,
        },
        // {
        //     name: "PURCHASES",
        //     exact: true,
        //     to: "/",
        //     iconClassName: po,
        //     subMenus: [
        //         { name: "Purchase Order Register", to: "/purchaseorders" },
        //         { name: "Purchase Invoice Register", to: "/purchaseinvoices" },
        //         { name: "Pay Supplier", to: "/paysuppliers" },
        //     ],
        //     expand: true,
        // },
        {
            name: "SUPPLIES",
            exact: true,
            to: "/",
            iconClassName: supplies,
            subMenus: [
                { name: "Supplies PO Register", to: "/suppliesexpenses" },
                // { name: "Purchase Order Register", to: "/se/purchaseorders" },
                {
                    name: "Supplies Invoice Register",
                    to: "/se/purchaseinvoices",
                },
                { name: "Pay Supplies Payables", to: "/se/paysuppliers" },
            ],
            expand: true,
        },
        // {
        //     name: "INVENTORY",
        //     exact: true,
        //     to: "/",
        //     iconClassName: inventory,
        //     subMenus: [
        //         { name: "Items List", to: "/itemlists" },
        //         { name: "Low on Stock", to: "/lowonstock" },
        //         { name: "Items History", to: "/itemhistorysearch" },
        //         { name: "Transfers", to: "/transfers" },
        //         // { name: "Incoming Transfers", to: "/incomingtransfers" },
        //         { name: "Requests", to: "/requests" },
        //         { name: "Branch Inventory", to: "/branchinventory" },
        //         { name: "Office Adjustments", to: "/adjustments" },
        //         { name: "Store Adjustments", to: "/storeadjustments" },
        //         { name: "Build Item", to: "/buildItem" },
        //     ],
        //     expand: true,
        // },
        // {
        //     name: "DS REPORTS",
        //     exact: true,
        //     to: "/",
        //     iconClassName: dsReport,
        //     subMenus: [
        //         { name: "Daily Cash Count", to: "/dailycashcount" },
        //         { name: "Daily Expenses", to: "/dailyexpenses" },
        //         { name: "Daily Wastage", to: "/dailywastage" },
        //         { name: "Daily Sales", to: "/dailysales" },
        //         { name: "Daily Orders", to: "/dailyorders" },
        //         { name: "Store Deposit", to: "/storedeposit" },
        //         { name: "Wastage Reports", to: "/wastagereports" },
        //     ],
        //     expand: true,
        // },
        // {
        //     name: "STORE REPORTS",
        //     exact: true,
        //     to: "/",
        //     iconClassName: storeReport,
        //     subMenus: [
        //         { name: "List of Stores", to: "/listofstores" },
        //         { name: "Daily Attendance List", to: "/dailyattendancelist" },
        //     ],
        //     expand: true,
        // },
        // {
        //     name: "OFFICE REPORTS",
        //     exact: true,
        //     to: "/",
        //     iconClassName: reports,
        //     subMenus: [
        //         { name: "Branch Status", to: "/listofbranches" },
        //         { name: "Payables", to: "/payables" },
        //         { name: "Purchased Items", to: "/purchaseditems" },
        //         { name: "Production Report", to: "/productionreport" },
        //         { name: "Transfer History", to: "/transferhistory" },
        //     ],
        //     expand: true,
        // },
        // {
        //     name: "FRANCHISE REPORTS",
        //     exact: true,
        //     to: "/",
        //     iconClassName: franchiseReport,
        //     subMenus: [
        //         // { name: "Franchisee Sales Report", to: "/franchiseesalesreport" },
        //         { name: "Receivables", to: "/receivables" },
        //         { name: "Monthly Sales", to: "/franchisebilling/reports" },
        //         { name: "Sales By Type", to: "/totalsales" },
        //         { name: "Sales by Item", to: "/salesbyitem" },
        //     ],
        //     expand: true,
        // },
        {
            name: "MANAGE",
            exact: true,
            to: "/",
            iconClassName: manage,
            subMenus: [
                { name: "Banks", to: "/banks" },
                // { name: "Branch Group", to: "/branchgroup" },
                { name: "Branches", to: "/branches" },
                // { name: "DSR Items", to: "/dsritems" },
                { name: "Employees", to: "/employees" },
                { name: "Forwarders", to: "/forwarders" },
                // { name: "Inventory Level", to: "/inventorylevel" },
                // { name: "Items", to: "/items" },
                // { name: "Item Prices", to: "/itemprices" },
                // { name: "Price Levels", to: "/pricelevels" },
                // { name: "Products", to: "/products" },
                { name: "Suppliers", to: "/suppliers" },
                { name: "Users", to: "/users" },
                // { name: "Vendor", to: "/vendors" },
                // { name: "Warehouses", to: "/warehouses" },
            ],
            expand: true,
        },
        // {
        //     name: "EMPLOYEES",
        //     exact: true,
        //     to: "/",
        //     iconClassName: employee,
        //     subMenus: [
        //         { name: "Employees", to: "/employees" },
        //         // { name: "Total Working Hours", to: "/employeehours" },
        //     ],
        //     expand: true,
        // },
        {
            name: "PETTY CASH",
            exact: true,
            to: "/",
            iconClassName: pettycashicon,
            subMenus: [
                { name: "Petty Cash Register", to: "/pettycash" },
            ],
            expand: true,
        },
    ];

    // // COMMISSARY OFFICER
    // const commissaryOfficerMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Items List", to: "/itemlists" },
    //             { name: "Low on Stock", to: "/lowonstock" },
    //             { name: "Transfers", to: "/transfers" },
    //             // { name: "Incoming Transfers", to: "/incomingtransfers" },
    //             { name: "Office Adjustments", to: "/adjustments" },
    //             { name: "Store Adjustments", to: "/storeadjustments" },
    //             { name: "Build Item", to: "/buildItem" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // INVENTORY OFFICER
    // const inventoryOfficerMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "PURCHASES",
    //         exact: true,
    //         to: "/",
    //         iconClassName: po,
    //         subMenus: [
    //             { name: "Purchase Order Register", to: "/purchaseorders" },
    //             { name: "Purchase Invoice Register", to: "/purchaseinvoices" },
    //             { name: "Pay Supplier", to: "/paysuppliers" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "SUPPLIES",
    //         exact: true,
    //         to: "/",
    //         iconClassName: supplies,
    //         subMenus: [
    //             { name: "Purchase Order Register", to: "/suppliesexpenses" },
    //             // { name: "Purchase Order Register", to: "/se/purchaseorders" },
    //             {
    //                 name: "Purchase Invoice Register",
    //                 to: "/se/purchaseinvoices",
    //             },
    //             { name: "Pay Supplier", to: "/se/paysuppliers" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Items List", to: "/itemlists" },
    //             { name: "Low on Stock", to: "/lowonstock" },
    //             { name: "Transfers", to: "/transfers" },
    //             // { name: "Incoming Transfers", to: "/incomingtransfers" },
    //             { name: "Requests", to: "/requests" },
    //             { name: "Branch Inventory", to: "/branchinventory" },
    //             { name: "Office Adjustments", to: "/adjustments" },
    //             { name: "Store Adjustments", to: "/storeadjustments" },
    //             { name: "Build Item", to: "/buildItem" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // PURCHASING OFFICER
    // const purchasingOfficerMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "PURCHASES",
    //         exact: true,
    //         to: "/",
    //         iconClassName: po,
    //         subMenus: [
    //             { name: "Purchase Order Register", to: "/purchaseorders" },
    //             { name: "Purchase Invoice Register", to: "/purchaseinvoices" },
    //             { name: "Pay Supplier", to: "/paysuppliers" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "SUPPLIES",
    //         exact: true,
    //         to: "/",
    //         iconClassName: supplies,
    //         subMenus: [
    //             { name: "Supplies PO Register", to: "/suppliesexpenses" },
    //             // { name: "Purchase Order Register", to: "/se/purchaseorders" },
    //             {
    //                 name: "Supplies Invoice Register",
    //                 to: "/se/purchaseinvoices",
    //             },
    //             { name: "Pay Supplies Payables", to: "/se/paysuppliers" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Items List", to: "/itemlists" },
    //             { name: "Low on Stock", to: "/lowonstock" },
    //             { name: "Transfers", to: "/transfers" },
    //             // { name: "Incoming Transfers", to: "/incomingtransfers" },
    //             { name: "Requests", to: "/requests" },
    //             { name: "Branch Inventory", to: "/branchinventory" },
    //             { name: "Office Adjustments", to: "/adjustments" },
    //             { name: "Store Adjustments", to: "/storeadjustments" },
    //             { name: "Build Item", to: "/buildItem" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "MANAGE",
    //         exact: true,
    //         to: "/",
    //         iconClassName: manage,
    //         subMenus: [
    //             { name: "Suppliers", to: "/suppliers" },
    //             { name: "Vendor", to: "/vendors" },
    //             { name: "Banks", to: "/banks" },
    //             { name: "Branches", to: "/branches" },
    //             { name: "Warehouses", to: "/warehouses" },
    //             { name: "Branch Group", to: "/branchgroup" },
    //             { name: "Inventory Level", to: "/inventorylevel" },
    //             { name: "Items", to: "/items" },
    //             { name: "Products", to: "/products" },
    //             { name: "Price Levels", to: "/pricelevels" },
    //             { name: "Users", to: "/users" },

    //             { name: "Forwarders", to: "/forwarders" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "OFFICE REPORTS",
    //         exact: true,
    //         to: "/",
    //         iconClassName: reports,
    //         subMenus: [
    //             { name: "Payables", to: "/payables" },
    //         ],
    //         expand: true,
    //     },
    //     // {
    //     //     name: "FRANCHISE REPORTS",
    //     //     exact: true,
    //     //     to: "/",
    //     //     iconClassName: reports,
    //     //     subMenus: [
    //     //         { name: "Receivables", to: "/receivables" },
    //     //         { name: "Franchise Sales", to: "/totalsales" },
    //     //         { name: "Sales by Item", to: "/salesbyitem" },
    //     //     ],
    //     //     expand: true,
    //     // },
    //     {
    //         name: "PETTY CASH",
    //         exact: true,
    //         to: "/",
    //         iconClassName: pettycashicon,
    //         subMenus: [
    //             { name: "Petty Cash Register", to: "/pettycash" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // PURCHASING STAFF
    // const purchasingStaffMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "PURCHASES",
    //         exact: true,
    //         to: "/",
    //         iconClassName: po,
    //         subMenus: [
    //             { name: "Purchase Order Register", to: "/purchaseorders" },
    //             { name: "Purchase Invoice Register", to: "/purchaseinvoices" },
    //             { name: "Pay Supplier", to: "/paysuppliers" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Items List", to: "/itemlists" },
    //             { name: "Low on Stock", to: "/lowonstock" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "SUPPLIES",
    //         exact: true,
    //         to: "/",
    //         iconClassName: supplies,
    //         subMenus: [
    //             { name: "Supplies PO Register", to: "/suppliesexpenses" },
    //             // { name: "Purchase Order Register", to: "/se/purchaseorders" },
    //             {
    //                 name: "Supplies Invoice Register",
    //                 to: "/se/purchaseinvoices",
    //             },
    //             { name: "Pay Supplies Payables", to: "/se/paysuppliers" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // FRANCHISE OFFICER
    // const franchiseOfficerMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "FRANCHISE",
    //         exact: true,
    //         to: "/",
    //         iconClassName: sales,
    //         subMenus: [
    //             { name: "Franchise Register", to: "/franchise" },
    //             { name: "Franchise Sales Invoice", to: "/salesinvoice" },
    //             { name: "Monthly Sales Billing", to: "/franchisebilling" },
    //             { name: "Franchisee Payments", to: "/payments" },
    //             { name: "Item Prices", to: "/itemprices" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Items List", to: "/itemlists" },
    //             { name: "Low on Stock", to: "/lowonstock" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "MANAGE",
    //         exact: true,
    //         to: "/",
    //         iconClassName: manage,
    //         subMenus: [
    //             { name: "Branches", to: "/branches" },
    //             { name: "Warehouses", to: "/warehouses" },
    //             { name: "Branch Group", to: "/branchgroup" },
    //             { name: "Inventory Level", to: "/inventorylevel" },
    //             { name: "Item Prices", to: "/itemprices" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // HR OFFICER
    // const hrOfficerMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "STORE REPORTS",
    //         exact: true,
    //         to: "/",
    //         iconClassName: storeReport,
    //         subMenus: [
    //             { name: "Daily Attendance List", to: "/dailyattendancelist" },
    //         ],
    //         expand: true,
    //     },
    //     {
    //         name: "EMPLOYEES",
    //         exact: true,
    //         to: "/",
    //         iconClassName: employee,
    //         subMenus: [
    //             { name: "Employees", to: "/employees" },
    //             // { name: "Daily Attendance List", to: "/dailyattendancelist" },
    //             { name: "Total Working Hours", to: "/total_working_hours" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // ACCOUNTS OFFICER
    // const accountsOfficerMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "DS REPORTS",
    //         exact: true,
    //         to: "/",
    //         iconClassName: dsReport,
    //         subMenus: [
    //             { name: "Daily Cash Count", to: "/dailycashcount" },
    //             { name: "Daily Expenses", to: "/dailyexpenses" },
    //             { name: "Daily Wastage", to: "/dailywastage" },
    //             { name: "Daily Sales", to: "/dailysales" },
    //             { name: "Daily Orders", to: "/dailyorders" },
    //             { name: "Store Deposit", to: "/storedeposit" },
    //             { name: "Wastage Reports", to: "/wastagereports" },
    //         ],
    //         expand: true,
    //     },
    //     // {
    //     //     name: "STORE REPORTS",
    //     //     exact: true,
    //     //     to: "/",
    //     //     iconClassName: reports,
    //     //     subMenus: [
    //     //         { name: "Daily Cash Count", to: "/dailycashcount" },
    //     //         { name: "Daily Expenses", to: "/dailyexpenses" },
    //     //         { name: "Daily Wastage", to: "/dailywastage" },
    //     //         { name: "Daily Sales", to: "/dailysales" },
    //     //         { name: "Daily Orders", to: "/dailyorders" },
    //     //         { name: "Store Deposit", to: "/storedeposit" },
    //     //         // {
    //     //         //     name: "Customer Payment Reports",
    //     //         //     to: "/customerpaymentreports",
    //     //         // },
    //     //     ],
    //     //     expand: true,
    //     // },
    // ];

    // // OPERATIONS MANAGER
    // const operationsManagerMenu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "DS REPORTS",
    //         exact: true,
    //         to: "/",
    //         iconClassName: dsReport,
    //         subMenus: [
    //             { name: "Daily Cash Count", to: "/dailycashcount" },
    //             { name: "Daily Expenses", to: "/dailyexpenses" },
    //             { name: "Daily Wastage", to: "/dailywastage" },
    //             { name: "Daily Sales", to: "/dailysales" },
    //             { name: "Daily Orders", to: "/dailyorders" },
    //             { name: "Store Deposit", to: "/storedeposit" },
    //             { name: "Wastage Reports", to: "/wastagereports" },
    //         ],
    //         expand: true,
    //     },
    //     // {
    //     //     name: "STORE REPORTS",
    //     //     exact: true,
    //     //     to: "/",
    //     //     iconClassName: reports,
    //     //     subMenus: [
    //     //         { name: "Daily Cash Count", to: "/dailycashcount" },
    //     //         { name: "Daily Expenses", to: "/dailyexpenses" },
    //     //         { name: "Daily Wastage", to: "/dailywastage" },
    //     //         { name: "Daily Sales", to: "/dailysales" },
    //     //         { name: "Daily Orders", to: "/dailyorders" },
    //     //         { name: "Store Deposit", to: "/storedeposit" },
    //     //         // {
    //     //         //     name: "Customer Payment Reports",
    //     //         //     to: "/customerpaymentreports",
    //     //         // },
    //     //     ],
    //     //     expand: true,
    //     // },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Low on Stock", to: "/lowonstock" },
    //             { name: "Branch Inventory", to: "/branchinventory" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // FIELD OFFICER 1
    // const fieldOfficer1Menu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "DS REPORTS",
    //         exact: true,
    //         to: "/",
    //         iconClassName: dsReport,
    //         subMenus: [
    //             { name: "Daily Cash Count", to: "/dailycashcount" },
    //             { name: "Daily Expenses", to: "/dailyexpenses" },
    //             { name: "Daily Wastage", to: "/dailywastage" },
    //             { name: "Daily Sales", to: "/dailysales" },
    //             { name: "Daily Orders", to: "/dailyorders" },
    //             { name: "Store Deposit", to: "/storedeposit" },
    //             { name: "Wastage Reports", to: "/wastagereports" },
    //         ],
    //         expand: true,
    //     },
    //     // {
    //     //     name: "STORE REPORTS",
    //     //     exact: true,
    //     //     to: "/",
    //     //     iconClassName: reports,
    //     //     subMenus: [
    //     //         { name: "Daily Cash Count", to: "/dailycashcount" },
    //     //         { name: "Daily Expenses", to: "/dailyexpenses" },
    //     //         { name: "Daily Wastage", to: "/dailywastage" },
    //     //         { name: "Daily Sales", to: "/dailysales" },
    //     //         { name: "Daily Orders", to: "/dailyorders" },
    //     //         { name: "Store Deposit", to: "/storedeposit" },
    //     //         // {
    //     //         //     name: "Customer Payment Reports",
    //     //         //     to: "/customerpaymentreports",
    //     //         // },
    //     //     ],
    //     //     expand: true,
    //     // },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Low on Stock", to: "/lowonstock" },
    //             { name: "Branch Inventory", to: "/branchinventory" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // FIELD OFFICER 2
    // const fieldOfficer2Menu = [
    //     // {
    //     //     name: "DASHBOARD",
    //     //     exact: true,
    //     //     to: "/dashboard",
    //     //     iconClassName: cp,
    //     //     expand: true,
    //     // },
    //     {
    //         name: "DS REPORTS",
    //         exact: true,
    //         to: "/",
    //         iconClassName: dsReport,
    //         subMenus: [
    //             { name: "Daily Cash Count", to: "/dailycashcount" },
    //             { name: "Daily Expenses", to: "/dailyexpenses" },
    //             { name: "Daily Wastage", to: "/dailywastage" },
    //             { name: "Daily Sales", to: "/dailysales" },
    //             { name: "Daily Orders", to: "/dailyorders" },
    //             { name: "Store Deposit", to: "/storedeposit" },
    //             { name: "Wastage Reports", to: "/wastagereports" },
    //         ],
    //         expand: true,
    //     },
    //     // {
    //     //     name: "STORE REPORTS",
    //     //     exact: true,
    //     //     to: "/",
    //     //     iconClassName: reports,
    //     //     subMenus: [
    //     //         { name: "Daily Cash Count", to: "/dailycashcount" },
    //     //         { name: "Daily Expenses", to: "/dailyexpenses" },
    //     //         { name: "Daily Wastage", to: "/dailywastage" },
    //     //         { name: "Daily Sales", to: "/dailysales" },
    //     //         { name: "Daily Orders", to: "/dailyorders" },
    //     //         { name: "Store Deposit", to: "/storedeposit" },
    //     //         // {
    //     //         //     name: "Customer Payment Reports",
    //     //         //     to: "/customerpaymentreports",
    //     //         // },
    //     //     ],
    //     //     expand: true,
    //     // },
    //     {
    //         name: "INVENTORY",
    //         exact: true,
    //         to: "/",
    //         iconClassName: inventory,
    //         subMenus: [
    //             { name: "Low on Stock", to: "/lowonstock" },
    //             { name: "Branch Inventory", to: "/branchinventory" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // // COMMISSARY OFFICER
    // const officeStaffMenu = [
        
    //     {
    //         name: "PETTY CASH",
    //         exact: true,
    //         to: "/",
    //         iconClassName: pettycashicon,
    //         subMenus: [
    //             { name: "Petty Cash Register", to: "/pettycash" },
    //         ],
    //         expand: true,
    //     },
    // ];

    // logout handler
    async function handleLogout() {
        const response = await logoutUser();
        removeUserSession();
        window.localStorage.clear();
        toast.success("Logging you out...", {
            style: toastStyle(),
        });
        setTimeout(() => refreshPage(), 1000);
    }

    const [inactive, setInactive] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [expandManage, setExpandManage] = useState(true);

    const handleExpand = (index) => {
        var list = [...menuItems];

        if (!inactive) {
            for (var i = 0; i < list.length; i++) {
                if (i !== index) {
                    list[i]["expand"] = true;
                }
            }

            list[index]["expand"] = !list[index]["expand"];

            setMenuItems(list);
        }
    };

    useEffect(() => {
        if (inactive) {
            removeActiveClassFromSubMenu();
        }

        props.onCollapse(inactive);
    }, [inactive]);

    const removeActiveClassFromSubMenu = () => {
        document.querySelectorAll(".sub-menu").forEach((el) => {
            el.classList.remove("active");
        });
    };

    useEffect(() => {
        const type = getType();
        console.log(type)
        switch (type) {
            case "admin":
                setMenuItems(adminMenu);
                break;
            // case "commissary_officer":
            //     setMenuItems(commissaryOfficerMenu);
            //     break;
            // case "inventory_officer":
            //     setMenuItems(inventoryOfficerMenu);
            //     break;
            // case "purchasing_officer":
            //     setMenuItems(purchasingOfficerMenu);
            //     break;
            // case "purchasing_staff":
            //     setMenuItems(purchasingStaffMenu);
            //     break;
            // case "franchise_officer":
            //     setMenuItems(franchiseOfficerMenu);
            //     break;
            // case "hr_officer":
            //     setMenuItems(hrOfficerMenu);
            //     break;
            // case "accounts_officer":
            //     setMenuItems(accountsOfficerMenu);
            //     break;
            // case "operations_manager":
            //     setMenuItems(commissaryOfficerMenu);
            //     break;
            // case "fielder_officer_1":
            //     setMenuItems(fieldOfficer1Menu);
            //     break;
            // case "fielder_officer_2":
            //     setMenuItems(fieldOfficer2Menu);
            //     break;
            // case "office_staff":
            //     setMenuItems(officeStaffMenu);
            //     break;
                
            default:
                break;
        }

        let menuItemsList = document.querySelectorAll(".menu-item");
        menuItemsList.forEach((el, index) => {
            if (menuItems[index].name == props.active) {
                el.classList.add("active");
            }
            el.addEventListener("click", (e) => {
                const next = el.nextElementSibling;
                removeActiveClassFromSubMenu();
                menuItemsList.forEach((el) => el.classList.remove("active"));
                el.classList.toggle("active");
                if (next !== null) {
                    next.classList.toggle("active");
                }
            });
        });
    }, []);

    return (
        <div className={`side-menu ${inactive ? "inactive" : ""}`}>
            <div className="top-section">
                <div className="logo d-flex justify-content-center">
                    <img
                        src={logo}
                        className="navbar-logo"
                        onClick={() => setInactive(!inactive)}
                    />
                </div>
                <div
                    onClick={() => setInactive(!inactive)}
                    className="toggle-menu-btn"
                >
                    {inactive ? (
                        <div className="max-menu-cont">
                            <FontAwesomeIcon
                                icon={"angle-double-right"}
                                alt={"open"}
                                className={"max-menu"}
                                aria-hidden="true"
                            />
                        </div>
                    ) : (
                        <FontAwesomeIcon
                            icon={"angle-double-left"}
                            alt={"close"}
                            className={"min-menu"}
                            aria-hidden="true"
                        />
                    )}
                </div>
            </div>

            <div className={inactive ? "main-menu" : "main-menu active-menu"}>
                {menuItems.map((menuItem, index) => (
                    <MenuItem
                        key={index}
                        name={menuItem.name}
                        exact={menuItem.exact.toString()}
                        to={menuItem.to}
                        subMenus={menuItem.subMenus || []}
                        iconClassName={menuItem.iconClassName}
                        expandManage={menuItem.expand}
                        setExpandManage={handleExpand}
                        index={index}
                        activeSub={menuItem.name === props.active}
                        onClick={(e) => {
                            if (inactive) {
                                setInactive(false);
                            }
                        }}
                    />
                ))}
            </div>
            <div className="side-menu-footer">
                {!inactive && (
                    <div className="user-details-footer">
                        {/* <div className="account-label">Account</div> */}
                        <span className="navbar-user-label">{getName()}</span>
                        <br />
                        <span className="user-type-label">{getType()}</span>
                    </div>
                )}
                <div className="logout-cont" onClick={() => handleLogout()}>
                    <img src={logout} className="logout-btn" />
                    <span className="logout-label">LOGOUT</span>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
