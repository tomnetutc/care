import "../../App.css";
import "./HomeIcons.scss";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import TravelModelogo from "../../images/HomePage/TravelModeLogo.svg";
import ZeroTripLogo from "../../images/HomePage/ZeroTripLogo.svg";
import DayPatternLogo from "../../images/HomePage/DayPatternLogo.svg";
import TripPurposeLogo from "../../images/HomePage/TripPurposeLogo.svg";

export function HomeIcons(): JSX.Element {
  return (
    <Container>
      <div
        className="HomeIconsDiv"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span
            className="spanText"
            style={{
              fontSize: 18.5,
              paddingTop: "30px",
              paddingBottom: "50px",
            }}
          >
            <b>
              Explore Mobility Trends and Patterns in the American Time Use
              Survey
            </b>
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "5%",
          alignContent: "center",
          marginBottom: "50px",
        }}
      >
        <div className="column">
          <div className="column">
            <Link to="/lifestyle/preferences" style={{ textDecoration: "none" }}>
              <img
                src={TripPurposeLogo}
                alt="Logo"
                style={{ maxWidth: "200px", height: "200px", padding: 10 }}
              />
              <p className="Header">Lifestyle</p>
            </Link>
            <span className="spanDescText">
              Understand lifestyle patterns and how they shape mobility trends.
            </span>
          </div>
        </div>
        <div className="column">
          <div className="column">
            <Link to="/community/preferences" style={{ textDecoration: "none" }}>
              <img
                src={TravelModelogo}
                alt="Logo"
                style={{ maxWidth: "200px", height: "200px", padding: 10 }}
              />
              <p className="Header">Community</p>
            </Link>
            <span className="spanDescText">
              Discover community-level mobility patterns and behaviors.
            </span>
          </div>
        </div>
        <div className="column">
          <Link
            to="/disruptions/preferences"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img
              src={ZeroTripLogo}
              alt="Logo"
              style={{ maxWidth: "200px", height: "200px", padding: 10 }}
            />
            <p className="Header">Disruptions</p>
          </Link>
          <span className="spanDescText">
            Analyze how disruptions affect mobility patterns
          </span>
        </div>
        <div className="column">
          <Link
            to="/transportation/preferences"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img
              src={DayPatternLogo}
              alt="Logo"
              style={{ maxWidth: "200px", height: "200px", padding: 10 }}
            />
            <p className="Header">Transportation</p>
          </Link>
          <span className="spanDescText">
            Uncover transportation patterns and mode choices.
          </span>
        </div>
      </div>
    </Container>
  );
}
