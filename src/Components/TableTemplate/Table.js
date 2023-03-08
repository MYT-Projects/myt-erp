import { Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { SyncLoader } from "react-spinners";
import NoDataPrompt from "../NoDataPrompt/NoDataPrompt";
import "./Table.css";

export default function Table({
    tableHeaders,
    headerSelector,
    tableData,
    ActionBtn,
    ViewBtn,
    PendingBtn,
    showLoader,
    withActionData,
    onRowClicked,
    SaleBtn,
    ContractBtn,
    SaleBillingBtn,
    checkBtn,
    CheckBox,
    newTabBtn,
    tableType,
    OngoingPOBadges,
    DoneBtn,
    PaymentBtn,
    InvoiceBtn,
    materialsList,
    branchStatus
}) {
    const columns = tableHeaders.map((header, index) => {
        if (header === "-") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: ViewBtn,
                width: "5vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } if (header === "/") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: DoneBtn,
                width: "4vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } else if (header === "+") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: PaymentBtn,
                width: "7vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } else if (header === "*") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: CheckBox,
                width: "4vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } else if (header === "PO") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: OngoingPOBadges,
                // width: "5vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } else if (header === ".") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: checkBtn,
                width: "3vw",
                reorder: false,
                wordWrap: "break-word",
            };
        } else if (header === "PYMT REF NO" || header === "PYMT MODE") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: newTabBtn,
                width: "8%",
                reorder: false,
                wrap: true,
            };
        } else if (header === "ACTIONS" && !withActionData) {
            return {
                name: header,
                button: true,
                cell: ActionBtn,
                width: "7vw",
                reorder: false,
                center: true,
            };
        } else if (header === "   ") {
            return {
                name: header,
                button: true,
                cell: PendingBtn,
                width: "17vw",
                reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === " ") {
            return {
                name: header,
                button: true,
                cell: PendingBtn,
                width: "7vw",
                reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === "PRODUCT NAME") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                width: "40vw",
                reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === "PHONE NUMBER") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                width: "10vw",
                reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === "INV NO."|| header === "CONT. NO.") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                width: "8vw",
                cell: InvoiceBtn,
                reorder: true,
            };
        } else if (
            header.includes("SALES")||
            header.includes("BAL")||
            header.includes("AMT")||
            header.includes("DISCOUNT")||
            header.includes("CONTRACT")||
            header.includes("MONTHLY BILLABLES")
            ) {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] === null
                        ? "N/A"
                        : row[headerSelector[index]]?.toLowerCase(),
                right: true,
                width: "7vw",
                cell: SaleBtn,
                reorder: true,
            };
        } else if (header === "CONTRACT") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]].toLowerCase(),
                button: true,
                width: "11vw",
                cell: ContractBtn,
                reorder: true,
            };
        } else if (header === "MONTHLY BILLABLES") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]].toLowerCase(),
                button: true,
                width: "11vw",
                cell: SaleBillingBtn,
                reorder: true,
            };
        } else if (header === "RAW MATERIALS") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]].toLowerCase(),
                button: true,
                width: "15vw",
                cell: materialsList,
                reorder: true,
            };
        } else if (header === "BRANCH STATUS") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]].toLowerCase(),
                button: true,
                width: "10vw",
                cell: branchStatus,
                reorder: true,
            };
        } else if (header.includes("FRANCHISEE NAME")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "15vw",
                reorder: true,
            };
        } else if (header.includes("BRANCH NAME")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "16vw",
                reorder: true,
                wrap: true,
            };
        } else if (header === "COMPANY EMAIL") {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] === null
                        ? "N/A"
                        : row[headerSelector[index]]?.toLowerCase(),
                left: true,
                width: "15vw",
                reorder: true,
                Cell: (row) => {
                    const email = row.email;
                    if (!email) return "";
                    return email.toLowerCase();
                },
                wrap: true,
            };
        } else if (header.includes("SUPPLIER")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "10vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("DOC TYPE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "8vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("UNIT") || header.includes("QUANTITY") || header.includes("PRICE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "8vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("COMPANY NAME")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "15vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("SUPPLIER/VENDOR")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "10vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("PO NO.")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "6.8vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("DOC NO.")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                // sortable: true,
                width: "7vw",
                reorder: true,
                wrap: true,
            };
        } else if ((header.includes("NO.") || 
                    header.includes("no.")|| 
                    header === "CUR QTY" || 
                    header === "BRKDN VALUE" || 
                    (header.includes("DR NO"))) && 
                    header !== "INV NO.") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "7vw",
                reorder: true,
            };
        } else if (header.includes("ROLE") || header.includes("TYPE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "12vw",
                reorder: true,
            };
        } else if (
            header.includes("USERNAME")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                sortable: true,
                width: "30vw",
                reorder: true,
            };
        } else if (
            header.includes("INITIAL CASH IN DRAWER")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "16vw",
                reorder: true,
            };
        } else if (header.includes("FULL NAME")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "25vw",
                reorder: true,
            };
        } else if (header === "PAYMENT DATE" || header === "PAY DATE") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                sortable: true,
                width: "14vw",
                reorder: true,
            };
        } else if (header === "DETAILS") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "30vw",
                reorder: true,
                wrap: true,
            };
        } else if (header === "MIN" || 
            header === "MAX" || 
            header.includes("QTY") || 
            header.includes("Qty") ||
            header.includes("COUNT") ||
            header.includes("DIFFERENCE")||
            // header.includes("QUANTITY")||
            // header.includes("PRICE")||
            header.includes("YIELD")
            ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "8vw",
                reorder: true,
                wrap: true,
            };
        } else if (header === "ADDRESS") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "25vw",
                reorder: true,
                wrap: true,
            };    
        } else if (header.includes("DATE ISSUED")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                sortable: true,
                width: "10vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("DATE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                sortable: true,
                width: "10vw",
                reorder: true,
                wrap: true,
            };
        } else if (
            header.includes("TOTAL")|| 
            header.includes("AMOUNT PAID")|| 
            header.includes("AMOUNT")
            ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "8vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("STATUS")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "10vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("BY")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "9vw",
                reorder: true,
                wrap: true,
            };
        } else if (header.includes("BALANCE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "7vw",
                reorder: true,
                wrap: true,
            };
        } else {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "10vw",
                reorder: true,
                wrap: true,
            };
        }
    });

    const paginationComponentOptions = {
        rowsPerPageText: "",
        noRowsPerPage: true,
    };

    const customStyles = {
        rows: {
            style: {
                minHeight: "5.2vh",
            },
        },
    };

    return showLoader ? (
        <div className="d-flex justify-content-center my-5">
            <SyncLoader color="#5ac8e1" size={15} />
        </div>
    ) : (
        <DataTable
            pagination={tableType === "item_history" ? false : true}
            striped
            fixedHeader
            fixedHeaderScrollHeight="50vh"
            columns={columns}
            data={tableData}
            customStyles={customStyles}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent={<NoDataPrompt />}
            defaultSortFieldId={tableType === "itemList" && 2}
        />
    );
}
