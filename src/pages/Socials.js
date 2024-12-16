import React, { useState } from "react";
import Header from "../components/header/Header.jsx";
import Footer from "../components/footer/Footer.jsx";
import "./Socials.css"
import tennisCanadaLogo from "../assets/sponsors/Tennis_Canada.png";
import tennisManitobaLogo from "../assets/sponsors/TennisManitoba.png";
import tennisGiantLogo from "../assets/sponsors/tennisgiant.png";
import umRecServicesLogo from "../assets/sponsors/UofMRecServices.png"; 

const Social = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Create an array of image paths
  const imageCount = 14;
  const images = [];

  for (let i = 1; i <= imageCount; i++) {
    images.push(require(`../assets/tournament2024/${i}.jpg`));
  }

  const openPopup = (image) => {
    setSelectedImage(image);
  };

  const closePopup = () => {
    setSelectedImage(null);
  };

  return (
    <div className="app-container">
      <Header />
      <div className="home-container">
        <div className="content-container">
          <div className="single-content-container">

            {/* Sponsors Section */}
            <div className="sponsors-section">
              <h2>Our Sponsors</h2>
              <p className="sponsors-message">
                We would like to extend our heartfelt gratitude to our amazing sponsors who make our events possible.
                Their generous support enables us to bring the joy of tennis to our community and beyond.
              </p>

              <div className="sponsors-logos">
                <div className="sponsor">
                  <img src={tennisCanadaLogo} alt="Tennis Canada" className="sponsor-logo" />
                  <p className="sponsor-name">Tennis Canada</p>
                </div>
                <div className="sponsor">
                  <img src={tennisManitobaLogo} alt="Tennis Manitoba" className="sponsor-logo" />
                  <p className="sponsor-name">Tennis Manitoba</p>
                </div>
                <div className="sponsor">
                  <img src={tennisGiantLogo} alt="Tennis Giant" className="sponsor-logo" />
                  <p className="sponsor-name">Tennis Giant</p>
                </div>
              </div>

              {/* Main Sponsor */}
              <div className="main-sponsor">
                {/* <h3>Main Sponsor & Organizer</h3> */}
                <img 
                  src={umRecServicesLogo} 
                  alt="UM Recreation Services" 
                  className="main-sponsor-logo" 
                />
                <p className="main-sponsor-name">University of Manitoba Recreation Services</p>
              </div>



            </div>

            {/* Socials Gallery Section */}
            <div className="socials-section">
              <h2>UMTC First Annual Tournament 2024</h2>
              <p className="socials-message">
                Relive the highlights of our first annual tournament! Here's a gallery of moments showcasing the passion and excitement of our tennis community.
              </p>
              <div className="socials-gallery">
                {images.map((image, index) => (
                  <div key={index} className="socials-image-wrapper">
                    <img
                      src={image}
                      alt={`Tournament 2024 ${index + 1}`}
                      className="socials-image"
                      onClick={() => openPopup(image)}
                    />
                  </div>
                ))}
              </div>

              {/* Pop-up window for enlarged image */}
              {selectedImage && (
                <div className="popup-overlay">
                  <div className="popup-content">
                    <button className="close-button" onClick={closePopup}>×</button>
                    <img src={selectedImage} alt="Enlarged" className="enlarged-image" />
                  </div>
                </div>
              )}
            </div>



          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Social;
