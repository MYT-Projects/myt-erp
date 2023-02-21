import { Modal, Button, Form, Container } from "react-bootstrap";
import React, { useState } from "react";
// import { render } from "react-dom";
import warning from "../../Assets/Images/Modal/warning.png";

//css
import "./Modal.css";

function ViewModal(props) {
  // const [viewData, setViewData] = useState({});
  // const handleEditChange = (e) => {
  //   const {name,value} = e.target;
  //   // setEditData((prev)=>{...prev, name: [value]})
  // }
  return (
    <div>
      <Modal
        show={props.show}
        onHide={props.onHide}
        size={props.size}
        centered
      >
      <Modal.Header closeButton/>
        <Modal.Body>
          <div className="col-sm-12">
          {props.withHeader && (
                  <div className="col-sm-12">
                  <span className="custom-modal-body-title"> VIEW {props.title} </span>
                  </div>
          )}
            <Container fluid className="modal-cont justify-content-center">
              {props.children}
            </Container>
          {props.withButtons && (
              <div className="col-sm-12 mt-3 d-flex justify-content-end">
              <button className="button-primary  me-3" onClick={props.onEdit}>
                Edit
              </button>
              <button className="button-tertiary mr-3" onClick={props.onHide}>
                Close
              </button>
            </div>
          )}
          {props.withCloseButtons && (
              <div className="col-sm-12 mt-3 d-flex justify-content-end">
              <button className="button-tertiary mr-3" onClick={props.onHide}>
                Close
              </button>
            </div>
          )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

ViewModal.defaultProps = {
  title:"",
  type:"",
  size:"xl",
  withButtons: false,
  withHeader: false,
  show:()=>{},
  onHide:()=>{},
  onEdit:()=>{}
}

export default ViewModal;