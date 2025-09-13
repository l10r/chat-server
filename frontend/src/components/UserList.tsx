import React from 'react';
import { getUsernameStyle } from '../utils/userColors';

interface UserListProps {
  users: string[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="user-list">
      {users.map((user) => (
        <span key={user} className="user-item">
          <span style={getUsernameStyle(user, users)}>
            {user}
          </span>
        </span>
      ))}
    </div>
  );
};