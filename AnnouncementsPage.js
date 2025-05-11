import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getProfile } from '../services/userService';
import { getAnnouncements } from '../services/announcementService';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import '../styles/AnnouncementsPage.css';

const AnnouncementsPage = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnouncementsLoading, setIsAnnouncementsLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setIsAnnouncementsLoading(true);
        const announcementsData = await getAnnouncements(token);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setIsAnnouncementsLoading(false);
      }
    }
    fetchAnnouncements();
  }, [token]);

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
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
    return <div className="loading">Loading Announcements...</div>;
  }

  if (!user) {
    return <div className="error-message">Unable to load user data. Please try again later.</div>;
  }

  return (
    <div className="layout-container">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Announcements</h1>
          <span className="current-date">{formattedDate}</span>
        </div>
        <div className="announcements-section">
          {isAnnouncementsLoading ? (
            <div className="announcements-loading">
              <div className="loading-indicator">Loading announcements data...</div>
            </div>
          ) : announcements.length > 0 ? (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          ) : (
            <p>No announcements available.</p>
          )}
        </div>
        {selectedAnnouncement && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;