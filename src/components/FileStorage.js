import React, { useEffect, useState } from 'react';
import API from '../api';
import { useParams } from 'react-router-dom';

const Toast = ({ message, onClose }) => (
  message ? (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      background: '#1976d2',
      color: '#fff',
      padding: '14px 28px',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(33,150,243,0.18)',
      zIndex: 9999,
      fontSize: '1.1rem'
    }}>
      {message}
      <button style={{
        marginLeft: 16,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        cursor: 'pointer'
      }} onClick={onClose}>×</button>
    </div>
  ) : null
);

const FileStorage = ({ isAdmin }) => {
  const { userId } = useParams(); 
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    API.get(userId ? `/files/${userId}/` : '/files/me/')
      .then(res => setFiles(res.data))
      .catch(() => setError('Ошибка загрузки файлов'));
  }, [userId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить файл?')) return;
    try {
      await API.delete(`/files/${id}/`);
      setFiles(files.filter(f => f.id !== id));
    } catch {
      setError('Ошибка удаления файла');
    }
  };

  const handleRename = async (id, newName) => {
    try {
      await API.patch(`/files/${id}/`, { name: newName });
      setFiles(files.map(f => f.id === id ? { ...f, name: newName } : f));
    } catch {
      setError('Ошибка переименования файла');
    }
  };

  const handleDownload = (url) => {
    window.open(url, '_blank');
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setToastMsg('Ссылка скопирована!');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setError('Выберите файл');
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы. Пожалуйста, войдите в систему.');
      return;
    }
    try {
      const res = await API.post('/files/upload/', formData, {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      if (res.data && res.data.id) {
        setComment('');
        setSelectedFile(null);
        setError('');
        setToastMsg('Файл успешно загружен');
        API.get(userId ? `/files/${userId}/` : '/files/me/')
          .then(r => setFiles(r.data))
          .catch(() => setError('Ошибка загрузки файлов'));
      } else if (res.data && res.data.file) {
        setFiles([...files, res.data.file]);
        setComment('');
        setSelectedFile(null);
        setError('');
        setToastMsg('Файл успешно загружен');
      } else {
        setError('Неожиданный ответ сервера');
      }
    } catch (err) {
      setError('Ошибка загрузки файла: ' + (err.response?.data?.error || ''));
    }
  };

  return (
    <div className="file-storage">
      <Toast message={toastMsg || error} onClose={() => { setToastMsg(''); setError(''); }} />
      <h2>Файловое хранилище</h2>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleUpload}>
        <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
        <input
          type="text"
          placeholder="Комментарий"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        <button type="submit">Загрузить файл</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Имя файла</th>
            <th>Комментарий</th>
            <th>Размер</th>
            <th>Дата загрузки</th>
            <th>Дата скачивания</th>
            <th>Операции</th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.id}>
              <td>
                <input
                  type="text"
                  defaultValue={f.name}
                  onBlur={e => e.target.value !== f.name && handleRename(f.id, e.target.value)}
                />
              </td>
              <td>{f.comment}</td>
              <td>{f.size} МБ</td>
              <td>{f.uploaded_at}</td>
              <td>{f.last_downloaded_at}</td>
              <td>
                <button onClick={() => handleDelete(f.id)}>Удалить</button>
                <button onClick={() => handleDownload(f.url)}>Скачать/Просмотр</button>
                <button onClick={() => handleCopyLink(f.url)}>Копировать ссылку</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileStorage;
