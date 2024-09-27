import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./FormDesign.css";
import config from "../config"; // Import config file

// Input types for draggable items
const InputTypes = {
  TEXT: "text",
  EMAIL: "email",
  URL: "url",
  NUMBER: "number",
  CONTACT: "tel",
};

// Initial mandatory fields
const mandatoryFields = [
  {
    id: "fullName",
    type: "text",
    placeholder: "Enter Full Name",
    label: "Full Name",
    required: true,
  },
  {
    id: "destination",
    type: "text",
    placeholder: "Enter Destination",
    label: "Destination",
    required: true,
  },
  {
    id: "company",
    type: "text",
    placeholder: "Enter Company",
    label: "Company",
    required: true,
  },
];

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

// Modal Component for Form Preview
const Modal = ({
  show,
  onClose,
  fields,
  submitButton,
  replyMailEnabled,
  replyMailContent,
}) => {
  if (!show) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formFields = {};
    formData.forEach((value, key) => {
      formFields[key] = value;
    });

    const emailData = {
      to: localStorage.getItem("userName"), // Assuming this holds the recipient's email
      subject: "New Form Submission",
      text: `Here is a summary of the form submission:\n\n${JSON.stringify(
        formFields,
        null,
        2
      )}`,
      html: `<h3>New Form Submission</h3><ul>${Object.entries(formFields)
        .map(([key, value]) => `<li>${key}: ${value}</li>`)
        .join("")}</ul>`,
    };

    // Send the confirmation email to the user if reply mail is enabled
    if (replyMailEnabled && formFields.userEmail) {
      const userMailData = {
        to: formFields.userEmail,
        subject: "Thank you for your submission!",
        text: replyMailContent || "We have received your submission.",
      };
      try {
        await fetch(`${config.API_BASE_URL}/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userMailData),
        });
      } catch (error) {
        console.error("Error sending reply email:", error);
        alert("Failed to send reply email.");
      }
    }

    try {
      const response = await fetch(`${config.API_BASE_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        alert("Form submitted and email sent!");
      } else {
        const errorData = await response.json();
        console.error("Error sending email:", errorData);
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("An error occurred while sending the email.");
    }
  };

  // Check if an email field already exists in the form
  const emailFieldExists = fields.some((field) => field.type === "email");

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modalContent}>
        <h2>Form Preview</h2>
        <form id="previewForm" onSubmit={handleSubmit}>
          {fields.map((field, index) => (
            <div
              key={index}
              className="form-group"
              style={{ marginBottom: "10px" }}
            >
              <input
                type={field.type}
                id={field.id}
                name={field.id}
                placeholder={field.placeholder}
                required={field.required}
                style={{ padding: "10px", width: "100%" }}
              />
            </div>
          ))}
          {/* Add email input only if not already present and replyMailEnabled */}
          {replyMailEnabled && !emailFieldExists && (
            <div className="form-group" style={{ marginBottom: "10px" }}>
              <input
                type="email"
                id="userEmail"
                name="userEmail"
                placeholder="Enter your email"
                required
                style={{ padding: "10px", width: "100%" }}
              />
            </div>
          )}
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

// New Modal Component to Show Full HTML Code
const EmbedModal = ({ show, onClose, formCode }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(formCode);
    alert("Form code copied to clipboard!");
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modalContent}>
        <h2>Embed Form Code</h2>
        <textarea
          readOnly
          value={formCode}
          style={{ width: "100%", height: "300px", marginBottom: "10px" }}
        />
        <button onClick={handleCopyCode} style={styles.copyButton}>
          Copy Code
        </button>
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
  copyButton: {
    marginTop: "10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "4px",
  },
};

// Form Preview Component
const FormPreview = ({
  fields,
  setFields,
  submitButton,
  setSelectedField,
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
    if (fields[index].required) return; // Prevent removal of mandatory fields
    setFields(fields.filter((_, i) => i !== index));
  };

  const [{ isOver }, drop] = useDrop({
    accept: ["input", "field"],
    drop: (item, monitor) => {
      if (monitor.getItemType() === "input") {
        handleDrop(item.type);
      }
    },
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
        required: false,
      },
    ]);
  };

  const DraggableField = ({ field, index }) => {
    const ref = React.useRef(null);

    const [, drag] = useDrag({
      type: "field",
      item: { index },
    });

    const [, drop] = useDrop({
      accept: "field",
      hover: (item) => {
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveItem(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    drag(drop(ref));

    return (
      <div
        ref={ref}
        className="input-field-wrapper"
        onClick={() => {
          setSelectedField({ ...field, index });
          setSelectedButton(false);
        }}
        style={{
          border: "1px solid #ccc",
          position: "relative",
          padding: "5px",
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
          cursor: "move",
        }}
      >
        <input
          id={field.id}
          type={field.type}
          placeholder={field.placeholder}
          required={field.required}
          style={{ width: "100%" }}
          readOnly
        />
        {!field.required && (
          <button
            className="remove-btn"
            onClick={() => handleRemove(index)}
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              background: "transparent",
              border: "none",
              color: "red",
              cursor: "pointer",
            }}
          >
            &#10005;
          </button>
        )}
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
            <DraggableField key={index} field={field} index={index} />
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
              setSelectedButton(true);
              setSelectedField(null);
            }}
          >
            {submitButton.text}
          </button>
        </>
      )}
    </div>
  );
};

