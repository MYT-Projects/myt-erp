import { Form } from "react-bootstrap";
import DataTable from "react-data-table-component-footer";
import { SyncLoader } from "react-spinners";
import NoDataPrompt from "../NoDataPrompt/NoDataPrompt";
import "./OneTable.css";

export default function TableTotal({
    tableHeaders,
    headerSelector,
    tableData,
    ActionBtn,
    ViewBtn,
    PaymentBtn,
    PendingBtn,
    showLoader,
    withActionData,
}) {
    const columns = tableHeaders.map((header, index) => {
        if (header === "-") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: ViewBtn,
                width: "7%",
                reorder: false,
                wrap: true,
            };
        } else if (header === ".") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: ViewBtn,
                width: "8%",
                reorder: false,
                wrap: true,
            };
        } else if (header === "*") {
            return {
                name: "",
                selector: (row) => row[headerSelector[index]],
                button: true,
                cell: PaymentBtn,
                width: "8%",
                reorder: false,
                wrap: true,
            };
        } else if (header === "ACTIONS" && !withActionData) {
            return {
                name: header,
                button: true,
                cell: ActionBtn,
                width: "8%",
                reorder: true,
            };
        } else if (header === " ") {
            return {
                name: header,
                button: true,
                cell: PendingBtn,
                // width: "10vw",
                reorder: true,
            };
        } else if (header === "STATUS") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                button: true,
                width: "5%",
            };
        } else if (header.includes("INVOICE NO.")) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "7%",
                wrap: true,
                reorder: true,
            };
        } else if (header === "DOC. NO") {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "6%",
                wrap: true,
                reorder: true,
            };
        } 
        // else if (header.includes("FRANCHISEE")) {
        //     return {
        //         name: header,
        //         selector: (row) => row[headerSelector[index]],
        //         sortable: true,
        //         width: "20%",
        //         wrap: true,
        //         reorder: true,
        //     };
        // } else if (header.includes("FRANCHISEE FEE")) {
        //     return {
        //         name: header,
        //         selector: (row) => row[headerSelector[index]],
        //         sortable: true,
        //         width: "5%",
        //         reorder: true,
        //     };
        // } 
        else if (
            header === "TOTAL" ||
            header === "BALANCE" || header === "PAID AMOUNT"
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                width: "9%",
                wrap: true,
                reorder: true,
                footer: "total"
            };
        }
        else if (
            header.includes("DATE") ||
            header.includes("TOTAL") ||
            header.includes("BALANCE")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                width: "9%",
                wrap: true,
                reorder: true,
            };
        } else {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                // sortable: true,
                width: "10%",
                wrap: true,
                reorder: true,
            };
        }
    });

    const footer = {
        title: "Total films (2)"
      };

    // const footer = tableHeaders.map((header, index) => {
    //     if (
    //         header === "TOTAL" ||
    //         header === "BALANCE" || header === "PAID AMOUNT"
    //     ) {
    //         return {
    //             name: header,
    //             selector: (row) => row[headerSelector[index]],
    //             width: "9%",
    //             cell: "JENO LEE",
    //             wrap: true,
    //         };
    //     } else {
    //         return {
    //             name: header,
    //             selector: (row) => row[headerSelector[index]],
    //             cell: "JENO LEE",
    //             width: "10%",
    //             wrap: true,
    //         };
    //     }
    // });

    const paginationComponentOptions = {
        rowsPerPageText: "",
        noRowsPerPage: true,
    };

    const customStyles = {
        rows: {
            style: {
                minHeight: "5.2vh",
                flexWrap: "wrap",
                fontSize: "12px",
                whiteSpace: "pre",
            },
        },
        headCells: {
            style: {
                flexWrap: "wrap",
                fontSize: "12px",
                width: "100%",
                wordWrap: "breakWord",
            },
        },
    };

    return showLoader ? (
        <div className="d-flex justify-content-center my-5">
            <SyncLoader color="#5ac8e1" size={15} />
        </div>
    ) : (
        <DataTable
            grow
            pagination
            responsive
            striped
            fixedHeader
            columns={columns}
            footer={footer}
            data={tableData}
            customStyles={customStyles}
            paginationComponentOptions={paginationComponentOptions}
            noDataComponent={<NoDataPrompt />}
        />
    );
}
