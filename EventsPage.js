import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile } from '../services/userService';
import { getEvents, joinEvent, leaveEvent } from '../services/eventService';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import '../styles/EventsPage.css';

const EventsPage = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsEventsLoading(true);
        const eventsData = await getEvents(token);
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsEventsLoading(false);
      }
    }
    fetchEvents();
  }, [token]);

  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleParticipate = async (eventId) => {
    try {
      await joinEvent(eventId, token);
      const updatedEvents = await getEvents(token);
      setEvents(updatedEvents);
      closeModal();
    } catch (error) {
      console.error('Failed to join event:', error);
    }
  };

  const handleNotParticipate = async (eventId) => {
    try {
      await leaveEvent(eventId, token);
      const updatedEvents = await getEvents(token);
      setEvents(updatedEvents);
      closeModal();
    } catch (error) {
      console.error('Failed to leave event:', error);
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Show full-screen loading state if initial user data is loading
  if (isLoading) {
    return <div className="loading">Loading Events...</div>;
  }

  if (!user) {
    return <div className="error-message">Unable to load user data. Please try again later.</div>;
  }

  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Events</h1>
          <span className="current-date">{formattedDate}</span>
        </div>
        <div className="events-section">
          {isEventsLoading ? (
            <div className="events-loading">
              <div className="loading-indicator">Loading events data...</div>
            </div>
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onClick={handleCardClick} />
              ))}
            </div>
          ) : (
            <p>No upcoming events found.</p>
          )}
        </div>
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={closeModal}
            onParticipate={handleParticipate}
            onNotParticipate={handleNotParticipate}
          />
        )}
      </div>
    </div>
  );
};

export default EventsPage;