// Settings Panel Component
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
          <label>Required</label>
          <input
            type="checkbox"
            checked={selectedField.required}
            onChange={(e) => handleChange("required", e.target.checked)}
            style={{ marginBottom: "10px" }}
          />
        </>
      )}

      {isSubmitButtonSelected && (
        <>
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
  const [fields, setFields] = useState(mandatoryFields);
  const [selectedField, setSelectedField] = useState(null);
  const [isSubmitButtonSelected, setSelectedButton] = useState(false);
  const [submitButton, setSubmitButton] = useState({
    text: "Submit",
    backgroundColor: "#007bff",
    textColor: "#ffffff",
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEmbedModalOpen, setEmbedModalOpen] = useState(false);
  const [replyMailEnabled, setReplyMailEnabled] = useState(false);
  const [replyMailContent, setReplyMailContent] = useState("");

  const updateField = (updatedField) => {
    setFields((prevFields) =>
      prevFields.map((field, index) =>
        index === updatedField.index ? updatedField : field
      )
    );
    setSelectedField(updatedField);
    setSelectedButton(false);
  };

  const updateSubmitButton = (key, value) => {
    setSubmitButton({ ...submitButton, [key]: value });
    setSelectedButton(true);
    setSelectedField(null);
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const toggleEmbedModal = () => {
    setEmbedModalOpen(!isEmbedModalOpen);
  };

  const handleReplyMailToggle = (e) => {
    setReplyMailEnabled(e.target.checked);
    if (e.target.checked) {
      const emailFieldExists = fields.some(
        (field) => field.type === "email" && field.id === "userEmail"
      );
      if (!emailFieldExists) {
        setFields((prevFields) => [
          ...prevFields,
          {
            id: "userEmail",
            type: "email",
            placeholder: "Enter your email",
            required: true,
          },
        ]);
      }
    } else {
      setFields((prevFields) =>
        prevFields.filter((field) => field.id !== "userEmail")
      );
    }
  };

  const generateFormCode = () => {
    const userEmail = localStorage.getItem("userName") || "user@example.com"; // Get the email from localStorage or use a fallback
    const formHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Form</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f7f7f7;
          }
          .form-group {
            margin-bottom: 15px;
          }
          .form-group label {
            display: block;
            margin-bottom: 5px;
          }
          .form-group input {
            width: 100%;
            padding: 10px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .submit-button {
            padding: 10px 20px;
            background-color: ${submitButton.backgroundColor};
            color: ${submitButton.textColor};
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
  
        <h1>Form Submission</h1>
        <form id="generatedForm">
          ${fields
            .map(
              (field) => `
            <div class="form-group">
              <label for="${field.id}">${field.placeholder}</label>
              <input type="${field.type}" id="${field.id}" name="${
                field.id
              }" placeholder="${field.placeholder}" ${
                field.required ? "required" : ""
              }>
            </div>`
            )
            .join("")}
          <button type="submit" class="submit-button">${
            submitButton.text
          }</button>
        </form>
  
        <script>
          document.getElementById('generatedForm').addEventListener('submit', async function(e) {
            e.preventDefault();
  
            const formData = new FormData(this);
            const formFields = {};
            formData.forEach((value, key) => {
              formFields[key] = value;
            });
  
            // Prepare email data for the submission email
            const emailData = {
              to: '${userEmail}',  // Use the email from localStorage
              subject: 'New Form Submission',
              text: \`Here is a summary of the form submission:\\n\\n\${JSON.stringify(formFields, null, 2)}\`,
              html: \`<h3>New Form Submission</h3><ul>\${Object.entries(formFields).map(([key, value]) => \`<li>\${key}: \${value}</li>\`).join('')}</ul>\`
            };
  
            // Check if there is a feedback email field in the form
            const feedbackEmail = formFields.userEmail; // Assuming the email input in the form has id 'userEmail'
  
            // Send the submission email to the form owner
            try {
              const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
              });
  
              if (!response.ok) {
                const errorData = await response.json();
                console.error('Error sending submission email:', errorData);
                alert('Failed to send submission email.');
                return;
              }
            } catch (error) {
              console.error('Request failed:', error);
              alert('An error occurred while sending the submission email.');
              return;
            }
  
            // If feedback email is present and enabled, send a feedback email to the form submitter
            if (feedbackEmail) {
              const feedbackEmailData = {
                to: feedbackEmail,
                subject: 'Thank you for your submission!',
                text: 'We have received your submission and will get back to you shortly.',
              };
  
              try {
                const feedbackResponse = await fetch('http://localhost:5000/send-email', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(feedbackEmailData),
                });
  
                if (!feedbackResponse.ok) {
                  const errorData = await feedbackResponse.json();
                  console.error('Error sending feedback email:', errorData);
                  alert('Failed to send feedback email.');
                  return;
                } else {
                  alert('Form submitted and emails sent successfully!');
                }
              } catch (error) {
                console.error('Request failed:', error);
                alert('An error occurred while sending the feedback email.');
              }
            } else {
              alert('Form submitted successfully!');
            }
          });
        </script>
  
      </body>
      </html>
    `;
    return formHtml;
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
              submitButton={submitButton}
              setSelectedField={setSelectedField}
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

            <div className="reply-mail-settings mt-4">
              <h5>Reply Mail Settings</h5>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="replyMailEnabled"
                  checked={replyMailEnabled}
                  onChange={handleReplyMailToggle}
                />
                <label className="form-check-label" htmlFor="replyMailEnabled">
                  Enable Reply Mail
                </label>
              </div>
              {replyMailEnabled && (
                <div className="mt-3">
                  <label htmlFor="replyMailContent">Reply Mail Content:</label>
                  <textarea
                    id="replyMailContent"
                    className="form-control"
                    rows="4"
                    value={replyMailContent}
                    onChange={(e) => setReplyMailContent(e.target.value)}
                    placeholder="Enter reply mail content here"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* "Try" and "Embed Now" Buttons */}
        <div className="row">
          <div className="col-md-12 text-center mt-4">
            <button className="btn btn-primary" onClick={toggleModal}>
              Try
            </button>
            <button
              className="btn btn-secondary ml-2"
              onClick={toggleEmbedModal}
            >
              Embed Now
            </button>
          </div>
        </div>

        <Modal
          show={isModalOpen}
          onClose={toggleModal}
          fields={fields}
          submitButton={submitButton}
          replyMailEnabled={replyMailEnabled}
          replyMailContent={replyMailContent}
        />

        <EmbedModal
          show={isEmbedModalOpen}
          onClose={toggleEmbedModal}
          formCode={generateFormCode()}
        />
      </div>
    </DndProvider>
  );
}
