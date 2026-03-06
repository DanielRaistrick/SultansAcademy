import React from 'react';
import './Resources.css';

const Resources = () => {
  const videos = [
    {
      id: '8c2-hHvXKgE',
      title: 'Guitar Tutorial',
      url: 'https://www.youtube.com/watch?v=8c2-hHvXKgE',
      description: 'Learn this song step by step'
    },
    {
      id: 'SfYUhWtvQZM',
      title: 'Guitar Lesson',
      url: 'https://www.youtube.com/watch?v=SfYUhWtvQZM&t=213s',
      description: 'Complete guitar walkthrough'
    },
    {
      id: 'Fav-D1dJm5M',
      title: 'Song Tutorial',
      url: 'https://www.youtube.com/watch?v=Fav-D1dJm5M',
      description: 'Master this guitar piece'
    }
  ];

  return (
    <div className="resources">
      <div className="resources-header">
        <h2>Learning Resources</h2>
        <p className="resources-subtitle">Video tutorials and lessons to help you learn guitar</p>
      </div>

      <div className="resources-grid">
        {videos.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card"
          >
            <div className="video-thumbnail">
              <img 
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={video.title}
                loading="lazy"
              />
              <div className="play-overlay">
                <div className="play-button">▶</div>
              </div>
            </div>
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-description">{video.description}</p>
              <div className="video-badge">
                <span className="badge-icon">📺</span>
                <span>YouTube Tutorial</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="resources-footer">
        <div className="add-resource-hint">
          <span className="hint-icon">💡</span>
          <p>More tutorials coming soon! Bookmark your favorite guitar learning videos.</p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
