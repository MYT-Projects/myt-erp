import { SyncLoader } from "react-spinners";
import DataTable from "react-data-table-component";
import NoDataPrompt from "../NoDataPrompt/NoDataPrompt";
import "./Table.css";

function toCurrency(numberString) {
    let number = parseFloat(numberString);
    return number.toLocaleString('USD');
}

export default function Table({
    tableHeaders,
    headerSelector,
    tableData,
    ActionBtn,
    PendingBtn,
    ViewBtn,
    showLoader,
    withActionData,
    PayBtn,
    // hasPending=false
}) {
    const columns = tableHeaders.map((header, index) => {
        if (header === "-") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: ViewBtn,
                width: "7vw",
                reorder: false,
            };
        } else if (header === "*") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: PayBtn,
                width: "7vw",
                reorder: false,
            };
        } else if (header === "PRINT TEMPLATE") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                width: "25vw",
                reorder: true,
            };   
        } else if (header === "CLASSIFICATION") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                width: "30vw",
                reorder: true,
            };
        } else if (header === "USERNAME") {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] !== null
                        ? row[headerSelector[index]].toLowerCase()
                        : "",
                left: true,
                width: "10vw",
                reorder: true,
            };
        } else if (header === "FRANCHISE DATE") {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] !== null
                        ? row[headerSelector[index]]
                        : "",
                button: true,
                width: "10vw",
                sortable: true,
                reorder: true,
            };
        } else if (header === "ADDRESS") {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] !== null
                        ? row[headerSelector[index]]
                        : "",
                button: true,
                width: "20vw",
                reorder: true,
            };
        } else if (header === "FRANCHISEE") {
            return {
                name: header,
                selector: (row) =>
                    row[headerSelector[index]] !== null
                        ? row[headerSelector[index]]
                        : "",
                left: true,
                width: "15vw",
                reorder: true,
                sortable: true,
            };
        } else if (header === "BRANCH NAME") {
            return {
                name: header,
                left: true,
                selector: (row) =>
                    row[headerSelector[index]] !== null
                        ? row[headerSelector[index]]
                        : "",
                // button: true,
                width: "15vw",
                reorder: true,
                sortable: true,
            };
        } else if (header === "ACTIONS" && !withActionData) {
            return {
                name: header,
                button: true,
                cell: ActionBtn,
                width: "6vw",
                reorder: true,
            };
        } else if (header === " ") {
            return {
                name: header,
                button: true,
                cell: PendingBtn,
                width: "10vw",
                reorder: true,
            };
        } else if (header==="ACCOUNT NO.") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "15vw",
                reorder: true,
            };
        } else if (header.includes("NO.")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "7vw",
                reorder: true,
            };
        } else if (header.includes("SUPPLIER")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "20vw",
                reorder: true,
            };
        // } else if (
        //     header.includes("DATE")||
        //     header.includes("CNTRCT END")
        //     ) {
        //     return {
        //         name: header,
        //         selector: (row) => row[headerSelector[index]],
        //         center: true,
        //         sortable: true,
        //         width: "10vw",
        //         reorder: true,
        //     };
        } else if (
            header.includes("AMOUNT")||
            header.includes("CREDIT")||
            header.includes("BALANCE")||
            header.includes("TOTAL")||
            header.includes("PACKAGE")||
            header.includes("DOC. NO")||
            header.includes("INVCE NO.")||
            header.includes("PRICE")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                right: true,
                sortable: true,
                width: "10vw",
                reorder: true,
            };
    
        } else if (
            header.includes("NAME") ||
            header.includes("ADDRESS") ||
            header.includes("PRINT TEMPLATE") ||
            header.includes("BANK NAME") ||
            header.includes("FULL NAME") ||
            header.includes("USERNAME") ||
            header.includes("BRANCH NAME")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                sortable: true,
                width: "16vw",
                reorder: true,
            };
        } else {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                left: true,
                sortable: true,
                width: "10vw",
                reorder: true,
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

    // //console.log(showLoader)
    //console.log("columns");
    //console.log(columns);
    return showLoader ? (
        <div className="d-flex justify-content-center my-5">
            <SyncLoader color="#169422" size={15} />
        </div>
    ) : (
        <DataTable
            pagination
            striped
            fixedHeader
            fixedHeaderScrollHeight="50vh"
            columns={columns}
            data={tableData}
            customStyles={customStyles}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent={<NoDataPrompt />}
        />
    );
}
