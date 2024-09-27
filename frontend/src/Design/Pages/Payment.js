import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import config from "../config"; // Import config file

export default function Payment(prop) {
  const [selectedItem, setSelectedItem] = useState(null);
  const storedUserName = localStorage.getItem("userName");
  const item = localStorage.getItem("selectedItem");
  const txt = "Payment Confirmation";

  useEffect(() => {
    // Retrieve the selected item from localStorage
    if (item) {
      setSelectedItem(JSON.parse(item)); // Parse the stored JSON string back to an object
    }
    // console.log(selectedItem.title);
  }, []);

  const sendEmail = () => {
    if (!selectedItem || !storedUserName) return;

    // Email content for the first email
    const emailDataForAdmin = {
      to: ["darshana.saluka.pc@gmail.com", "another.email@example.com"], // Add more emails if necessary
      subject: `${txt} | ${storedUserName} | ${selectedItem.title}`,
      text: `${storedUserName} | ${selectedItem.title} has made a payment. Please verify the details.`,
    };

    // Email content for the second email (to the user)
    const emailDataForUser = {
      to: storedUserName, // Assuming the storedUserName is the user's email
      subject: "Payment Received - Pending Verification",
      text: `Dear user,\n\nWe have received your payment for ${selectedItem.title}. Your payment is currently under verification. We will notify you once the payment is confirmed.\n\nThank you for your purchase!`,
    };

    // First email to admins or other recipients
    fetch(`${config.API_BASE_URL}/admin-send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailDataForAdmin),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          console.log("Email sent successfully to admins.");
          // console.log(selectedItem.title);
          // prop.setCurrentPage(selectedItem.title);
        }

        // After the first email is sent, send the confirmation email to the user
        fetch(`${config.API_BASE_URL}/admin-send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailDataForUser),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message) {
              console.log("Payment confirmation email sent to user.");
              console.log("The emails have been successfully sent!"); // Add your custom message here
            }
          })
          .catch((error) => {
            console.error("Error sending email to user:", error);
          });
      })
      .catch((error) => {
        console.error("Error sending email to admins:", error);
      });
  };

  return (
    <div>
      <div>
        <Header setCurrentPage={prop.setCurrentPage} />
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h2 className="title4">Payment Page</h2>
              {selectedItem ? (
                <div>
                  <h3>You selected: {selectedItem.title}</h3>
                  <p>Description: {selectedItem.description}</p>
                  <p>Cost: $ {selectedItem.cost}.00</p>
                  <button className="custombtn" onClick={sendEmail}>
                    Continue payment
                  </button>
                </div>
              ) : (
                <p>No item selected for payment.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
