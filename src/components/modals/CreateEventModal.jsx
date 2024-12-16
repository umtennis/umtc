import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const CreateEventModal = ({
  show,
  handleClose,
  handleAddEvent,
  selectedDate,
  // setNewEvent,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10); // Default to 10
  const [duration, setDuration] = useState(1); // Default to 1 hour
  const [type, setType] = useState(0); // Default to 0
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false); // State for "Sending..." status


  const onCreateEvent = async () => {
    if (!title || !duration || !maxParticipants) {
      setError("Please fill in all fields.");
      return;
    }

    setIsCreating(true); // Set the button to "Sending..." state
    
    const startTime = new Date(selectedDate);
    const endTime = new Date(startTime);
    const eventDate = selectedDate.split('T')[0];
    endTime.setHours(startTime.getHours() + Math.floor(duration));
    endTime.setMinutes(startTime.getMinutes() + (duration % 1) * 60);

    const newEvent = {
      eventId: new Date().getTime(),
      title,
      start: startTime.toLocaleTimeString(),
      end: endTime.toLocaleTimeString(),
      eventDate: eventDate,
      description,
      notes,
      maxParticipants,
      type // Default event type
    };

    const response = await handleAddEvent(newEvent);    
    if (response.success) {
      handleClose();
    } else {
      setError(response.message || "Failed to create event.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group controlId="eventTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </Form.Group>
          <Form.Group controlId="eventDescription" className="mt-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any description (optional)"
            />
          </Form.Group>
          <Form.Group controlId="eventNotes" className="mt-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes (optional)"
            />
          </Form.Group>
          <Form.Group controlId="eventMaxParticipants" className="mt-3">
            <Form.Label>Max Participants</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
            />
          </Form.Group>
          <Form.Group controlId="eventDuration" className="mt-3">
            <Form.Label>Duration</Form.Label>
            <Form.Control
              as="select"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? "hour" : "hours"}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="eventType" className="mt-3">
            <Form.Label>Event Type</Form.Label>
            <Form.Control
              as="select"
              value={type}
              onChange={(e) => setType(Number(e.target.value))}
            >
              <option value="0">Club Regular Sessions</option>
              <option value="1">Social Events</option>
              <option value="2">Competitive Events</option>
              <option value="3">All other special Events</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onCreateEvent}
          disabled={isCreating} // Disable the button while creating
        >
          {isCreating ? "Sending..." : "Create Event"} {/* Show "Sending..." */}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateEventModal;