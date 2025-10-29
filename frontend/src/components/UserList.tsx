import React, { useState, useEffect } from 'react';
import { userService, type User, type ApiResponse } from '../services/api';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers();
      setUsers(response.data.data);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    const newUser = {
      name: `User ${Date.now()}`,
      email: `user${Date.now()}@example.com`
    };

    try {
      await userService.createUser(newUser);
      fetchUsers(); // Refresh the list
    } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Users</h2>
      <button onClick={createUser}>Create New User</button>
      <button onClick={fetchUsers}>Refresh</button>
      
      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};