import React, { useContext, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Spinner } from 'react-bootstrap';
import Header from "../components/header/Header.jsx";
import Footer from "../components/footer/Footer.jsx";
import { EventContext } from '../components/contexts/EventContext';
import { UserContext } from '../components/contexts/UserContext';
import EventRegistrationModal from '../components/modals/EventRegistrationModal'; // Import the modal
import CreateEventModal from '../components/modals/CreateEventModal'
import "./ClubSchedule.css"

const googleSheetURL = process.env.REACT_APP_API_KEY_CLUB_SCHEDULE;
// const updateUserURL = process.env.REACT_APP_API_KEY_MEMBER_LOGIN;

const ClubSchedule = () => {
  const { user } = useContext(UserContext);
  const { events, addEvent, refreshEvents, addParticipant, removeParticipant, isFetching, participantFrequency } = useContext(EventContext);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isCreateEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  // const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [screenWidth, setScreenWidth] = useState(window.innerWidth); // Track screen width

  const eventTypeColors = {
    0: '#3357FF', // Color for type 2
    1: '#5A189A', // Color for type 1
    2: '#065535', // Color for type 0
    3: '#D72638', // Color for type 3

  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function renderEventContent(eventInfo) {
    const textClass = screenWidth < 768 ? 'event-text-mobile' : 'event-text-desktop';
    return (
      <div>
        <b className={`fc-event-time ${textClass}`}>{eventInfo.timeText}</b>
        <div className={`fc-event-title ${textClass}`}>
          {eventInfo.event.title}
        </div>
      </div>
    );
  }

  const renderLoadingIndicator = () => (
    <div className="loading-container" style={{ textAlign: 'center', padding: '50px 0' }}>
      <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem', color: '#0056b3' }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p style={{ marginTop: '10px', fontSize: '18px', color: '#0056b3' }}>Loading Club Schedule...</p>
    </div>
  );

  const handleEventClick = (info) => {

    const clickedEvent = events.find(event => event.eventId == info.event.id);
    // console.log(clickedEvent);
    setSelectedEvent(clickedEvent);
    setModalIsOpen(true);
  };

  const handleDateClick = (info) => {
    if (user?.isAdmin) {
      // console.log(info);
      setSelectedDate(info.dateStr);
      setCreateEventModalOpen(true);
    } else {
      // alert("Only admins can create events.");
    }
  };

  const handleParticipate = async () => {
    if (selectedEvent.number_of_participants < selectedEvent.maxParticipants) {
      try {
        const response = await fetch(googleSheetURL, {
          method: 'POST',
          body: JSON.stringify({
            action: "addParticipants",
            eventId: selectedEvent.eventId,
            participantName: user.name,
            eventDate: selectedEvent.start.split('T')[0],
          }),
        });

        if (response.status === 200) {
          const updatedParticipants = `${selectedEvent.participants}, ${user.name}`;
          const updatedEvent = {
            ...selectedEvent,
            participants: updatedParticipants,
            number_of_participants: selectedEvent.number_of_participants + 1,
          };
          setSelectedEvent(updatedEvent);
          addParticipant(selectedEvent.eventId, user.name);
          return { success: true };
        } else {
          return { success: false, message: `Error: ${response.statusText}` };
        }
      } catch (error) {
        console.error("Error adding participant:", error);
        return { success: false, message: 'Error! Possibly server limit reached. Try again tomorrow.' };
      }
    } else {
      return { success: false, message: 'Sorry, this event is full.' };
    }
  };

  const handleCancelParticipation = async () => {
    try {
      const response = await fetch(googleSheetURL, {
        method: 'POST',
        body: JSON.stringify({
          action: "deleteParticipants",
          eventId: selectedEvent.eventId,
          participantName: user.name,
          eventDate: selectedEvent.start.split('T')[0],
        }),
      });

      if (response.status === 200) {
        const participantsArray = selectedEvent.participants.split(', ');
        const updatedParticipants = participantsArray.filter(name => name !== user.name).join(', ');

        const updatedEvent = {
          ...selectedEvent,
          participants: updatedParticipants,
          number_of_participants: selectedEvent.number_of_participants - 1,
        };
        setSelectedEvent(updatedEvent);
        removeParticipant(selectedEvent.eventId, user.name);

        return { success: true };
      } else {
        return { success: false, message: `Error: ${response.statusText}` };
      }
    } catch (error) {
      console.error("Error canceling participation:", error);
      return { success: false, message: 'Error! Please try again later.' };
    }
  };

  const handleAddEvent = async (newEvent) => {

    try {
      const response = await fetch(googleSheetURL, {
        method: 'POST',
        body: JSON.stringify({
          action: "addEvent",
          ...newEvent
        }),
      });

      if (!response.ok) {
        console.error('Error adding event:', response.statusText);
        return { success: false, message: `Error: ${response.statusText}` };
      }

      const result = await response.json();

      if (result.status === "success") {

        addEvent(newEvent); // Update the context
        setCreateEventModalOpen(false);

        return { success: true, message: "Event added successfully" };
      } else {
        console.error("Error adding event:", result.message);
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error adding event:', error);
      return { success: false, message: "An error occurred while adding the event." };
    }
  };

  const handleUpdateEvent = async (updatedEvent) => {
    try {
      const response = await fetch(googleSheetURL, {
        method: 'POST',
        body: JSON.stringify({
          action: "editEvent",

          // participantName: selectedEvent.participantName,
          // eventDate: selectedEvent.eventDate,
          ...updatedEvent,
        }),
      });

      if (response.status === 200) {
        setSelectedEvent(updatedEvent);
        refreshEvents();
        return { success: true };
      } else {
        return { success: false, message: `Error: ${response.statusText}` };
      }
    } catch (error) {
      console.error("Error updating event:", error);
      return { success: false, message: 'Error! Please try again later.' };
    }
  };

  const handleDeleteEvent = async () => {

    // console.log(selectedEvent.eventId);
    let status = false
    try {
      const response = await fetch(googleSheetURL, {
        method: 'POST',
        body: JSON.stringify({
          action: "deleteEvent",
          ...selectedEvent,
        }),
      });

      if (response.status === 200) {
        refreshEvents(); // Update the context
        // setModalIsOpen(false);
        status = true;
        return status
      } else {
        console.error('Error deleting event:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
    return status
  };



  return (
    <div className="app-container">
      <Header />
      <div className="home-container">
        <div className="content-container">
          <div className="single-content-container">          
            {isFetching ? (
              renderLoadingIndicator()
            ) : (              
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                events={events.map(event => {
                  const isFull = event.number_of_participants >= event.maxParticipants;
                  return {
                    id: event.eventId,
                    title: `${event.title}`,
                    start: event.start,
                    end: event.end,
                    extendedProps: {
                      participants: event.participants
                    },
                    backgroundColor: isFull ? 'grey' : eventTypeColors[event.type], // Change color to grey if full
                  }
                })}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height={screenWidth < 768 ? 600 : 'auto'}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                editable={true}
                selectable={true}
                slotMinTime="09:00:00"
                slotMaxTime="24:00:00"
                eventContent={renderEventContent}
                eventOverlap={true}
                slotEventOverlap={false}
              />

            )}
            {selectedEvent && (
              <EventRegistrationModal
                show={modalIsOpen}
                handleClose={() => setModalIsOpen(false)}
                selectedEvent={selectedEvent}
                handleParticipate={handleParticipate}
                handleCancelParticipation={handleCancelParticipation}
                handleDeleteEvent={handleDeleteEvent}
                handleUpdateEvent={handleUpdateEvent}
                user={user}
                participantFrequency={participantFrequency}
              />
            )}
            {isCreateEventModalOpen && (
              <CreateEventModal
                show={isCreateEventModalOpen}
                handleClose={() => setCreateEventModalOpen(false)}
                handleAddEvent={handleAddEvent}
                selectedDate={selectedDate}

              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClubSchedule;
