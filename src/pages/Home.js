import React from "react";
import Header from "../components/header/Header.jsx";
import useAppData from "../hooks/useAppData.js";
import Announcements from "../components/news/Announcements.jsx";
import LinkManagement from "../components/linkManagement/LinkManagement.jsx";
import './Home.css'; 

const Home = (props) => {
  const { state } = useAppData();
  const isAdmin = false;

  return (
    <div className="App">
      <Header 
        isLoggedIn={state.isLoggedIn}
        user={state.user}
      />
      <div className="home-container">
        <div className="content-container">
          <div className="news-container">
            <Announcements isAdmin={isAdmin} />
          </div>
          <div className="link-management-container">
            <LinkManagement isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;