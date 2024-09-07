import React, { useContext } from 'react';
import { NotificationContext } from '../Contexts/NotificationContext';
import { Dropdown } from 'flowbite-react';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { notifications, removeNotification, checkInvites } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleInviteClick = () => {
    navigate('/groups');
    // Rimuovi la notifica di invito
    const inviteIndex = notifications.findIndex(n => n.type === 'invite');
    if (inviteIndex !== -1) {
      removeNotification(inviteIndex);
    }
    // Aggiorna lo stato degli inviti
    checkInvites();
  };

  const handleNotificationClick = (index, notification) => {
    if (notification.type === 'invite') {
      handleInviteClick();
    } else {
      removeNotification(index);
    }
  };

  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <div className="relative">
          <FaBell className="text-2xl mr-3 dark:text-gray-400" />
          {notifications.length > 0 && (
            <div className="absolute top-0 right-2 bg-red-500 text-white text-xs rounded-full border-2 h-4 w-4 flex items-center justify-center">
              {notifications.length}
            </div>
          )}
        </div>
      }
    >
      <Dropdown.Header>Notifiche</Dropdown.Header>
      {notifications.length === 0 ? (
        <Dropdown.Item>Nessuna nuova notifica</Dropdown.Item>
      ) : (
        notifications.map((notification, index) => (
          <Dropdown.Item key={index} onClick={() => handleNotificationClick(index, notification)}>
            {notification.message}
          </Dropdown.Item>
        ))
      )}
    </Dropdown>
  );
}