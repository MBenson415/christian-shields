import React, { useEffect, useState } from 'react';
import './TourDates.css';

function TourDates() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Using the artist name "Christian Shields" and the provided API key as app_id
        const response = await fetch('https://rest.bandsintown.com/artists/Christian%20Shields/events?app_id=dc96a41e21d9a40009d1220c2f676fdd');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tour dates');
        }
        
        const data = await response.json();
        // Ensure data is an array, otherwise default to empty array to show "no dates" message
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        // If there is an error, we might want to show the error or just "no dates". 
        // For now, keeping error state but ensuring setEvents doesn't get bad data.
        setError('Could not load tour dates.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="tour-loading">Loading tour dates...</div>;
  
  if (error) return <div className="tour-error">{error}</div>;

  if (events.length === 0) {
    return <div className="no-dates">There are no upcoming tour dates.</div>;
  }

  return (
    <div className="tour-dates">
      {events.map((event) => {
        const date = new Date(event.datetime);
        return (
          <div key={event.id} className="tour-event">
            <div className="event-date">
              <span className="month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
              <span className="day">{date.getDate()}</span>
            </div>
            <div className="event-details">
              <div className="venue">{event.venue.name}</div>
              <div className="location">
                {event.venue.city}, {event.venue.region || event.venue.country}
              </div>
            </div>
            <div className="event-actions">
              {event.offers && event.offers.length > 0 ? (
                <a href={event.offers[0].url} target="_blank" rel="noopener noreferrer" className="ticket-btn">
                  TICKETS
                </a>
              ) : (
                <span className="no-tickets">Info</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TourDates;
