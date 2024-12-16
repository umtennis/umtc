import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const EventRegistrationModal = ({
  show,
  handleClose,
  selectedEvent,
  handleParticipate,
  handleCancelParticipation,
  handleUpdateEvent,
  handleDeleteEvent,
  user,
  participantFrequency,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTitle, setEditedTitle] = useState(selectedEvent.title);
  const [editedType, setEditedType] = useState(selectedEvent.type);
  const [editedDescription, setEditedDescription] = useState(
    selectedEvent.description || ""
  );
  const [editedNotes, setEditedNotes] = useState(selectedEvent.notes || "");
  const [editedMaxParticipants, setEditedMaxParticipants] = useState(
    selectedEvent.maxParticipants
  );

  useEffect(() => {
    if (selectedEvent) {
      setEditedTitle(selectedEvent.title || "");
      setEditedType(selectedEvent.type || 0);
      setEditedDescription(selectedEvent.description || "");
      setEditedNotes(selectedEvent.notes || "");
      setEditedMaxParticipants(selectedEvent.maxParticipants || 0);
    }
  }, [selectedEvent]);

  // Normalize participants to an array
  const participants = Array.isArray(selectedEvent?.participants)
    ? selectedEvent.participants
    : selectedEvent.participants.split(", ").filter(Boolean);

  // // Check if the current user is in the participants list
  // const isUserParticipant = selectedEvent?.participants.includes(user?.name);

  const onParticipate = async () => {
    setLoading(true);
    setError("");

    // Check if the user has already participated in 2 or more events
    if (participantFrequency[user.name] >= user.booking) {
      setError("You have already 2 active bookings.");
      setLoading(false);
      return;
    }

    try {
      const response = await handleParticipate();

      if (response.success) {
        setShowSuccessMessage(true);
        // Show the success message for 2 seconds, then update the view
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const onCancelParticipation = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await handleCancelParticipation();

      if (response.success) {
        // setSuccess(true);
        setShowSuccessMessage(true);

        // Show the success message for 2 seconds, then update the view
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setError("Cancellation failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during cancellation.");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setIsEditing(false);
    setError("");
    handleClose();
  };

  const onEditClick = () => {
    setIsEditing(true);
  };

  const onDeleteClick = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    setIsDeleting(true); // Set delete button to "Sending..." state

    try {
      const response = await handleDeleteEvent();
      if (response) {
        setShowSuccessMessage(true);
        // Optionally add a timeout for showing success message
        setTimeout(() => {
          setShowSuccessMessage(false);
          handleClose(); // Close the modal after successful delete
        }, 2000);
      } else {
        setError("Delete failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during deletion.");
    } finally {
      setIsDeleting(false); // Reset the delete button state
    }
  };

  const onEditSave = async () => {
    setIsSaving(true);

    const updatedEvent = {
      ...selectedEvent,
      title: editedTitle,
      description: editedDescription,
      notes: editedNotes,
      maxParticipants: editedMaxParticipants,
      type: editedType,
    };

    try {
      const response = await handleUpdateEvent(updatedEvent);

      if (response.success) {
        // setSuccess(true);
        setShowSuccessMessage(true);

        // Show the success message for 2 seconds, then update the view
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 2000);
      } else {
        setError("Edit failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during updating.");
    } finally {
      setIsEditing(false);
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Register for Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isEditing ? (
          <>
            <Form.Group controlId="eventTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="eventDescription" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="eventNotes" className="mt-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="eventMaxParticipants" className="mt-3">
              <Form.Label>Max Participants</Form.Label>
              <Form.Control
                type="number"
                value={editedMaxParticipants}
                onChange={(e) => setEditedMaxParticipants(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="eventType" className="mt-3">
              <Form.Label>Event Type</Form.Label>
              <Form.Control
                as="select"
                value={editedType}
                onChange={(e) => setEditedType(Number(e.target.value))}
              >
                <option value="0">Club Regular Sessions</option>
                <option value="1">Social Events</option>
                <option value="2">Competitive Events</option>
                <option value="3">All other special Events</option>
              </Form.Control>
            </Form.Group>
          </>
        ) : (
          <>
            <h5>{selectedEvent.description}</h5>

            <p>
              Date: {selectedEvent.start.split("T")[0]}:{" "}
              {new Date(selectedEvent.start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{" "}
              -{" "}
              {new Date(selectedEvent.end).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p>{selectedEvent.notes && <>Notes: {selectedEvent.notes}</>}</p>
            <p>
              Spots Available:{" "}
              {selectedEvent.maxParticipants -
                selectedEvent.number_of_participants}{" "}
              (Max. {selectedEvent.maxParticipants})
            </p>
          </>
        )}

        {!isEditing && (
          <ul>
            {participants.map((participant, index) => (
              <li key={index}>{participant}</li>
            ))}
          </ul>
        )}

        {showSuccessMessage ? (
          <Alert variant="success">Success!</Alert>
        ) : (
          <>{error && <Alert variant="danger">{error}</Alert>}</>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        {user?.isAdmin && (
          <div>
            {isEditing ? (
              isSaving ? (
                <Button variant="secondary" disabled>
                  Sending...
                </Button>
              ) : (
                <Button variant="primary" onClick={onEditSave}>
                  Save
                </Button>
              )
            ) : (
              <>
                <Button variant="primary" onClick={onEditClick}>
                  Edit
                </Button>
                <> </>
                {isDeleting ? (
                  <Button variant="danger" disabled>
                    Sending...
                  </Button>
                ) : (
                  <Button variant="danger" onClick={onDeleteClick}>
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        )}
        <div>
          {/* {!showSuccessMessage && ( */}
          <>
            {user && (
              <>
                {participants.includes(user.name) ? (
                  <Button
                    variant="danger"
                    onClick={onCancelParticipation}
                    disabled={loading}
                    className="me-2"
                  >
                    {loading ? "Cancelling..." : "Cancel Participation"}
                  </Button>
                ) : user.booking > 0 ? (
                  <Button
                    variant="primary"
                    onClick={onParticipate}
                    disabled={
                      loading ||
                      participants.length >= selectedEvent?.maxParticipants
                    }
                    className="me-2"
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>
                ) : (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-disabled">
                        Max booking reached for the week
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block">
                      <Button
                        variant="primary"
                        disabled
                        className="me-2"
                        style={{ pointerEvents: "none" }}
                      >
                        Register
                      </Button>
                    </span>
                  </OverlayTrigger>
                )}
              </>
            )}
            {!user && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-disabled">Please log in first</Tooltip>
                }
              >
                <span className="d-inline-block">
                  <Button
                    variant="primary"
                    disabled
                    className="me-2"
                    style={{ pointerEvents: "none" }}
                  >
                    Register
                  </Button>
                </span>
              </OverlayTrigger>
            )}
          </>
          {/* )} */}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EventRegistrationModal;
