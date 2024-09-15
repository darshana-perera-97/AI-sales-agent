import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./FormDesign.css";

const InputTypes = {
  TEXT: "text",
  EMAIL: "email",
  URL: "url",
  NUMBER: "number",
  CONTACT: "tel",
};

// Draggable input items
const DraggableInput = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "input",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="draggable-input"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {label}
    </div>
  );
};

// Form Preview with Reordering and Item Removal
const FormPreview = ({
  fields,
  setFields,
  setSelectedField,
  submitButton,
  setSelectedButton,
}) => {
  const moveItem = (dragIndex, hoverIndex) => {
    const draggedItem = fields[dragIndex];
    const updatedFields = [...fields];
    updatedFields.splice(dragIndex, 1);
    updatedFields.splice(hoverIndex, 0, draggedItem);
    setFields(updatedFields);
  };

  const handleRemove = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const [{ isOver }, drop] = useDrop({
    accept: "input",
    drop: (item) => handleDrop(item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const handleDrop = (type) => {
    setFields((prevFields) => [
      ...prevFields,
      {
        id: `input-${fields.length + 1}`,
        type,
        placeholder: `Enter ${type}`,
      },
    ]);
  };

  const DraggableField = ({ field, index, moveField, removeField }) => {
    const ref = React.useRef(null);

    const [, drag] = useDrag({
      type: "field",
      item: { index },
    });

    const [{ isOver }, drop] = useDrop({
      accept: "field",
      hover: (item) => {
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveField(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    drag(drop(ref));

    return (
      <div
        ref={ref}
        className="input-field-wrapper"
        onClick={() => {
          setSelectedField({ ...field, index });
          setSelectedButton(false); // Deselect submit button when an input is clicked
        }}
        style={{
          border: isOver ? "2px dashed #007bff" : "1px solid #ccc",
          position: "relative",
        }}
      >
        <input
          id={field.id}
          type={field.type}
          placeholder={field.placeholder}
          style={{ marginBottom: "10px", width: "100%" }}
        />
        <button className="remove-btn" onClick={() => removeField(index)}>
          Remove
        </button>
        <span
          className="input-index"
          style={{ position: "absolute", top: "5px", left: "5px" }}
        >
          {index + 1}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={drop}
      className="form-preview"
      style={{
        padding: "20px",
        minHeight: "300px",
        border: isOver ? "2px dashed #007bff" : "1px solid #ccc",
      }}
    >
      {fields.length === 0 ? (
        <div>Drag input elements here</div>
      ) : (
        <>
          {fields.map((field, index) => (
            <DraggableField
              key={index}
              field={field}
              index={index}
              moveField={moveItem}
              removeField={handleRemove}
            />
          ))}
          <button
            type="submit"
            style={{
              backgroundColor: submitButton.backgroundColor,
              color: submitButton.textColor,
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => {
              setSelectedButton(true); // Mark submit button as selected
              setSelectedField(null); // Deselect any input field when submit button is selected
            }}
          >
            {submitButton.text}
          </button>
        </>
      )}
    </div>
  );
};

// Settings Panel for Selected Field or Button
const SettingsPanel = ({
  selectedField,
  updateField,
  submitButton,
  updateSubmitButton,
  isSubmitButtonSelected,
}) => {
  if (!selectedField && !isSubmitButtonSelected)
    return <div>Select an input to edit settings</div>;

  const handleChange = (key, value) => {
    if (isSubmitButtonSelected) {
      updateSubmitButton(key, value);
    } else {
      updateField({ ...selectedField, [key]: value });
    }
  };

  return (
    <div className="settings-panel">
      {!isSubmitButtonSelected && selectedField && (
        <>
          <h5>Input Settings (#{selectedField.index + 1})</h5>
          <label>ID</label>
          <input
            type="text"
            value={selectedField.id}
            onChange={(e) => handleChange("id", e.target.value)}
            style={{ marginBottom: "10px", width: "100%" }}
          />
          <label>Placeholder</label>
          <input
            type="text"
            value={selectedField.placeholder}
            onChange={(e) => handleChange("placeholder", e.target.value)}
            style={{ marginBottom: "10px", width: "100%" }}
          />
        </>
      )}

      {isSubmitButtonSelected && (
        <>
          <hr />
          <h5>Submit Button Settings</h5>
          <label>Button Text</label>
          <input
            type="text"
            value={submitButton.text}
            onChange={(e) => handleChange("text", e.target.value)}
            style={{ marginBottom: "10px", width: "100%" }}
          />
          <label>Background Color</label>
          <input
            type="color"
            value={submitButton.backgroundColor}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
            style={{ marginBottom: "10px", width: "100%" }}
          />
          <label>Text Color</label>
          <input
            type="color"
            value={submitButton.textColor}
            onChange={(e) => handleChange("textColor", e.target.value)}
            style={{ marginBottom: "10px", width: "100%" }}
          />
        </>
      )}
    </div>
  );
};

// Main Form Design Component
export default function FormDesign() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [isSubmitButtonSelected, setSelectedButton] = useState(false);
  const [submitButton, setSubmitButton] = useState({
    text: "Submit",
    backgroundColor: "#007bff",
    textColor: "#ffffff",
  });

  const updateField = (updatedField) => {
    setFields((prevFields) =>
      prevFields.map((field, index) =>
        index === updatedField.index ? updatedField : field
      )
    );
    setSelectedField(updatedField);
    setSelectedButton(false); // Deselect submit button when an input field is selected
  };

  const updateSubmitButton = (key, value) => {
    setSubmitButton({ ...submitButton, [key]: value });
    setSelectedButton(true); // Mark submit button as selected
    setSelectedField(null); // Deselect input field when submit button is selected
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <h3 className="mt-5">Form Elements</h3>
            <DraggableInput type={InputTypes.TEXT} label="Text Input" />
            <DraggableInput type={InputTypes.EMAIL} label="Email Input" />
            <DraggableInput type={InputTypes.URL} label="URL Input" />
            <DraggableInput type={InputTypes.NUMBER} label="Number Input" />
            <DraggableInput type={InputTypes.CONTACT} label="Contact Number" />
          </div>

          <div className="col-md-5">
            <h3 className="mt-5">Form Preview</h3>
            <FormPreview
              fields={fields}
              setFields={setFields}
              setSelectedField={setSelectedField}
              submitButton={submitButton}
              setSelectedButton={setSelectedButton}
            />
          </div>

          <div className="col-md-4">
            <h3 className="mt-5">Settings</h3>
            <SettingsPanel
              selectedField={selectedField}
              updateField={updateField}
              submitButton={submitButton}
              updateSubmitButton={updateSubmitButton}
              isSubmitButtonSelected={isSubmitButtonSelected}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
