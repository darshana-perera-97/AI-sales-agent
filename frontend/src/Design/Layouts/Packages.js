import React from "react";
import icn1 from "../Assets/icn1.png";

export default function Packages(prop) {
  const apps = [
    {
      title: "Form Submission",
      description: "Sample description 1",
      icn: icn1,
      link: "formSubmit",
    },
  ];

  return (
    <div className="form-card p-4 mt-2 px-5">
      <div className="row">
        {apps.map((app, index) => (
          <div key={index} className="col-lg-3 col-md-4 p-2">
            <div
              className="item-card p-4"
              onClick={() => {
                //   console.log(app.link);
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
    </div>
  );
}
