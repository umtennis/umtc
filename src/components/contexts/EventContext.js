import React, { createContext, useState, useEffect } from 'react';
import { use } from 'react';

// Create a context
export const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  // const [refresh, setRefresh] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [participantFrequency, setParticipantFrequency] = useState({});

  const fetchEvents = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(process.env.REACT_APP_API_KEY_CLUB_SCHEDULE);
      const data = await response.json();
      console.log(data);
      const mappedEvents = data.events
        .filter(event => event.id) // Ignore entries without an id
        .map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          start: event.start_time ? `${event.date}T${event.start_time}` : event.date,
          end: event.end_time ? `${event.date}T${event.end_time}` : event.date,
          participants: event.participants || [],
          number_of_participants: event.number_of_participants || 0,
          notes: event.notes || '',
          maxParticipants: event.maxParticipants
        }));

 
      setEvents(mappedEvents);
      initializeParticipantFrequency(mappedEvents); // Initialize participant frequency after fetching
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents(); // Fetch events on startup
  }, []);

  // Initializes the participant frequency when events are first fetched
  const initializeParticipantFrequency = (events) => {
    const frequency = {};

    events.forEach(event => {
      let participants = event.participants;

      if (typeof participants === 'string') {
        participants = participants.split(',').map(p => p.trim());
      }

      if (Array.isArray(participants)) {
        participants.forEach(participant => {
          if (participant) {
            frequency[participant] = (frequency[participant] || 0) + 1;
          }
        });
      }
    });

    setParticipantFrequency(frequency);
  };

  // Function to add a new event
  const addEvent = async (newEvent) => {
    setEvents(prevEvents => [...prevEvents, newEvent]);
    // Refetch events
    await fetchEvents();
  };

  // Function to delete an event by its ID
  const deleteEvent = async (eventId) => {
    // setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));

    // // Adjust participant frequencies for the deleted event
    // const deletedEvent = events.find(event => event.id === eventId);
    // if (deletedEvent) {
    //   let participants = deletedEvent.participants;

    //   if (typeof participants === 'string') {
    //     participants = participants.split(',').map(p => p.trim());
    //   }

    //   if (Array.isArray(participants)) {
    //     participants.forEach(participant => {
    //       decrementParticipantFrequency(participant);
    //     });
    //   }
    // }
    await fetchEvents();
  };

  // Updates the frequency of a participant by adding 1
  const incrementParticipantFrequency = (participantName) => {
    setParticipantFrequency(prevFrequency => ({
      ...prevFrequency,
      [participantName]: (prevFrequency[participantName] || 0) + 1,  // Adds participant if not present
    }));
  };

  // Updates the frequency of a participant by subtracting 1
  const decrementParticipantFrequency = (participantName) => {
    setParticipantFrequency(prevFrequency => {
      const newFrequency = { ...prevFrequency };
      if (newFrequency[participantName]) {
        newFrequency[participantName] -= 1;

        if (newFrequency[participantName] === 0) {
          delete newFrequency[participantName];
        }
      }
      return newFrequency;
    });
  };

  const addParticipant = (eventId, participantName) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        let updatedParticipants;

        if (typeof event.participants === 'string') {
          updatedParticipants = event.participants
            ? `${event.participants}, ${participantName}`
            : participantName;
        } else if (Array.isArray(event.participants)) {
          updatedParticipants = [...event.participants, participantName].join(', ');
        } else {
          updatedParticipants = participantName;
        }

        // Increment the frequency of the participant
        incrementParticipantFrequency(participantName);

        return {
          ...event,
          number_of_participants: event.number_of_participants + 1,
          participants: updatedParticipants
        };
      }
    });
    setEvents(updatedEvents);
  };

  const removeParticipant = (eventId, participantName) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        let updatedParticipants;

        if (typeof event.participants === 'string') {
          updatedParticipants = event.participants
            .split(',')
            .map(p => p.trim())
            .filter(p => p !== participantName)
            .join(', ');
        } else if (Array.isArray(event.participants)) {
          updatedParticipants = event.participants.filter(p => p !== participantName);
        }

        // Decrement the frequency of the participant
        decrementParticipantFrequency(participantName);

        return {
          ...event,
          number_of_participants: event.number_of_participants - 1,
          participants: updatedParticipants
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  return (
    <EventContext.Provider value={{ events, addParticipant, removeParticipant, fetchEvents, participantFrequency, isFetching, addEvent, deleteEvent }}>
      {children}
    </EventContext.Provider>
  );
};

