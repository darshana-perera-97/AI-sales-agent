import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "../Layouts/FormDesign.css";

// Custom Modal Component
const Modal = ({ show, onClose, fields, submitButton }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modalContent}>
        <h2>Form Preview</h2>
        <form
          id="previewForm"
          onSubmit={(e) => {
            e.preventDefault();
            window.alert("Hi");

            const formData = new FormData(e.target);
            const formFields = {};
            formData.forEach((value, key) => {
              formFields[key] = value;
            });

            console.log(formFields); // Log form data in the console
          }}
        >
          {fields.map((field, index) => (
            <div
              key={index}
              className="form-group"
              style={{ marginBottom: "10px" }}
            >
              <input
                type={field.type}
                id={field.id}
                placeholder={field.placeholder}
                required={field.required}
                style={{ padding: "10px", width: "100%" }}
              />
            </div>
          ))}
          <button
            type="submit"
            className="submit-button"
            style={{
              backgroundColor: submitButton.backgroundColor,
              color: submitButton.textColor,
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {submitButton.text}
          </button>
        </form>
        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

// Styles for Modal
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay
    zIndex: 9999, // Ensure it's above everything
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    maxWidth: "90%",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  },
  closeButton: {
    marginTop: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "4px",
  },
};

export default Modal;
