import React from "react";
import icn1 from "../Assets/icn1.png"; // Replace with appropriate icons for each service

export default function Packages(prop) {
  // Check if prop.userData exists and has a valid packages array
  const allowed = prop?.userData?.packages || []; // Default to an empty array if undefined

  const apps = [
    {
      title: "Form Submission",
      description: "Sample description 1",
      icn: icn1,
      link: "formSubmit",
      requiredPackage: "form",
      cost: "5",
    },
    {
      title: "WhatsApp Bot",
      description: "Send messages via WhatsApp.",
      icn: icn1,
      link: "whatsappbot",
      requiredPackage: "whatsappbot",
      cost: "5",
    },
    {
      title: "Bulk Mail",
      description: "Send emails in bulk to multiple recipients.",
      icn: icn1,
      link: "bulkMail",
      requiredPackage: "bulkMail",
      cost: "5",
    },
    {
      title: "Bulk WhatsApp",
      description: "Send WhatsApp messages in bulk.",
      icn: icn1,
      link: "Whatsappbulk",
      requiredPackage: "bulkWhatsapp",
      cost: "5",
    },
    {
      title: "SMS",
      description: "Send text messages via SMS.",
      icn: icn1,
      link: "sms",
      requiredPackage: "sms",
      cost: "5",
    },
    {
      title: "SMS API",
      description: "Programmatically send SMS using API.",
      icn: icn1,
      link: "smsAPI",
      requiredPackage: "smsAPI",
      cost: "5",
    },
    {
      title: "Bulk SMS",
      description: "Send SMS messages in bulk.",
      icn: icn1,
      link: "bulkSMS",
      requiredPackage: "bulkSMS",
      cost: "5",
    },
    {
      title: "WhatsApp API",
      description: "Send WhatsApp messages via API.",
      icn: icn1,
      link: "whatsappAPI",
      requiredPackage: "whatsappAPI",
      cost: "5",
    },
    {
      title: "Email API",
      description: "Programmatically send emails using API.",
      icn: icn1,
      link: "emailAPI",
      requiredPackage: "emailAPI",
      cost: "5",
    },
  ];

  // Fallback UI when userData or packages is not available
  if (!prop.userData || !prop.userData.packages) {
    return <div>Loading...</div>;
  }

  // Filter available apps based on allowed packages
  const availableApps = apps.filter((app) =>
    allowed.some((packageItem) => packageItem === app.requiredPackage)
  );

  // Filter unavailable apps
  const unavailableApps = apps.filter(
    (app) => !allowed.includes(app.requiredPackage)
  );

  return (
    <div className="form-card p-4 mt-2 px-5">
      <div className="row">
        {/* Display available apps */}
        {availableApps.map((app, index) => (
          <div key={index} className="col-lg-3 col-md-4 p-2">
            <div
              className="item-card p-4"
              onClick={() => {
                prop.setCurrentPage(app.link);
              }}
            >
              <img src={app.icn} alt="" height="60px" />
              <h3 className="mt-4">{app.title}</h3>
              <p className="mt-2">{app.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Display unavailable apps under "Our Services" */}
      {unavailableApps.length > 0 && (
        <div>
          <h3 className="mt-5">Our Services</h3>
          <div className="row">
            {unavailableApps.map((app, index) => (
              <div key={index} className="col-lg-3 col-md-4 p-2">
                <div
                  className="item-card p-4"
                  onClick={() => {
                    // Store the selected item in localStorage
                    localStorage.setItem("selectedItem", JSON.stringify(app));
                    prop.setCurrentPage("payment");
                  }}
                >
                  <img src={app.icn} alt="" height="60px" />
                  <h3 className="mt-4">{app.title}</h3>
                  <p className="mt-2">{app.description}</p>
                  <button className="btn btn-primary mt-3">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
