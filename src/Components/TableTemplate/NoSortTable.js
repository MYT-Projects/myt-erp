import { Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { SyncLoader } from "react-spinners";
import NoDataPrompt from "../NoDataPrompt/NoDataPrompt";
import "./Table.css";

export default function NoSortTable({
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
    tableType,
}) {
    const columns = tableHeaders.map((header, index) => {
        if (header === "-") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: ViewBtn,
                width: "4vw",
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
        } else if (header === "ACTIONS" && !withActionData) {
            return {
                name: header,
                button: true,
                cell: ActionBtn,
                width: "7vw",
                reorder: false,
                center: true,
            };
        } else if (header === " ") {
            return {
                name: header,
                button: true,
                cell: PendingBtn,
                width: "10vw",
                // reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === "PRODUCT NAME") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                width: "40vw",
                // reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === "INITIAL CASH IN DRAWER") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                width: "16vw",
                // reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === "PHONE NUMBER") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                width: "10vw",
                // reorder: true,
                wordWrap: "break-word",
            };
        } else if (header === "SALES") {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] === null
                        ? "N/A"
                        : row[headerSelector[index]]?.toLowerCase(),
                button: true,
                width: "11vw",
                cell: SaleBtn,
                // reorder: true,
            };
        } else if (header === "CONTRACT" || header === "DOC NO.") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]].toLowerCase(),
                button: true,
                width: "11vw",
                cell: ContractBtn,
                // reorder: true,
            };
        } else if (header === "MONTHLY BILLABLES") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]].toLowerCase(),
                button: true,
                width: "11vw",
                cell: SaleBillingBtn,
                // reorder: true,
            };
        } else if (header.includes("FRANCHISEE NAME")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "15vw",
                // reorder: true,
            };
        } else if (header.includes("BRANCH NAME")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "16vw",
                // reorder: true,
            };
        } else if (header === "COMPANY EMAIL") {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] === null
                        ? "N/A"
                        : row[headerSelector[index]]?.toLowerCase(),
                button: true,
                width: "15vw",
                // reorder: true,
                Cell: (row) => {
                    const email = row.email;
                    if (!email) return "";
                    return email.toLowerCase();
                },
            };
        } else if (header.includes("SUPPLIER")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "10vw",
                // reorder: true,
                wrap: true,
            };
        } else if (header.includes("SUPPLIER/VENDOR")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "10vw",
                // reorder: true,
                wrap: true,
            };
        } else if (header.includes("PO NO.")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "100px",
                // reorder: true,
                wrap: true,
            };
        // } else if (header.includes("DOC NO.")) {
        //     return {
        //         name: header,
        //         selector: (row) => row[headerSelector[index]],
        //         // sortable: true,
        //         width: "10vw",
        //         // reorder: true,
        //     };
        } else if (header.includes("DOC DATE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "10vw",
                reorder: true,
            };
        } else if (header.includes("NO.") || header.includes("no.")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "93px",
                // reorder: true,
            };
        } else if (header.includes("ROLE") || header.includes("TYPE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "15vw",
                // reorder: true,
            };
        } else if (
            // header.includes("BRANCH NAME") ||
            // header.includes("INGREDIENT NAME") ||
            header.includes("PRODUCT NAME")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "55vw",
                // reorder: true,
            };
            // } else if (header.includes("INGREDIENT NAME")) {
            //     return {
            //         name: header,
            //         selector: (row) => row[headerSelector[index]],
                    // sortable: true,
            //         width: "45vw",
                    // reorder: true,
            //     };
        } else if (
            header.includes("USERNAME") ||
            header.includes("INITIAL CASH IN DRAWER")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "30vw",
                // reorder: true,
            };
        } else if (header.includes("FULL NAME")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "25vw",
                // reorder: true,
            };
        } else if (header === "PAYMENT DATE") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "14vw",
                // reorder: true,
            };
        } else if (header === "DETAILS") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "30vw",
                // reorder: true,
                wrap: true,
            };
        } else if (header.includes("DATE ISSUED")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "10vw",
                // reorder: true,
                wrap: true,
            };
        } else if (header.includes("DATE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "10vw",
                // reorder: true,
                wrap: true,
            };
        } else if (
            header.includes("TOTAL")||
            header.includes("AMOUNT PAID")|| 
            header.includes("CURRENT")|| 
            header === "in"||
            header === "out"
            ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                // sortable: true,
                width: "8vw",
                // reorder: true,
                wrap: true,
            };
        } else if (header.includes("STATUS")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "10vw",
                // reorder: true,
                wrap: true,
            };
        } else if (header.includes("BY")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "9vw",
                // reorder: true,
                wrap: true,
            };
        } else if (header.includes("BALANCE")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "7vw",
                // reorder: true,
                wrap: true,
            };
        } else {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "10vw",
                // reorder: true,
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
            pagination={tableType === 'item_history' ? false : true}
            striped
            fixedHeader
            fixedHeaderScrollHeight="50vh"
            columns={columns}
            data={tableData}
            customStyles={customStyles}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent={<NoDataPrompt />}
            // defaultSortFieldId={tableType === "itemList" && 2}
        />
    );
}