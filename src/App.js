import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import L from "leaflet";
// import { useMap } from "react-leaflet/hooks";
import "./App.css";
import { imageOverlay, popup } from "leaflet";
// import { Marker, Popup } from "leaflet";

const myIconGreen = L.icon({
  iconUrl: "/green-map-pin-50 (1).png",
  iconSize: [25, 25],
  iconAnchor: [12.5, 21.5],
  popupAnchor: [0, -41],
});

const myIconRed = L.icon({
  iconUrl: "/red-map-pin-50.png",
  iconSize: [25, 25],
  iconAnchor: [12.5, 21.5],
  popupAnchor: [0, -41],
});

function App() {
  // const [userSearchTerm, setUserSearchTerm] = useState();
  const [beachLookup, setBeachLookup] = useState({});
  const [beachData, setBeachData] = useState(null);
  const [showBeachList, setShowBeachList] = useState(false);
  const [showBeachData, setShowBeachData] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3001/allBeaches")
      .then((response) => {
        console.log(response.data.result.items[0]);
        let beaches = {};
        for (const item of response.data.result.items) {
          beaches[item.label[0]._value] = {
            details: item._about,
            riskTime: item.latestRiskPrediction.expiresAt._value,
            riskLevel: item.latestRiskPrediction.riskLevel.name._value,
            lat: item.samplingPoint.lat,
            long: item.samplingPoint.long,
          };
        }
        setBeachLookup(beaches);
      })
      .catch((error) => {
        console.error("Error fetching bathing water data:", error);
      });
  }, []);

  const handleClick = async (details) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/beach?url=${details}`
      );
      const newBeachData = response.data.result.primaryTopic;

      if (newBeachData.latestProfile) {
        const profileResponse = await axios.get(
          `http://localhost:3001/beach?url=${newBeachData.latestProfile}`
        );
        const profile = profileResponse.data.result.primaryTopic;
        setBeachData({ ...newBeachData, profile });
        toggleShowBeachData();
      } else {
        setBeachData(newBeachData);
        toggleShowBeachData();
      }
    } catch (error) {
      console.error("Error fetching beach details:", error);
    }
  };

  const toggleShowBeachList = () => setShowBeachList(!showBeachList);
  const toggleShowBeachData = () => setShowBeachData(!showBeachData);

  return (
    <div className="App">
      <header className="App-header">
        <h1>BeachBuddy</h1>
        <button onClick={toggleShowBeachList}>
          {showBeachList ? "Hide list" : "Show list"}
        </button>
      </header>
      {beachLookup && showBeachList && (
        <>
          <h2> Choose your beach</h2>
          <div className="beachList">
            <ul>
              {Object.entries(beachLookup).map(([beach, details]) => (
                <li
                  key={beach}
                  onClick={() => {
                    handleClick(details.details);
                  }}
                >
                  {beach}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {/* {beachData && (
        <div className="beachData">
          <p>
            {beachData.name._value} : {beachData.district[0].name._value} :{" "}
            {
              beachData.latestComplianceAssessment.complianceClassification.name
                ._value
            }
            (latest classification)
          </p>
          <p>
            Risk level until{" "}
            {new Date(
              beachData.latestRiskPrediction.expiresAt._value
            ).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            : {beachData.latestRiskPrediction.riskLevel.name._value}{" "}
          </p>
          {beachData.profile && (
            <p>{beachData.profile.bathingWaterDescription._value}</p>
          )}
        </div>
      )} */}

      {showBeachData && beachData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-button" onClick={toggleShowBeachData}>
              X
            </span>
            <div className="beachData">
              <p>
                {beachData.name._value} : {beachData.district[0].name._value} :{" "}
                {
                  beachData.latestComplianceAssessment.complianceClassification
                    .name._value
                }
                (latest classification)
              </p>
              <p>
                Risk level until{" "}
                {new Date(
                  beachData.latestRiskPrediction.expiresAt._value
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                : {beachData.latestRiskPrediction.riskLevel.name._value}{" "}
              </p>
              {beachData.profile && (
                <p>{beachData.profile.bathingWaterDescription._value}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <MapContainer id="map" center={[53, -1]} zoom={6} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(beachLookup).map(([beach, details]) => {
          const icon = details.riskLevel === "normal" ? myIconGreen : myIconRed;
          return (
            <Marker
              key={beach}
              icon={icon}
              id={beach}
              position={[details.lat, details.long]}
            >
              <Popup className="popup">
                <h2>{beach}</h2>
                {details.riskLevel === "normal" && (
                  <img src="/icons8-smiley-50 (1).png" width="40" height="40" />
                )}
                {details.riskLevel === "increased" && (
                  <img src="/icons8-sad-50.png" width="40" height="40" />
                )}
                <p>Risk {details.riskLevel} until</p>
                <p>
                  {new Date(details.riskTime).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <div className="popupClickables">
                  <img
                    src="/icons8-partly-cloudy-day-50.png"
                    width="25"
                    height="25"
                  />
                  <img
                    onClick={() => {
                      handleClick(details.details);
                    }}
                    src="/icons8-info-50.png"
                    width="20"
                    height="20"
                  />
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;
