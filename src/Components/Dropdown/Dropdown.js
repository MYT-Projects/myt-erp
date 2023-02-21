import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//css
import "./Dropdown.css";

function Dropdown({
  type,
  selected,
  setSelected,
  options,
  id,
  status,
  selectedColor,
}) {
  const [isActive, setIsActive] = useState(false);
  const [activeSelect, setActiveSelect] = useState(
    type === "status" ? status : "Select"
  );
  const [color, setColor] = useState(selectedColor);

  const ref = useRef();

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (isActive && ref.current && !ref.current.contains(e.target)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);

    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [isActive]);

  // should be the same with the name of the dropdown button type
  if (type === "supplier") {
    return (
      <div className="dropdown" ref={ref}>
        <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
          {activeSelect}
          <FontAwesomeIcon
            icon={"caret-down"}
            alt={"open"}
            className={"max-menu"}
            aria-hidden="true"
          />
        </div>
        {isActive && (
          <div className="dropdown-content">
            {options.map((option) => {
              return (
                <div
                  className={"dropdown-item " + option.color}
                  onClick={() => {
                    setSelected({ value: option.value });
                    setIsActive(false);
                    setActiveSelect((option = "Select"));
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (type === "po") {
    return (
      <div className="dropdown" ref={ref}>
        <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
          {activeSelect}
          <FontAwesomeIcon
            icon={"caret-down"}
            alt={"open"}
            className={"max-menu"}
            aria-hidden="true"
          />
        </div>
        {isActive && (
          <div className="dropdown-content">
            {options.map((option) => {
              return (
                <div
                  className={"dropdown-item " + option.color}
                  onClick={() => {
                    setSelected({ value: option.value });
                    setIsActive(false);
                    setActiveSelect((option = "Select"));
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (type === "appointments") {
    return (
      <div className="dropdown" ref={ref}>
        <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
          {activeSelect}
          <FontAwesomeIcon
            icon={"caret-down"}
            alt={"open"}
            className={"max-menu"}
            aria-hidden="true"
          />
        </div>
        {isActive && (
          <div className="dropdown-content">
            {options.map((option) => {
              return (
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setSelected({
                      value: option.value,
                    });
                    setIsActive(false);
                    setActiveSelect(option.label);
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else if (type === "banks") {
    return (
      <div className="dropdown" ref={ref}>
        <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
          {activeSelect}
          <FontAwesomeIcon
            icon={"caret-down"}
            alt={"open"}
            className={"max-menu"}
            aria-hidden="true"
          />
        </div>
        {isActive && (
          <div className="dropdown-content">
            {options.map((option) => {
              return (
                <div
                  className={"dropdown-item " + option.color}
                  onClick={() => {
                    setSelected({ value: option.value });
                    setIsActive(false);
                    setActiveSelect((option = "Select"));
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="dropdown" ref={ref}>
        <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
          {activeSelect}
          <FontAwesomeIcon
            icon={"caret-down"}
            alt={"open"}
            className={"max-menu"}
            aria-hidden="true"
          />
        </div>
        {isActive && (
          <div className="dropdown-content">
            {options.map((option) => {
              return (
                <div
                  className={"dropdown-item " + option.color}
                  onClick={() => {
                    setSelected({ value: option.value });
                    setIsActive(false);
                    setActiveSelect((option = "Select"));
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default Dropdown;
