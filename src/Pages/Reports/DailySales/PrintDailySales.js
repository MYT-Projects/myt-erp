import React from "react";
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Row, Col, Table } from "react-bootstrap";
import ReactToPrint from "react-to-print";
import {
    numberFormat,
} from "../../../Helpers/Utils/Common";

// Components
import Navbar from "../../../Components/Navbar/Navbar";

// Images
import logo from '../../../Assets/Images/Login/logo.png'

export default function PrintDailySales() {
    const [inactive, setInactive] = useState(true);
    const location = useLocation();
    console.log(location.state)
    const expenseItems = location.state.expenseDetails;
    const wastageItems = location.state.wastageItems;
    const cashDeposit = location.state.deposit;
    const cashChangeFunds = location.state.changeFunds;
    const initialInventory = location.state.initialInventory;
    const endInventory = location.state.endInventory;
    const actualInventorySales = location.state.actualInventorySales;
    const systemInventorySales = location.state.systemInventorySales;
    const salesSummary = location.state.salesSummary;
    const actualTotalSales = location.state.actualTotalSales;
    const systemTotalSales = location.state.systemTotalSales;
    const totalCashDeposit = location.state.totalCashDeposit;
    const totalCashFunds = location.state.totalCashFunds;

    console.log(wastageItems)
    const componentRef = useRef();
    const navigate = useNavigate();
    // console.log(location)
    // console.log(cashDeposit, cashChangeFunds);
    // console.log(location);
    // console.log(wastageItems)

    function renderExpenseTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>UNIT PRICE</th>
                        <th>Amount</th>
                        <th>Time Added</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        expenseItems.map((data) => {
                            return (
                                <tr>
                                    <td>{data.name}</td>
                                    <td>{data.qty}</td>
                                    <td>{data.unit}</td>
                                    <td>{numberFormat(data.price)}</td>
                                    <td>{numberFormat(data.total)}</td>
                                    <td>{data.added_on}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }

    function renderWastageTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        wastageItems.map((data) => {
                            return (
                                <tr>
                                    <td>{data.name}</td>
                                    <td>{data.qty}</td>
                                    <td>{data.unit}</td>
                                    <td>{data.reason}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }

    function renderDepositTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Denomination</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        {/* <th>Reason</th> */}
                    </tr>
                </thead>
                <tbody>
                    {
                        cashDeposit.map((data) => {
                            return (
                                <tr>
                                    <td>{data.denomination}</td>
                                    <td>{data.quantity}</td>
                                    <td>{data.amount ? numberFormat(data.amount) : "0.00"}</td>
                                    {/* <td>{data.reason}</td> */}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }

    function renderChangeFundsTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Denomination</th>
                        <th>Quantity</th>
                        <th>Amount</th>
                        {/* <th>Reason</th> */}
                    </tr>
                </thead>
                <tbody>
                    {
                        cashChangeFunds.map((data) => {
                            return (
                                <tr>
                                    <td>{data.denomination}</td>
                                    <td>{data.quantity}</td>
                                    <td>{data.amount ? numberFormat(data.amount) : "0.00"}</td>
                                    {/* <td>{data.reason}</td> */}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }

    function renderInitialInventoryTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Beginning</th>
                        <th>Delivered</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        initialInventory.map((data) => {
                            return (
                                <tr>
                                    <td>{data.name}</td>
                                    <td>{data.beginning}</td>
                                    <td>{data.delivered}</td>
                                    <td>{numberFormat(data.total)}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }

    function renderEndInventoryTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Actual End</th>
                        <th>System End</th>
                        <th>Actual Usage</th>
                        <th>System Usage</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        endInventory.map((data) => {
                            return (
                                <tr>
                                    <td>{data.name}</td>
                                    <td>{data.actual_end}</td>
                                    <td>{data.system_end}</td>
                                    <td>{data.actual_usage}</td>
                                    <td>{data.system_usage}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }

    function renderActualInventorySalesTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Usage</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        actualInventorySales.map((data) => {
                            return (
                                <tr>
                                    <td>{data.name}</td>
                                    <td>{data.usage}</td>
                                    <td>{numberFormat(data.price)}</td>
                                    <td>{numberFormat(data.amount)}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }

    function renderSystemInventorySalesTable() {
        return (
            <Table className="align-middle">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Usage</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        systemInventorySales.map((data) => {
                            return (
                                <tr>
                                    <td>{data.name}</td>
                                    <td>{data.usage}</td>
                                    <td>{numberFormat(data.price)}</td>
                                    <td>{numberFormat(data.amount)}</td>
                                </tr>
                            )
                        })
                    }
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
                    active={"DS REPORTS"}
                />
            </div>

            <div
                className={`manager-container container edit-form${
                    inactive ? "inactive" : "active"
                }`}
            >
                <div className="print-container px-3 py-2" ref={componentRef}>
                    <Row className="d-flex justify-content-center mt-4">
                        <div className="print-logo-container">
                            <img src={logo} alt="logo" className="print-logo" />
                        </div>
                    </Row>
                    <Row className="">
                        <h5 className="d-flex justify-content-center report-subheader">DAILY SALES REPORT</h5>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <h5 className="label-data p-1"> <span className="label"> Branch: </span> {salesSummary?.branch_name ? salesSummary?.branch_name : ''} </h5>
                        </Col>
                        <Col xs={6} className="d-flex justify-content-end">
                            <h5 className="label-data p-1"> <span className="label"> Cashier: </span> {salesSummary?.cashier_name ? salesSummary?.cashier_name : ''} </h5>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <h5 className="label-data p-1"> <span className="label"> Date: </span>{salesSummary?.date ? new Date(salesSummary?.date).toLocaleDateString( "en-us", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}</h5>
                        </Col>
                        <Col xs={6} className="d-flex justify-content-end">
                            <h5 className="label-data p-1"> <span className="label"> Prepared by: </span> {salesSummary?.preparer_name ? salesSummary?.preparer_name : ''}</h5>
                        </Col>
                    </Row>
                    {/* EXPENSE REPORT */}
                    <Row className="mt-4">
                        <h5 className="report-subheader green">EXPENSE REPORT</h5>
                    </Row>
                    <Row className="d-flex mb-2 justify-content-evenly">
                        <div className="print-table mx-2">{renderExpenseTable()}</div>
                    </Row>
                    {/* WASTAGE REPORT */}
                    <Row className="mt-4">
                        <h5 className="report-subheader green">WASTAGE REPORT</h5>
                    </Row>
                    <Row className="d-flex mb-2 justify-content-evenly">
                        <div className="print-table mx-2">{renderWastageTable()}</div>
                    </Row>
                    {/* CASH BREAKDOWN */}
                    <Row className="mt-4">
                        <h5 className="report-subheader green">CASH BREAKDOWN</h5>
                    </Row>
                    <Row>
                        <Col xs={3}><h5 className="report-subheader justify-content-start">DEPOSIT</h5></Col>
                        <Col xs={3}><h5 className="report-subheader justify-content-end">Total: {totalCashDeposit}</h5></Col>
                        <Col xs={3}><h5 className="report-subheader justify-content-start">CHANGE FUNDS</h5></Col>
                        <Col xs={3}><h5 className="report-subheader justify-content-end">Total: {totalCashFunds}</h5></Col>
                    </Row>
                    <div className="d-flex mb-2 justify-content-evenly">
                            {/* table */}
                        <div className="print-table mx-2 me-3">
                            {renderDepositTable()}
                        </div>
                        <div className="print-table mx-2">
                            {renderChangeFundsTable()}
                        </div>
                    </div>

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

                    <Row className="mt-4">
                        <h5 className="report-subheader justify-content-center green">TOTAL CASH SALE</h5>
                    </Row>
                    <Row className="d-flex mb-2 justify-content-center p-3">
                        <Row className="print-table mx-2 justify-content-center">
                            <Col xs={5} className='p-3 m-3'>
                                <Row>
                                    <Col xs={6}></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center green">Remitted</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader justify-content-center green">System</span></Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green"></span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader text-end">{salesSummary ? numberFormat(salesSummary.actual_cash_sales) : ''}</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader text-end">{salesSummary ? numberFormat(salesSummary.system_cash_sales) : ''}</span></Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}><span className="cash-breakdown-subheader justify-content-center green">Total Expense</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader text-end">+{salesSummary.total_expense ? numberFormat(salesSummary.total_expense) : '0.00'}</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader text-end">-{salesSummary.total_expense ? numberFormat(salesSummary.total_expense) : '0.00'}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="">
                                    <Col xs={6}><h5 className="cash-breakdown-subheader"></h5></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader text-end total-sales-cont">{salesSummary ? numberFormat(parseFloat(salesSummary.actual_cash_sales) + parseFloat(salesSummary.total_expense)) : ''}</span></Col>
                                    <Col className="text-end" xs={3}><span className="cash-breakdown-subheader text-end total-sales-cont">{salesSummary ? numberFormat(parseFloat(salesSummary.system_cash_sales) - parseFloat(salesSummary.total_expense)) : ''}</span></Col>
                                </Row>
                            </Col>
                        </Row>
                    </Row>

                    {/* SALES SUMMARY */}
                    <Row className="mt-4">
                        <h5 className="report-subheader justify-content-center green">SALES SUMMARY</h5>
                    </Row>
                    <Row className="d-flex mb-2 justify-content-evenly p-3">
                        <Row className="print-table mx-2">
                            <Col className='cash-sales-summ-cont p-3 m-3'>
                                <Row>
                                    <h5 className="cash-breakdown-subheader">CASH SALES SUMMARY</h5>
                                </Row>
                                <Row className="ms-2 mt-3">
                                    <Col><span className="cash-breakdown-subheader">Actual Cash Sales</span></Col>
                                    <Col><span className="cash-breakdown-subheader">{salesSummary ? numberFormat(salesSummary.actual_cash_sales) : "0.00"}</span></Col>
                                </Row>
                                    <Row className="ms-2 mt-3">
                                    <Col><span className="cash-breakdown-subheader">System Cash Sales</span></Col>
                                    <Col><span className="cash-breakdown-subheader">{salesSummary ? numberFormat(salesSummary.system_cash_sales) : "0.00"}</span></Col>
                                </Row>
                                <hr/>
                                <Row className="ms-2">
                                    <Col><span className="cash-breakdown-subheader">OVERAGE/SHORTAGE</span></Col>
                                    <Col><span className="cash-breakdown-subheader d-flex green">{salesSummary ? numberFormat(salesSummary.cash_sales_overage) : "0.00"}</span></Col>
                                </Row>
                            </Col>
                            <Col className='p-3'>
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
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center total-sales-cont">{salesSummary ? numberFormat(salesSummary.total_sales) : ''}</span></Col>
                                    <Col xs={3}><span className="cash-breakdown-subheader justify-content-center total-sales-cont">{salesSummary ? numberFormat(salesSummary.total_sales) : ''}</span></Col>
                                </Row>
                            </Col>
                        </Row>
                    </Row>

                    {/* ENDING INVENTORY */}
                    <Row className="mt-5">
                        <h5 className="report-subheader green">INVENTORY</h5>
                    </Row>
                    <Row>
                        <Col xs={12}><h5 className="report-subheader justify-content-center">INITIAL</h5></Col>
                    </Row>
                    <div className="d-flex mb-2 justify-content-evenly">
                        <div className="print-table mx-2">
                            {renderInitialInventoryTable()}
                        </div>
                    </div>
                    <Row>
                        <Col xs={12}><h5 className="report-subheader justify-content-center">END</h5></Col>
                    </Row>
                    <div className="d-flex mb-2 justify-content-evenly">
                        <div className="print-table mx-2">
                           {renderEndInventoryTable()}
                        </div>
                    </div>
                    {/* INVENTORY SALES */}
                     <Row className="mt-5">
                        <h5 className="report-subheader green">INVENTORY SALES</h5>
                    </Row>
                    <Row>
                        <Col xs={3}><h5 className="report-subheader justify-content-start">ACTUAL</h5></Col>
                        <Col xs={3}><h5 className="report-subheader justify-content-end">Total: {actualTotalSales ? numberFormat(actualTotalSales) : "0.00"}</h5></Col>
                        <Col xs={3}><h5 className="report-subheader justify-content-start">SYSTEM</h5></Col>
                        <Col xs={3}><h5 className="report-subheader justify-content-end">Total: {systemTotalSales ? numberFormat(systemTotalSales) : "0.00"}</h5></Col>
                    </Row>
                    <div className="d-flex mb-2 justify-content-evenly">
                            {/* table */}
                        <div className="print-table mx-2 me-3">
                            {renderActualInventorySalesTable()}
                        </div>
                        <div className="print-table mx-2">
                            {renderSystemInventorySalesTable()}
                        </div>
                    </div>

                    {/* SUMMARY */}
                    <Row className="mt-5">
                        <h5 className="report-subheader justify-content-center green">SUMMARY</h5>
                    </Row>
                    <Row>
                        <Col className='print-table noscroll p-2 me-2'>
                            <Row>
                                <h5 className="report-subheader justify-content-center">SUMMARY</h5>
                            </Row>
                            <Row className="ms-2 mt-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center green lighter">Actual Inventory Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{salesSummary ? numberFormat(salesSummary.actual_inventory_sales) : "0.00"}</span></Col>
                            </Row>
                            <Row className="ms-2 p-2 me-3">
                                <Col xs={8}><span className="cash-breakdown-subheader justify-content-center green lighter">System Inventory Sales</span></Col>
                                <Col xs={4} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{salesSummary ? numberFormat(salesSummary.system_inventory_sales) : "0.00"}</span></Col>
                            </Row>
                            <hr/>
                            <Row className="ms-2 mb-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">OVERAGE/SHORTAGE</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(salesSummary.overage_inventory_sales) : "0.00"}</span></Col>
                            </Row>
                        </Col>
                        <Col className='print-table noscroll p-2 me-2'>
                            <Row>
                                <h5 className="report-subheader justify-content-center">ACTUAL INVENTORY SALES</h5>
                            </Row>
                            <Row className="ms-2 mt-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{numberFormat(actualTotalSales)}</span></Col>
                            </Row>
                            <Row className="ms-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Expenses</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{salesSummary ? numberFormat(salesSummary.total_expense) : "0.00"}</span></Col>
                            </Row>
                            <hr/>
                            <Row className="ms-2 mb-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Net Inventory Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(salesSummary.net_actual_sales) : "0.00"}</span></Col>
                            </Row>
                        </Col>
                        <Col className='print-table noscroll p-2 me-2'>
                            <Row>
                                <h5 className="report-subheader justify-content-center">SYSTEM INVENTORY SALES</h5>
                            </Row>
                            <Row className="ms-2 mt-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{systemTotalSales ? numberFormat(systemTotalSales) : "0.00"}</span></Col>
                            </Row>
                            <Row className="ms-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Expenses</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{salesSummary ? numberFormat(salesSummary.total_expense) : "0.00"}</span></Col>
                            </Row>
                            <hr/>
                            <Row className="ms-2 mb-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Net Inventory Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(salesSummary.net_system_sales) : "0.00"}</span></Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col className='print-table noscroll p-2 me-2'>
                            <Row>
                                <h5 className="report-subheader justify-content-center">ACTUAL SUMMARY</h5>
                            </Row>
                            <Row className="ms-2 mt-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Total Inventory Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{actualTotalSales?numberFormat(actualTotalSales):"0.00"}</span></Col>
                            </Row>
                            <Row className="ms-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">Actual Cash Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">-{salesSummary ? numberFormat(salesSummary.actual_cash_sales) : "0.00"}</span></Col>
                            </Row>
                            <hr/>
                            <Row className="ms-2 mb-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">OVERAGE/SHORTAGE</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(actualTotalSales - salesSummary.actual_cash_sales) : "0.00"}</span></Col>
                            </Row>
                        </Col>
                        <Col className='print-table noscroll p-2 me-2'>
                            <Row>
                                <h5 className="report-subheader justify-content-center">SYSTEM SUMMARY</h5>
                            </Row>
                            <Row className="ms-2 mt-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">System Total Inventory Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">{systemTotalSales?numberFormat(systemTotalSales):"0.00"}</span></Col>
                            </Row>
                            <Row className="ms-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">System Cash Sales</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="cash-breakdown-subheader">-{salesSummary ? numberFormat(salesSummary.system_cash_sales) : "0.00"}</span></Col>
                            </Row>
                            <hr/>
                            <Row className="ms-2 mb-2 p-2 me-3">
                                <Col xs={7}><span className="cash-breakdown-subheader justify-content-center lighter">OVERAGE/SHORTAGE</span></Col>
                                <Col xs={5} className='d-flex justify-content-end'><span className="total-sales-cont">{salesSummary ? numberFormat(systemTotalSales - salesSummary.system_cash_sales) : "0.00"}</span></Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                 {/* Print and Close Button */}
                <div className="d-flex justify-content-end pt-2 mb-3 d-flex-responsive">
                    <ReactToPrint
                        trigger={() => 
                            <button name="action" className="button-primary justify-content-center align-items-center print-btn d-flex justify-content-end"
                            >Print</button>}
                        content={() => componentRef.current}
                    />
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
    )
}