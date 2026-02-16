import React from "react";
import asuLogo from "../../images/logos/asu-engineering.png";
import tbdLogo from "../../images/logos/tbd.png";
import uwLogo from "../../images/logos/uw-new.svg";
import nsfLogo from "../../images/logos/nsf-new.svg";
import './AboutFooter.scss';

export const AboutFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      style={{
        zIndex: 1000,
        position: "relative",
        backgroundColor: "white",
        marginTop: "-30px",
        width: "100%",
      }}
    >
      <div
        className="about-footer-content-wrapper"
        style={{
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        <hr className="hr-spec" />
        <div style={{}}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                width: "60%",
                paddingRight: "10px",
                position: "relative",
              }}
            >
              <span className="d-block mb-2 mt-2">
                {" "}
                <h5 style={{ margin: "0" }}>
                  {" "}
                  Have Questions or Feedback?
                </h5>{" "}
              </span>
              <span className="d-block mb-2">
                {" "}
                For any inquiries or feedback, please contact Dr. Irfan Batur at
                <a href="mailto:ibatur@asu.edu" className="ms-1">
                  ibatur@asu.edu
                </a>
              </span>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: 0,
                  transform: "translateY(-50%)",
                  height: "40px",
                  width: "2px",
                  backgroundColor: "#352c26",
                  opacity: 0.2,
                }}
              ></div>
            </div>

            <div
              style={{
                width: "40%",
                paddingLeft: "10px",
              }}
            >
              <span className="d-block mb-2 mt-2">
                {" "}
                <h5 style={{ margin: "0" }}>Visitor Statistics</h5>{" "}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  height: "20px",
                }}
              >
                <span id="visit-count">Visit Count</span>

                <div
                  style={{
                    width: "1px",
                    height: "100%",
                    backgroundColor: "#352c26",
                    opacity: 0.2,
                  }}
                ></div>

                <span id="total-count">Total Count</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="hr-spec"></hr>

        <div className="d-block mt-1">
          <div style={{ paddingTop: "5px" }}>
            <span style={{ marginRight: "15px", fontWeight: "700" }}>
              <h3 style={{ margin: "0" }}>Our Sponsors</h3>
            </span>
          </div>
        </div>
        <div
          className="sponsors-logo-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "10px 10px",
            flexWrap: "wrap",
            gap: "40px",
            marginTop: "-30px",
          }}
        >
          <a
            href="https://www.nsf.gov/"
            target="_blank"
            rel="noreferrer"
            className="sponsor-logo-wrapper"
          >
            <img
              src={nsfLogo}
              alt="National Science Foundation Logo"
              className="sponsor-logo"
              style={{ maxWidth: '290px', maxHeight: '105px', width: 'auto', height: 'auto' }}
            />
          </a>
          <a
            href="https://www.asu.edu/"
            target="_blank"
            rel="noreferrer"
            className="sponsor-logo-wrapper"
          >
            <img
              src={asuLogo}
              alt="Arizona State University Logo"
              className="sponsor-logo"
              style={{ maxWidth: '290px', maxHeight: '105px', width: 'auto', height: 'auto' }}
            />
          </a>
          <a
            href="https://www.washington.edu/"
            target="_blank"
            rel="noreferrer"
            className="sponsor-logo-wrapper"
          >
            <img
              src={uwLogo}
              alt="University of Washington Logo"
              className="sponsor-logo"
              style={{ maxWidth: '290px', maxHeight: '105px', width: 'auto', height: 'auto' }}
            />
          </a>
          <a
            href="https://tbd.ctr.utexas.edu/"
            target="_blank"
            rel="noreferrer"
            className="sponsor-logo-wrapper"
          >
            <img
              src={tbdLogo}
              alt="Travel Behavior and Demand National Center Logo"
              className="sponsor-logo"
              style={{ maxWidth: '290px', maxHeight: '105px', width: 'auto', height: 'auto' }}
            />
          </a>
        </div>

        <hr className="hr-spec"></hr>

        <span
          style={{
            fontSize: "15px",
            padding: "10px 0",
            display: "block",
            width: "100%",
          }}
        >
          &copy; {currentYear} CARE Dashboard
        </span>
      </div>
    </div>
  );
};

