import React from "react";
import ReactLoading from "react-loading";

function SubmitButton({ type = "save", isClicked, submit }) {
  if (type == "save") {
    if (isClicked) {
      return (
        <button className="main-save-btn-long-form loader">
          <ReactLoading type="balls" color="#FFFFFF" height={20} width={25} />
        </button>
      );
    } else {
      return (
        <button className="main-save-btn-long-form" onClick={() => submit()}>
          Save
        </button>
      );
    }
  }
  if (type == "search") {
    if (isClicked) {
      return (
        <button className="main-search-btn-long-form loader-lookup">
          <ReactLoading type="balls" color="#FFFFFF" height={20} width={24} />
        </button>
      );
    } else {
      return (
        <button className="main-search-btn-long-form" onClick={() => submit()}>
          Search
        </button>
      );
    }
  } else if (type == "delete") {
    if (isClicked) {
      return (
        <button className="main-cancel-btn-long-form subtype loader-cancel">
          <ReactLoading type="balls" color="#FFFFFF" height={30} width={30} />
        </button>
      );
    } else {
      return (
        <button
          className="main-cancel-transaction-btn-long-form subtype"
          onClick={() => submit()}
        >
          Cancel Transaction
        </button>
      );
    }
  } else if (type == "cancel") {
    if (isClicked) {
      return (
        <button className="modal-accept-btn-admin loader-cancel">
          <ReactLoading type="balls" color="#FFFFFF" height={30} width={30} />
        </button>
      );
    } else {
      return (
        <button className="modal-accept-btn-admin" onClick={() => submit()}>
          Save
        </button>
      );
    }
  }
}

export default SubmitButton;
