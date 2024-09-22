import React from "react";
import Header from "../Components/Header";

export default function WhatsappBot(prop) {
  return (
    <div>
      <Header setCurrentPage={prop.setCurrentPage} />
    </div>
  );
}
