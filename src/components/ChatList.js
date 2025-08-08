import React from 'react';

const getInitials = (name) => {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const ChatList = ({ conversations, onSelect }) => {
  return (
    <div>
      <h3 style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>Chats</h3>
      {Object.keys(conversations).map((wa_id) => {
        const lastMsg = conversations[wa_id].slice(-1)[0];
        const displayName = lastMsg?.name || wa_id;

        return (
          <div
            key={wa_id}
            onClick={() => onSelect(wa_id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              background: '#fff',
            }}
          >
            {/* Profile Icon Circle */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#25d366',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                marginRight: '10px',
              }}
            >
              {getInitials(displayName)}
            </div>

            {/* Name + Last message */}
            <div>
              <strong>{displayName}</strong>
              <div style={{ fontSize: '13px', color: '#555' }}>
                {lastMsg?.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
