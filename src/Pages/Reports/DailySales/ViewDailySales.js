import React, { useState, useRef } from "react";
import { Col, Row} from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Table from "../../../Components/TableTemplate/Table";
import {
    numberFormat,
    getTodayDate,
    getType,
    refreshPage,
    toastStyle,
} from "../../../Helpers/Utils/Common";
import Moment from "moment";
import toast from "react-hot-toast";

import { getAllFranchisee } from "../../../Helpers/apiCalls/franchiseeApi";
import { getExpenses, searchExpenses } from "../../../Helpers/apiCalls/Reports/DailyExpensesApi";
import { getWastage, searchWastage } from "../../../Helpers/apiCalls/Reports/DailyWastageApi";
import { searchCashCount, getCashCountReport } from "../../../Helpers/apiCalls/Reports/DailyCashCountApi";
import { getDailyInventory, getInventorySales, searchDailySales } from "../../../Helpers/apiCalls/Reports/DailySalesApi";
import ReactToPrint from "react-to-print";

export default function ViewDailySales() {
    const componentRef = useRef();
    const {id} = useParams();
    const { state } = useLocation();
    console.log(state)
    const navigate = useNavigate();
    const [inactive, setInactive] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [expensesItems, setExpensesItems] = useState([]);
    const [branchName, setBranchName] = useState("");
    const [brachId, setBranchId] = useState("");
    const [cashier, setCashier] = useState("");
    const [prepBy, setPrepBy] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    const [wastage, setWastage] = useState([]);
    const [wastageItems, setWastageItems] = useState([]);
    const [uniqueWastageItems, setUniqueWastageItems] = useState([])
    const [cashDeposit, setCashDeposit] = useState([{
        denomination: '',
        quantity: '',
        amount: ''
    }]);
    const [cashChangeFunds, setCashChangeFunds] = useState([{
        denomination: '',
        quantity: '',
        amount: ''
    }]);
    const [totalCashFunds, setTotalCashFunds] = useState(0);
    const [totalCashDeposit, setTotalCashDeposit] = useState(0);
    const [totalActualSales, setTotalActualSales] = useState(0);
    const [totalSystemSales, setTotalSystemSales] = useState(0);
    const [filterConfig, setFilterConfig] = useState({
        id: id,
        branch_id: state.branch_id,
        branch_name: '',
        // date_from: Moment(state.date_from).format("YYYY-MM-DD"),
        // date_to: Moment(state.date_to).format("YYYY-MM-DD"),
        date: state.date
    })


    function handlePrint () {
        // window.open('/dailysales/print/' + id ,'_blank')
        navigate('/dailysales/print/' + id,{state: {
            expenseDetails: expensesItems, 
            wastageItems: wastageItems, 
            deposit: cashDeposit, 
            changeFunds: cashChangeFunds,
            initialInventory: initialInventory,
            endInventory: endInventory,
            actualInventorySales: actualInventorySales,
            systemInventorySales: systemInventorySales,
            salesSummary: salesSummary,
            actualTotalSales: actualTotalSales,
            systemTotalSales: systemTotalSales,
            totalCashDeposit: totalCashDeposit,
            totalCashFunds: totalCashFunds,
        }})
    }

    // async function handlePrint() {
    //     toast.loading("Printing sales invoice...", { style: toastStyle() });
    //     setTimeout(() => {
    //         toast.dismiss();
    //         Print();
    //     }, 1000);
    // }

    // function Print() {
    //     let printContents = document.getElementById("printablediv").innerHTML;
    //     let originalContents = document.body.innerHTML;
    //     document.body.innerHTML = printContents;
    //     window.print(printContents);
    //     document.body.innerHTML = originalContents;
    //     refreshPage();
    // }


    // Fetch expense report data
    async function fetchData() {
        setShowLoader(true);
        setExpenses([])
        setExpensesItems([])

        // const response = await searchExpenses(filterConfig);
        filterConfig.date_to = filterConfig.date_from;
        const response = await searchExpenses(filterConfig);
        if (response.error) {
        } else {
            filterConfig.branch_id = response.data.data[0].branch_id;
            filterConfig.branch_name = response.data.data[0].branch_name;
            // setBranchId(response.data.data[0].branch_id);
            // setBranchName(response.data.data[0].branch_name);
            // setExpenseDate(response.data.data[0].expense_date);
            // setPrepBy(response.data.data[0].added_by_name);
            // setCashier(response.data.data[0].encoded_by_name);
            var expense = response.data.data.map((data) => {
                var info = data;
                return info;
            });
            var expenseItem = expense[0]?.expense_item.map((data) => {
                var info = data;
                info.store = expense[0].store_name;
                info.added_on = new Date(data.added_on).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                return info;
            });
            setExpenses(expense)
            setExpensesItems(expenseItem)
        }
            setShowLoader(false);
    }

    // Fetch Wastage Report
    async function fetchWastage () {
        setShowLoader(true);
        setWastage([]);
        setWastageItems([]);
        const response = await searchWastage(filterConfig);
        if (response.error) {
            // console.log(response.error)
        } else {
            var wastage = response.data.data.map((item) => {
                var info = item;
                info.added_on = Moment(item.added_on).format("MM-DD-YYYY")
                return info;
            });
            setWastage(wastage)

            console.log("JKFHJDBFJHD", wastage);
            if (wastage.length != 0) {
                var arr = [];
                wastage[0].wastage_items.map((item) => {
                    async function fetchWastage () {
                        // var res = await searchWastage(item.id); 
                        var res = item;
                        console.log(res);
                        // var temp = res.data.data[0].wastage_items[0];
                        var temp = res;
                        // setWastageItems(oldArray => [...oldArray, temp]);
                        arr.push(temp)
                    }
                    fetchWastage();
                })
                setWastageItems(arr);
            }
        }
        setShowLoader(false);
    }

    // Fetch table data for cash breakdown
    async function fetchCashBreakdown () {
        setShowLoader(true);
        setCashDeposit([]);
        setCashChangeFunds([]);
        const denomination_labels = ["PHP 1000","PHP 500","PHP 200","PHP 100","PHP 50","PHP 20","PHP 20 Coin","PHP 10 Coin","PHP 5 Coin","PHP 1 Coin","PHP 25 Cents"]
        const cc_response = await searchCashCount(filterConfig);
        if (cc_response.error) {
            // console.log(cc_response.error)
        } else {
            var allBills = cc_response.data.data.map((bill) => {
                var info = bill;
                info.count_date = Moment(bill.count_date).format("MM-DD-YYYY")
                info.amount = numberFormat(bill.total_count);
                info.total = numberFormat(bill.total_count);
                const quantity = []
                const amount = []
                quantity.push(info.bill_1000, info.bill_500, info.bill_200, info.bill_100, info.bill_50, info.bill_20, info.coin_20, info.coin_10, info.coin_5, info.coin_1, info.cent_25, info.cent_10, info.cent_5, info.cent_1);
                amount.push((parseFloat(info.bill_1000) * 1000), (parseFloat(info.bill_500) * 500), (parseFloat(info.bill_200) * 200), (parseFloat(info.bill_100) * 100), (parseFloat(info.bill_50) * 50),(parseFloat(info.bill_20) * 20),(parseFloat(info.coin_20) * 20),(parseFloat(info.coin_10) * 10),(parseFloat(info.coin_5) * 5),(parseFloat(info.coin_1) * 1),(parseFloat(info.cent_25) * 25))


                if (bill.type == "deposit") {
                    var arr = [];
                    let cashDepositTotal = 0;
                    denomination_labels.map((lab, index) => {
                        console.log("JKJKJK ", parseFloat(quantity[index]));
                        cashDepositTotal += amount[index] ? parseFloat(quantity[index]) * parseFloat(lab.replace(/\D/g,'')) : 0;
                        let obj = {'denomination': lab, 'quantity':quantity[index]?numberFormat(quantity[index]):'', 'amount':amount[index]?numberFormat(amount[index]):'' }
                        // console.log(obj)
                        arr.push(obj);
                    })
                    setCashDeposit(arr);
                    setTotalCashDeposit(numberFormat(cashDepositTotal))
                }  else if (bill.type=="change_funds") {
                    var arr = []
                    let cashFundTotal = 0;
                    denomination_labels.map((lab, index) => {
                        cashFundTotal += amount[index] ? parseFloat(quantity[index]) * parseFloat(lab.replace(/\D/g,'')) : 0;
                        let obj = {'denomination': lab, 'quantity':quantity[index]?numberFormat(quantity[index]):'', 'amount':amount[index]?numberFormat(amount[index]):''}
                        // console.log(obj)
                        arr.push(obj)
                    })
                    setCashChangeFunds(arr);
                    setTotalCashFunds(numberFormat(cashFundTotal))
                }

                return info;
            });
        }

        setShowLoader(false);
    }

    // Fetch table data for ending inventory
    const [initialInventory, setInitialInventory] = useState([]);
    const [endInventory, setEndInventory] = useState([]);
    async function fetchInventory() {
        setShowLoader(true);
        setInitialInventory([]);
        setEndInventory([]);
        // FETCH INVENTORY DATA
        console.log("ADHDHFH", filterConfig);
        const response = await getDailyInventory(filterConfig);
        console.log(response)
        if (response.error) {
            // if error
        } else {
            var initial = response.data.initial_inventories.map((item) => {
                var info = []
                info.name = item.item;
                info.beginning = numberFormat(item.beginning);
                info.delivered = numberFormat(item.delivered);
                info.total = numberFormat(item.initial_total);
                return info;
            })
            console.log('initial', initial);
            setInitialInventory(initial);

            console.log("POTATO: ", response);
            var end = response.data.ending_inventories.map((item, index) => {
                var info = []
                info.name = item.item;
                info.actual_end = numberFormat(item.actual_end);
                info.system_end = numberFormat(item.system_end);
                info.actual_usage = response.data.usage_inventories[index].actual_usage;
                info.system_usage = response.data.usage_inventories[index].system_usage;
                info.variance = response.data.usage_inventories[index].usage_variance;
                return info;
            })

            console.log('end:', end)
            setEndInventory(end);
            setShowLoader(false);
        }
    }

    // FETCH INVENTORY SALES DATA
    const [actualInventorySales, setActualInventorySales] = useState([]);
    const [systemInventorySales, setSystemInventorySales] = useState([]);
    const [actualTotalSales, setActualTotalSales] = useState("");
    const [systemTotalSales, setSystemTotalSales] = useState("");
    async function fetchInventorySales () {
        setShowLoader(true);
        const response = await getInventorySales(filterConfig);
        if (response.error) {
            // error
        } else {
            var actual = response.data.actual_sales.map((data) => {
                var info = [];
                info.name = data.item_name;
                info.usage = numberFormat(data.usage);
                info.price = numberFormat(data.price);
                info.amount = numberFormat(parseInt(data.usage)*parseFloat(data.price));
                return info;
            });
            var actual_total_sales = response.data.total_actual_sales;
            setActualTotalSales(actual_total_sales.grand_total);
            setActualInventorySales(actual);

            var system = response.data.system_sales.map((data) => {
                var info = [];
                info.name = data.item_name;
                info.usage = numberFormat(data.usage);
                info.price = numberFormat(data.price);
                info.amount = numberFormat(parseInt(data.usage)*parseFloat(data.price));
                return info;
            });
            var system_total_sales = response.data.total_system_sales;
            setSystemTotalSales(system_total_sales.grand_total);
            setSystemInventorySales(system);

            setShowLoader(false);
        }
    }

    // FETCH SALES SUMMARY DETAILS
    const [salesSummary, setSalesSummary] = useState({})
    async function fetchSalesSummary() {
        setSalesSummary([]);
        const response = await searchDailySales(filterConfig);
        // console.log(response.data.data);
        if (response.error) {
            // error
        } else {
            const res = response.data.data[0];
            setSalesSummary(res);
        }
    }
    console.log(salesSummary)

    React.useEffect(() => {
        fetchData();
        fetchWastage();
        fetchCashBreakdown();
        fetchInventory();
        fetchInventorySales();
        fetchSalesSummary();
    }, []);

    return (
        <div>
            <div className="page">
                <Navbar
                    onCollapse={(inactive) => {
                        setInactive(inactive);
                    }}
                    active={"DS REPORTS"}
                />
            </div>

            <div id="printablediv" ref={componentRef}
                className={`manager-container ${
                    inactive ? "inactive" : "active"
                }`}
            >
                {/* headers */}
                <Row className="mb-4">
                    <Col xs={6}>
                        <h1 className="page-title"> {salesSummary?.branch_name ? salesSummary?.branch_name : ''} </h1>
                    </Col>
                </Row>
                <Row className="mb-2 ms-2">
                    <Col xs={6} className=''>
                    <Row>
                        <h5 className="label-data p-1 green"> <span className="label"> Cashier: </span> {salesSummary?.cashier_name ? salesSummary?.cashier_name : ''}</h5>
                    </Row>
                    <Row >
                        <h5 className="label-data p-1 green"> <span className="label"> Prepared By: </span> {salesSummary?.preparer_name ? salesSummary?.preparer_name : ''} </h5>
                    </Row>
                    <Row>
                        <h5 className="label-data p-1 green"> <span className="label"> Date: </span> {salesSummary?.date ? new Date(salesSummary?.date).toLocaleDateString( "en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''} </h5>
                    </Row>
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col>
                        <h3 className="report-subheader green">EXPENSES REPORT</h3>
                    </Col>
                    <Col className="d-flex justify-content-end">
                        <h3 className="report-subheader"> TOTAL: {expenses[0]?.grand_total ? numberFormat(expenses[0]?.grand_total) : "0.00" } </h3>
                    </Col>
                </Row>
                <div className="tab-content">
                    <div className="below">
                        <Table
                            tableHeaders={[
                                "ITEM",
                                "QUANTITY",
                                "UNIT",
                                "UNIT PRICE",
                                "AMOUNT",
                                "TIME ADDED",
                            ]}
                            headerSelector={[
                                "name",
                                "qty",
                                "unit",
                                "price",
                                "total",
                                "added_on",
                            ]}
                            tableData={expensesItems}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>

                <Row className="mt-4">
                    <Col>
                        <h3 className="report-subheader green">WASTAGE REPORT</h3>
                    </Col>
                </Row>
                <div className="tab-content">
                    <div className="below">
                        <Table
                            tableHeaders={[
                                "ITEM",
                                "QUANTITY",
                                "UNIT",
                                "REASON"
                            ]}
                            headerSelector={[
                                "name",
                                "qty",
                                "unit",
                                "reason",
                            ]}
                            tableData={wastageItems}
                            showLoader={showLoader}
                        />
                    </div>
                    <div className="mb-2" />
                </div>

                <div className="cash-breakdown-container mt-4 p-4 noscroll">
                    <Row>
                        <Col>
                            <h3 className="report-subheader green">CASH BREAKDOWN</h3>
                        </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col>
                            <Row>
                                <Col>
                                    <h4 className="cash-breakdown-subheader bold">DEPOSIT</h4>
                                </Col>
                                <Col>
                                    <h4 className="cash-breakdown-subheader right"> TOTAL: {totalCashDeposit} </h4>
                                </Col>
                            </Row>
                            <div className="tab-content">
                                <div className="below">
                                    <Table
                                        tableHeaders={[
                                            "DENOMINATION",
                                            "QUANTITY",
                                            "AMOUNT",
                                        ]}
                                        headerSelector={[
                                            "denomination",
                                            "quantity",
                                            "amount",
                                        ]}
                                        tableData={cashDeposit}
                                        showLoader={showLoader}
                                    />
                                </div>
                                <div className="mb-2" />
                            </div>
                        </Col>
                        <Col>
                            <Row>
                                <Col>
                                    <h4 className="cash-breakdown-subheader bold">CHANGE FUNDS</h4>
                                </Col>
                                <Col>
                                    <h4 className="cash-breakdown-subheader right">TOTAL: {totalCashFunds} </h4>
                                </Col>
                            </Row>
                            <div className="noscroll tab-content">
                                <div className="below">
                                    <Table
                                        tableHeaders={[
                                            "DENOMINATION",
                                            "QUANTITY",
                                            "AMOUNT",
                                        ]}
                                        headerSelector={[
                                            "denomination",
                                            "quantity",
                                            "amount",
                                        ]}
                                        tableData={cashChangeFunds}
                                        showLoader={showLoader}
                                    />
                                </div>
                                <div className="mb-2" />
                            </div>
                        </Col>
                    </Row>
                    <div className="d-flex mx-2 mt-2 mb-2 justify-content-evenly">
                        <Col xs={6}>
                            <Row className="text-end">
                                <div className="d-flex my-2 justify-content-end ">
                                    <Col className="print-data">
                                        Total Cash Deposit: {salesSummary.total_cash_deposit ? numberFormat(salesSummary.total_cash_deposit) : "0.00" }
                                    </Col>
                                </div>
                            </Row>
                        </Col>
                        <Col xs={6}>
                            <Row className="text-end">
                                <div className="d-flex my-2 justify-content-end ">
                                    <Col className="print-data">
                                        Total Cash in Drawer: {salesSummary.total_cash_in_drawer ? numberFormat(salesSummary.total_cash_in_drawer) : "0.00" }
                                    </Col>
                                </div>
                            </Row>
                            <Row className="text-end">
                                <div className="d-flex my-2 justify-content-end ">
                                    <Col className="print-data">
                                        Initial Cash in Drawer: {salesSummary.initial_cash_in_drawer ? numberFormat(salesSummary.initial_cash_in_drawer) : "0.00" }
                                    </Col>
                                </div>
                            </Row>
                        </Col>
                    </div>
                    <hr/>
                    <div className="tab-content noscroll mx-2">
                        <Row className="summ-header">
                            <h4 className="cash-breakdown-subheader d-flex justify-content-center green">TOTAL CASH SALE</h4>
                        </Row>
                        <Row className="p-3 justify-content-center">
                            <Col xs={5} className='p-3 m-3'>
                                <Row>
                                    <Col xs={6}></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center green">Remitted</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center green">System</span></Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green"></span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.actual_cash_sales) : ''}</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.system_cash_sales) : ''}</span></Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green">Total Expense</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center">+{salesSummary.total_expense ? numberFormat(salesSummary.total_expense) : '0.00'}</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center">-{salesSummary.total_expense ? numberFormat(salesSummary.total_expense) : '0.00'}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="">
                                    <Col xs={6}><h5 className="cash-breakdown-subheader"></h5></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center total-sales-cont">{salesSummary ? numberFormat(parseFloat(salesSummary.actual_cash_sales) + parseFloat(salesSummary.total_expense)) : ''}</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center total-sales-cont">{salesSummary ? numberFormat(parseFloat(salesSummary.system_cash_sales) - parseFloat(salesSummary.total_expense)) : ''}</span></Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    <hr/>
                    <div className="tab-content noscroll">
                        <Row className="summ-header">
                            <h4 className="cash-breakdown-subheader d-flex justify-content-center green">SALES SUMMARY</h4>
                        </Row>
                        <Row className="p-3 justify-content-center">
                            <Col xs={5} className='cash-sales-summ-cont p-3 ms-2 me-2'>
                                <Row>
                                    <h5 className="cash-breakdown-subheader">CASH SALES SUMMARY</h5>
                                </Row>
                                <Row className="ms-2 mt-3">
                                    <Col><span className="cash-breakdown-subheader">Actual Cash Sales</span></Col>
                                    <Col><span className="cash-breakdown-subheader right">{salesSummary ? numberFormat(salesSummary.actual_cash_sales) : ''}</span></Col>
                                </Row>
                                 <Row className="ms-2 mt-3">
                                    <Col><span className="cash-breakdown-subheader">System Cash Sales</span></Col>
                                    <Col><span className="cash-breakdown-subheader right">{salesSummary ? numberFormat(salesSummary.system_cash_sales) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="ms-2">
                                    <Col><span className="cash-breakdown-subheader">OVERAGE/SHORTAGE</span></Col>
                                    <Col><span className="cash-breakdown-subheader right green">{salesSummary ? numberFormat(salesSummary.cash_sales_overage) : ''}</span></Col>
                                </Row>
                            </Col>
                            <Col xs={5} className='p-3 m-3'>
                                <Row>
                                    <Col xs={6}></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center green">Actual</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center green">System</span></Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green">Cash Sales</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.actual_cash_sales) : ''}</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.system_cash_sales) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green">GCASH Sales</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.gcash_sales) : ''}</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.gcash_sales) : ''}</span></Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green">Food Panda Sales</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.food_panda_sales) : ''}</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.food_panda_sales) : ''}</span></Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green">Grab Food Sales</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.grab_food_sales) : ''}</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center">{salesSummary ? numberFormat(salesSummary.grab_food_sales) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="">
                                    <Col xs={6}><h5 className="cash-breakdown-subheader">TOTAL SALES</h5></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center total-sales-cont">{salesSummary ? salesSummary.total_sales : ''}</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center total-sales-cont">{salesSummary ? salesSummary.total_sales : ''}</span></Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>

                <div className="cash-breakdown-container mt-4 p-4">
                    <Row>
                        <Col>
                            <h3 className="report-subheader green">INVENTORY</h3>
                        </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col className='noscroll'>
                            <h5 className="cash-breakdown-subheader bold">INITIAL</h5>
                            <div className="tab-content noscroll">
                                <div className="below">
                                    {/* table */}
                                    <Table
                                        tableHeaders={[
                                            "ITEM",
                                            "BEGINNING",
                                            "DELIVERED",
                                            "TOTAL",
                                        ]}
                                        headerSelector={[
                                            "name",
                                            "beginning",
                                            "delivered",
                                            "total",
                                        ]}
                                        tableData={initialInventory}
                                        showLoader={showLoader}
                                    />
                                </div>
                                <div className="mb-2" />
                            </div>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col className='noscroll'>
                            <h5 className="cash-breakdown-subheader bold">END</h5>
                            <div className="tab-content noscroll">
                                <div className="below">
                                    <Table
                                        tableHeaders={[
                                            "ITEM",
                                            "ACTUAL END",
                                            "SYSTEM END",
                                            "ACTUAL USAGE",
                                            "SYSTEM USAGE",
                                            "variance"
                                        ]}
                                        headerSelector={[
                                            "name",
                                            "actual_end",
                                            "system_end",
                                            "actual_usage",
                                            "system_usage",
                                            "variance"
                                        ]}
                                        tableData={endInventory}
                                        showLoader={showLoader}
                                    />
                                </div>
                                <div className="mb-2" />
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className="cash-breakdown-container mt-4 p-4">
                    <Row>
                        <Col>
                            <h3 className="report-subheader green">INVENTORY SALES</h3>
                        </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col xs={6} className='noscroll'>
                            <Row>
                                <Col>
                                    <h4 className="cash-breakdown-subheader bold">Actual</h4>
                                </Col>
                                <Col>
                                    <h4 className="cash-breakdown-subheader right"> TOTAL: {numberFormat(actualTotalSales)} </h4>
                                </Col>
                            </Row>
                            <div className="tab-content">
                                <div className="below">
                                    {/* table */}
                                    <Table
                                    tableHeaders={[
                                        "ITEM",
                                        "USAGE",
                                        "PRICE",
                                        "AMOUNT",
                                    ]}
                                    headerSelector={[
                                        "name",
                                        "usage",
                                        "price",
                                        "amount",
                                    ]}
                                        tableData={actualInventorySales}
                                        showLoader={showLoader}
                                    />
                                </div>
                                <div className="mb-2" />
                            </div>
                        </Col>
                        <Col xs={6}>
                            <Row>
                                <Col>
                                    <h4 className="cash-breakdown-subheader bold">System</h4>
                                </Col>
                                <Col>
                                    <h4 className="cash-breakdown-subheader right"> TOTAL: {numberFormat(systemTotalSales)} </h4>
                                </Col>
                            </Row>
                            <div className="tab-content noscroll">
                                <div className="below">
                                    {/* table */}
                                    <Table
                                        tableHeaders={[
                                        "ITEM",
                                        "USAGE",
                                        "PRICE",
                                        "AMOUNT",
                                        ]}
                                        headerSelector={[
                                            "name",
                                            "usage",
                                            "price",
                                            "amount",
                                        ]}
                                        tableData={systemInventorySales}
                                        showLoader={showLoader}
                                    />
                                </div>
                                <div className="mb-2" />
                            </div>
                        </Col>
                    </Row>
                </div>
            

                <div className="tab-content mt-4">
                    <Row className="m-0">
                        <h3 className="cash-breakdown-subheader d-flex justify-content-center green pt-1">SUMMARY</h3>
                    </Row>
                    <div className="me-2 ms-2 mt-1 mb-3 noscroll">
                        <Row>
                            <Col className='tab-content noscroll p-2  me-2'>
                                <Row className="summ-header m-0 p-0">
                                    <span className="cash-breakdown-subheader d-flex justify-content-center pt-2 pb-2 green">SUMMARY</span>
                                </Row>
                                <Row className="ms-2 mt-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center green lighter">Actual Inventory Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{salesSummary ? numberFormat(salesSummary.actual_inventory_sales) : ''}</span></Col>
                                </Row>
                                <Row className="ms-2 p-2 me-3">
                                    <Col xs={8}><span className="cash-breakdown-subheader justify-content-center green lighter">System Inventory Sales</span></Col>
                                    <Col xs={4} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">-{salesSummary ? numberFormat(salesSummary.system_inventory_sales) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="ms-2 mb-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">OVERAGE/SHORTAGE</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(salesSummary.overage_inventory_sales) : ''}</span></Col>
                                </Row>
                            </Col>
                            <Col className='tab-content noscroll p-2 me-2'>
                                <Row className="summ-header m-0 p-0">
                                    <span className="cash-breakdown-subheader d-flex justify-content-center pt-2 pb-2 green">ACTUAL INVENTORY SALES</span>
                                </Row>
                                <Row className="ms-2 mt-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{actualTotalSales?numberFormat(actualTotalSales):0}</span></Col>
                                </Row>
                                <Row className="ms-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Expenses</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">-{salesSummary ? numberFormat(salesSummary.total_expense) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="ms-2 mb-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Net Inventory Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(salesSummary.net_actual_sales) : ''}</span></Col>
                                </Row>
                            </Col>
                            <Col className='tab-content noscroll p-2 me-2'>
                                <Row className="summ-header m-0 p-0">
                                    <span className="cash-breakdown-subheader d-flex justify-content-center pt-2 pb-2 green">SYSTEM INVENTORY SALES</span>
                                </Row>
                                <Row className="ms-2 mt-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{systemTotalSales?numberFormat(systemTotalSales):0}</span></Col>
                                </Row>
                                <Row className="ms-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Expenses</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">-{salesSummary ? numberFormat(salesSummary.total_expense) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="ms-2 mb-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Net Inventory Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(salesSummary.net_system_sales) : ''}</span></Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>

                    <div className="me-2 ms-2 mt-1 mb-3 noscroll">
                        <Row>
                            <Col className='tab-content noscroll p-2 me-2'>
                                <Row className="summ-header m-0 p-0">
                                    <span className="cash-breakdown-subheader d-flex justify-content-center pt-2 pb-2 green">ACTUAL SUMMARY</span>
                                </Row>
                                <Row className="ms-2 mt-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Actual Total Inventory Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{actualTotalSales?numberFormat(actualTotalSales):0}</span></Col>
                                </Row>
                                <Row className="ms-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Actual Cash Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">-{salesSummary ? numberFormat(salesSummary.actual_cash_sales) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="ms-2 mb-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">OVERAGE/SHORTAGE</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(actualTotalSales - salesSummary.actual_cash_sales) : ''}</span></Col>
                                </Row>
                            </Col>
                            <Col className='tab-content noscroll p-2 me-2'>
                                <Row className="summ-header m-0 p-0">
                                    <span className="cash-breakdown-subheader d-flex justify-content-center pt-2 pb-2 green">SYSTEM SUMMARY</span>
                                </Row>
                                <Row className="ms-2 mt-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">System Total Inventory Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{systemTotalSales?numberFormat(systemTotalSales):0}</span></Col>
                                </Row>
                                <Row className="ms-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">System Cash Sales</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">-{salesSummary ? numberFormat(salesSummary.system_cash_sales) : ''}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="ms-2 mb-2 p-2 me-3">
                                    <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">OVERAGE/SHORTAGE</span></Col>
                                    <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(systemTotalSales - salesSummary.system_cash_sales) : ''}</span></Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Print and Close Button */}
                <div className="d-flex justify-content-end pt-2 mb-3">
                    <button
                        name="action"
                        className="button-primary justify-content-center align-items-center print-btn"
                        onClick={handlePrint}
                    >
                        Print
                    </button>
                    {/* <ReactToPrint
                        trigger={() => 
                            <button name="action" className="button-primary justify-content-center align-items-center print-btn d-flex justify-content-end"
                            >Print</button>}
                        content={() => componentRef.current}
                    /> */}
                    <button
                        name="action"
                        className="ms-2 button-primary justify-content-center align-items-center close-btn"
                        onClick={() => navigate(-1)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
