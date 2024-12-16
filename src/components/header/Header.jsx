import React, { useContext, useState } from "react";
import { Container, Nav, Navbar, Modal, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignupModal";
import ManageAccountModal from "./ManageAccountModal"; // Import the ManageAccountModal component
import "./Header.css";

import whatsappLogo from "../../assets/whatsapp/whatsapp_logo.png"; // Import WhatsApp logo
import whatsappQR from "../../assets/whatsapp/whatsapp_2024.png"; // Import WhatsApp QR code

const linkStyle = {
  //   // color: "white",
  //   // margin: "3px",
  cursor: "pointer",
  padding: 0,
};

function Header() {
  let navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  let isLoggedIn = !!user;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showManageAccountModal, setShowManageAccountModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false); // WhatsApp Modal State

  const handleShowLogin = () => setShowLoginModal(true);
  const handleCloseLogin = () => setShowLoginModal(false);

  const handleShowSignup = () => setShowSignUpModal(true);
  const handleCloseSignup = () => setShowSignUpModal(false);

  const handleShowManageAccount = () => setShowManageAccountModal(true);
  const handleCloseManageAccount = () => setShowManageAccountModal(false);

  const handleShowWhatsApp = () => setShowWhatsAppModal(true); // Open WhatsApp Modal
  const handleCloseWhatsApp = () => setShowWhatsAppModal(false); // Close WhatsApp Modal

  const googleSheetURL = process.env.REACT_APP_API_KEY_MEMBER_LOGIN;

  const handleSignup = async (signupData) => {
    const response = await fetch(googleSheetURL, {
      // redirect: "follow",
      method: "POST",
      // headers: {
      //   "Content-Type": "text/plain;charset=utf-8",
      // },
      body: JSON.stringify(signupData),
    });

    const result = await response.json();
    return result; // Return the result to handle success/failure in the modal
  };

  const handleUpdate = async (updatedUser) => {
    const response = await fetch(googleSheetURL, {
      // redirect: "follow",
      method: "POST",
      // headers: {
      //   "Content-Type": "text/plain;charset=utf-8",
      // },
      body: JSON.stringify(updatedUser),
    });

    const result = await response.json();
    return result; // Return the result to handle success/failure in the modal
  };

  return (
    <>
 <Navbar bg="dark" variant="dark" expand="lg">
  <Container>
    <Navbar.Brand as={Link} to="/home">
      University of Manitoba Tennis Club
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <div className="navbar-container">
        {/* Left Column */}
        <Nav className="nav-left">
          <Nav.Link as={Link} to="/home">
            Home
          </Nav.Link>
          <Nav.Link as={Link} to="/schedule">
            Club Schedule
          </Nav.Link>
          <Nav.Link as={Link} to="/programs">
            Programs
          </Nav.Link>
          <Nav.Link as={Link} to="/socials">
            Socials
          </Nav.Link>
          <Nav.Link as={Link} to="/about">
            About Us
          </Nav.Link>
        </Nav>

        {/* Right Column */}
        <Nav className="nav-right">
          <Nav.Link onClick={handleShowWhatsApp} style={linkStyle}>
            <img
              src={whatsappLogo}
              alt="WhatsApp Group"
              className="whatsapp-logo"
            />
          </Nav.Link>
          <Nav.Link onClick={handleShowManageAccount} style={linkStyle}>
            Manage Account
          </Nav.Link>
          <Nav.Link
            onClick={() => {
              logout();
              navigate("/home");
            }}
            style={linkStyle}
          >
            Logout
          </Nav.Link>
        </Nav>
      </div>
    </Navbar.Collapse>
  </Container>
</Navbar>


      {/* Login Modal */}
      <LoginModal show={showLoginModal} handleClose={handleCloseLogin} />
      {/* Signup Modal */}
      <SignUpModal
        show={showSignUpModal}
        handleClose={handleCloseSignup}
        handleSignup={handleSignup}
      />
      {/* Manage Account Modal */}
      <ManageAccountModal
        show={showManageAccountModal}
        handleClose={handleCloseManageAccount}
        handleUpdate={handleUpdate}
      />

      {/* WhatsApp Modal */}
      <Modal show={showWhatsAppModal} onHide={handleCloseWhatsApp} centered>
        <Modal.Header closeButton style={{ justifyContent: "center" }}>
          <Modal.Title style={{ textAlign: "center", width: "100%" }}>
            Join Our WhatsApp Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: "center" }}>
          <p>
            Stay connected and receive the latest updates by joining our members
            group chat on WhatsApp!
          </p>
          <div style={{ marginTop: "20px" }}>
            <img
              src={whatsappQR}
              alt="WhatsApp QR Code"
              style={{
                width: "300px",
                height: "300px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            <a
              href="https://chat.whatsapp.com/CJoGVuyjqIaFOfgctvAXE0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                color: "#25D366",
                fontWeight: "bold",
              }}
            >
              <Button variant="success" size="lg">
                Join the Member Group
              </Button>
            </a>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
function userLogin(
  isLoggedIn,
  user,
  navigate,
  logout,
  handleShowLogin,
  handleShowSignup,
  handleShowManageAccount,
  handleShowWhatsApp
) {
  if (isLoggedIn) {
    return (
      <>
        <Nav.Link onClick={handleShowWhatsApp} style={linkStyle}>
          <img
            src={whatsappLogo}
            alt="WhatsApp Group"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain",
            }}
          />
        </Nav.Link>
        <Nav.Link onClick={handleShowManageAccount} style={linkStyle}>
          Manage Account
        </Nav.Link>
        <Nav.Link
          onClick={() => {
            logout();
            navigate("/home");
          }}
          style={linkStyle}
        >
          Logout
        </Nav.Link>
      </>
    );
  } else {
    return (
      <>
        <Nav.Link onClick={handleShowLogin} style={linkStyle}>
          Login
        </Nav.Link>
        <Nav.Link onClick={handleShowSignup} style={linkStyle}>
          Signup
        </Nav.Link>
      </>
    );
  }
}

export default Header;
