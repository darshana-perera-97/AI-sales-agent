import React from "react";
import Header from "../Components/Header";
import QRCodeViewer from "../Components/QRCodeViewer";

export default function WhatsappBot(prop) {
  return (
    <div>
      <Header setCurrentPage={prop.setCurrentPage} />
      <QRCodeViewer />
    </div>
  );
}
