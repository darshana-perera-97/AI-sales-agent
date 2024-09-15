import React from "react";
import Header from "../Components/Header";
import SmtpCredentials from "../Layouts/SmtpCredentials";
import FormDesign from "../Layouts/FormDesign";

export default function FormFill(prop) {
  return (
    <div className="mb-5">
      <Header />
      <SmtpCredentials setCurrentPage={prop.setCurrentPage} />
      <FormDesign />
    </div>
  );
}
