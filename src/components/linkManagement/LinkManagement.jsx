import React, { useState, useEffect } from "react";
import { useLinkState, useLinkDispatch } from "../contexts/LinkContext";
import CustomPreviewComponent from './CustomPreviewComponent'; // Import the custom preview component
import "./LinkManagement.css";

const fetchMetadata = async (url) => {
  try {
    const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    console.log("Fetched metadata:", data); // Log the fetched data

    return {
      title: data.data.title || 'No Title Available',
      description: data.data.description || 'No Description Available',
      image: data.data.image?.url || 'https://example.com/default-image.jpg', // Provide a default image
      date: data.data.date|| 'No Date Available',
      url: data.data.url
    };
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "No Title Available",
      description: "No Description Available",
      image: 'https://example.com/default-image.jpg', // Default image
      date: "No Date Available",
      url: url
    };
  }
};


const LinkManagement = ({ isAdmin }) => {
  const dispatch = useLinkDispatch();
  const { linkItems, loading } = useLinkState();
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ url: "" });
  const [deletingItem, setDeletingItem] = useState(null);

  const googleSheetURL = "https://script.google.com/macros/s/AKfycby_mBYKKYAmxDX24vm-o4R7id_0Xuvbwwnf31G66k687TMAdBxiWU7dtsXOiXD-8Fql5w/exec";

  useEffect(() => {
    fetch(googleSheetURL)
      .then((response) => response.json())
      .then((data) => {
        // Sort the links by most recent first based on id or date
        const sortedData = data.sort((a, b) => b.id - a.id); // Sort by id descending
        dispatch({ type: "SET_LINKS", payload: sortedData });
      })
      .catch((error) => console.error("Error fetching links:", error));
  }, [dispatch]);

  const handleSave = () => {
    if (editingItem) {
      dispatch({ type: "EDIT_LINK", payload: editingItem });

      fetch(googleSheetURL, {
        method: "POST",
        body: JSON.stringify({ ...editingItem, action: "edit" }),
      }).catch((error) => console.error("Error saving link:", error));

      setEditingItem(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingItem) {
      dispatch({ type: "DELETE_LINK", payload: deletingItem.id });

      fetch(googleSheetURL, {
        method: "POST",
        body: JSON.stringify({ id: deletingItem.id, action: "delete" }),
      }).catch((error) => console.error("Error deleting link:", error));

      setDeletingItem(null);
    }
  };

  const handleAdd = async () => {
    try {
      const newId = linkItems.length > 0 ? Math.max(...linkItems.map((item) => item.id)) + 1 : 1;
  
      const metadata = await fetchMetadata(newItem.url);
      const newLinkItem = { id: newId, ...metadata };
  
      dispatch({ type: "ADD_LINK", payload: newLinkItem });
  
      const response = await fetch(googleSheetURL, {
        method: "POST",
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newLinkItem, action: "add" }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      console.log("Link added successfully.");
      setNewItem({ url: "" });
  
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };
  
  

  if (loading) {
    return <div>Loading links...</div>;
  }

  return (
    <div className="link-management-container">
      <h2>News</h2>

      {isAdmin && linkItems.length > 0 && (
        <div className="news-item new-news-item ">
          <h3>Add New Link</h3>
          <input
            type="text"
            placeholder="Enter URL"
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
            className="new-link-input"
          />
          <button onClick={handleAdd} className="add-link-button">Add Link</button>
        </div>
      )}

      {linkItems.length === 0 && isAdmin && (
        <div className="no-links">
          <p>No links available. Add a new link below:</p>
          <div className="new-link-form">
            <input
              type="text"
              placeholder="Enter URL"
              value={newItem.url}
              onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              className="new-link-input"
            />
            <button onClick={handleAdd} className="add-link-button">Add Link</button>
          </div>
        </div>
      )}

      {linkItems.map((item) => (
        <div key={item.id} className="link-item">
          {editingItem && editingItem.id === item.id ? (
            <div className="edit-form">
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, title: e.target.value })
                }
                placeholder="Title"
              />
              <input
                type="text"
                value={editingItem.url}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, url: e.target.value })
                }
                placeholder="URL"
              />
              <textarea
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
                placeholder="Description"
              />
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setEditingItem(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <CustomPreviewComponent data={item} /> {/* Use the custom preview component */}
              {isAdmin && !deletingItem && (
                <div className="link-actions">
                  <button onClick={() => setEditingItem(item)} className="edit-button">Edit</button>
                  <button onClick={() => setDeletingItem(item)} className="delete-button">Delete</button>
                </div>
              )}
            </>
          )}

          {deletingItem && deletingItem.id === item.id && (
            <div className="delete-confirmation">
              <p>Are you sure you want to delete this link?</p>
              <div className="delete-actions">
                <button onClick={handleDeleteConfirm} className="confirm-button">Confirm</button>
                <button onClick={() => setDeletingItem(null)} className="cancel-button">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}

      
    </div>
  );
};

export default LinkManagement;
