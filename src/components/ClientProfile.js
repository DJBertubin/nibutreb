import React from 'react';
import './ClientProfile.css';

const ClientProfile = ({ name, clientId, imageUrl }) => {
  return (
    <div className="client-profile">
      <img src={imageUrl} alt="Client" className="client-image" />
      <div className="client-info">
        <h3 className="client-name">{name}</h3>
        <p className="client-id">Client ID: {clientId}</p>
      </div>
    </div>
  );
};

export default ClientProfile;
