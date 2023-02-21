import { Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import "../../../Components/TableTemplate/Table.css";

export default function Table({
    tableHeaders,
    headerSelector,
    tableData,
    ActionBtn,
    ViewBtn,
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
        } else if (header === "ACTIONS") {
            return {
                name: header,
                button: true,
                cell: ActionBtn,
                width: "7vw",
                reorder: true,
            };
        } else if (
            header.includes("NAME")
        ) {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "75vw",
                reorder: true,
            };
        } else {
            return {
                name: header,
                selector: (row) => row[headerSelector[index]],
                sortable: true,
                width: "15vw",
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

    return (
        <DataTable
            pagination
            striped
            fixedHeader
            fixedHeaderScrollHeight="50vh"
            columns={columns}
            data={tableData}
            customStyles={customStyles}
            paginationComponentOptions={paginationComponentOptions}
        />
    );
}
