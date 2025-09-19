import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/users/', { withCredentials: true })
      .then(res => setUsers(res.data))
      .catch(err => {
        setError(
          err.response?.data?.error
            ? `Ошибка: ${err.response.data.error}`
            : 'Ошибка загрузки списка пользователей'
        );
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await API.delete(`/users/${id}/`);
      setUsers(users.filter(u => u.id !== id));
    } catch {
      setError('Ошибка удаления пользователя');
    }
  };

  const handleToggleAdmin = async (id, isAdmin) => {
    try {
      await API.patch(`/users/${id}/`, { is_admin: !isAdmin });
      setUsers(users.map(u => u.id === id ? { ...u, is_admin: !isAdmin } : u));
    } catch {
      setError('Ошибка изменения прав администратора');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Пользователи</h2>
      {error && <div className="auth-error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Логин</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Админ</th>
            <th>Файлов</th>
            <th>Размер файлов</th>
            <th>Файлы</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.username}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>
                <input
                  type="checkbox"
                  checked={u.is_admin}
                  onChange={() => handleToggleAdmin(u.id, u.is_admin)}
                />
              </td>
              <td>{u.file_count}</td>
              <td>{u.file_size} МБ</td>
              <td>
                <Link to={`/files/${u.id}`}>Управление файлами</Link>
              </td>
              <td>
                <button onClick={() => handleDelete(u.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
