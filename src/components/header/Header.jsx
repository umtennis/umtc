import React, { useContext, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import LoginModal from './LoginModal';
import SignUpModal from './SignupModal';
import ManageAccountModal from './ManageAccountModal';  // Import the ManageAccountModal component

function Header() {
  let navigate = useNavigate(); 
  const { user, logout } = useContext(UserContext);
  let isLoggedIn = !!user;

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showManageAccountModal, setShowManageAccountModal] = useState(false);

  const handleShowLogin = () => setShowLoginModal(true);
  const handleCloseLogin = () => setShowLoginModal(false);

  const handleShowSignup = () => setShowSignUpModal(true);
  const handleCloseSignup = () => setShowSignUpModal(false);

  const handleShowManageAccount = () => setShowManageAccountModal(true);
  const handleCloseManageAccount = () => setShowManageAccountModal(false);


  const googleSheetURL = process.env.REACT_APP_API_KEY_MEMBER

  const handleSignup = async (signupData) => {
    const response = await fetch(googleSheetURL, {
      // redirect: "follow",
      method: 'POST',
      // headers: {
      //   "Content-Type": "text/plain;charset=utf-8",
      // },
      body: JSON.stringify(signupData),
    });

    const result = await response.json();
    return result;  // Return the result to handle success/failure in the modal
  };

  const handleUpdate = async (updatedUser) => {
    const response = await fetch(googleSheetURL, {
      // redirect: "follow",
      method: 'POST',
      // headers: {
      //   "Content-Type": "text/plain;charset=utf-8",
      // },
      body: JSON.stringify(updatedUser),
      
    });

    const result = await response.json();
    return result;  // Return the result to handle success/failure in the modal
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/home">University of Manitoba Tennis Club</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/home">Home</Nav.Link>
              <Nav.Link as={Link} to="/schedule">Club Schedule</Nav.Link>
              <Nav.Link as={Link} to="/programs">Programs</Nav.Link>
              <Nav.Link as={Link} to="/socials">Socials</Nav.Link>
              <Nav.Link as={Link} to="/about">About Us</Nav.Link>
            </Nav>
            <Nav className="ms-auto" style={{ display: 'flex', alignItems: 'center' }}>
              {userLogin(isLoggedIn, user, navigate, logout, handleShowLogin, handleShowSignup, handleShowManageAccount)}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Login Modal */}
      <LoginModal show={showLoginModal} handleClose={handleCloseLogin} />
      {/* Signup Modal */}
      <SignUpModal show={showSignUpModal} handleClose={handleCloseSignup} handleSignup={handleSignup} />
      {/* Manage Account Modal */}
      <ManageAccountModal show={showManageAccountModal} handleClose={handleCloseManageAccount} handleUpdate={handleUpdate} />
    </>
  );
}

function userLogin(isLoggedIn, user, navigate, logout, handleShowLogin, handleShowSignup, handleShowManageAccount) {
  const linkStyle = {
    color: 'white',
    marginRight: '10px',
    cursor: 'pointer',
  };

  if (isLoggedIn) {
    return (
      <>
        <Nav.Link onClick={handleShowManageAccount} style={linkStyle}>
          Manage Account
        </Nav.Link>
        <Nav.Link onClick={() => {
          logout();
          navigate('/home');
        }} style={linkStyle}>
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
