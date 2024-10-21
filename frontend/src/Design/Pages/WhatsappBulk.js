import React from "react";
import Header from "../Components/Header";
import QRCodeViewer from "../Components/QRCodeViewer";
import WhatsappBulkMessages from "../Components/WhatsappBulkMessages";

export default function WhatsappBulk(prop) {
  return (
    <div>
      <Header setCurrentPage={prop.setCurrentPage} />
      {/* <QRCodeViewer /> */}
      <WhatsappBulkMessages setCurrentPage={prop.setCurrentPage} />
    </div>
  );
}
