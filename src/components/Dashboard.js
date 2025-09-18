import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';

const Dashboard = ({ userId }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [owner, setOwner] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      const url = userId ? `/files/?user_id=${userId}` : '/files/';
      const res = await API.get(url);
      setFiles(res.data.files || res.data); 
      if (res.data.owner) setOwner(res.data.owner);
    } catch {
      setMessage('Ошибка загрузки списка файлов');
    }
  }, [userId]);

  useEffect(() => {
    fetchFiles();
    if (message) {
      const t = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [message, userId, fetchFiles]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment);
    try {
      await API.post('/files/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Файл успешно загружен');
      setSelectedFile(null);
      setComment('');
      fetchFiles();
    } catch {
      setMessage('Ошибка загрузки файла');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Удалить файл?')) return;
    try {
      await API.delete(`/files/${fileId}/delete/`);
      setMessage('Файл удалён');
      fetchFiles();
    } catch {
      setMessage('Ошибка удаления файла');
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const res = await API.get(`/files/${fileId}/download/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setMessage('Ошибка скачивания файла');
    }
  };

  const handleRename = async (fileId) => {
    try {
      await API.post(`/files/${fileId}/rename/`, { new_name: renameValue });
      setMessage('Файл переименован');
      setRenameId(null);
      setRenameValue('');
      fetchFiles();
    } catch {
      setMessage('Ошибка переименования файла');
    }
  };

  const handleEditComment = async (fileId) => {
    try {
      await API.post(`/files/${fileId}/comment/`, { comment: editCommentValue });
      setMessage('Комментарий обновлён');
      setEditCommentId(null);
      setEditCommentValue('');
      fetchFiles();
    } catch {
      setMessage('Ошибка обновления комментария');
    }
  };

  const handleCopyLink = (specialLink) => {
    const url = `${window.location.origin}/api/files/special/${specialLink}/`;
    navigator.clipboard.writeText(url);
    setMessage('Ссылка скопирована');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <h2>
        {owner
          ? `Файлы пользователя: ${owner.username} (${owner.full_name})`
          : 'Ваши файлы'}
      </h2>
      {message && <p>{message}</p>}
      {}
      {!userId && (
        <form onSubmit={handleUpload}>
          <input
            type="file"
            onChange={e => setSelectedFile(e.target.files[0])}
          />
          <input
            type="text"
            placeholder="Комментарий"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <button type="submit">Загрузить</button>
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>Имя файла</th>
            <th>Комментарий</th>
            <th>Размер (байт)</th>
            <th>Дата загрузки</th>
            <th>Дата последнего скачивания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.id}>
              <td>
                {renameId === file.id ? (
                  <>
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      placeholder="Новое имя"
                    />
                    <button onClick={() => handleRename(file.id)}>OK</button>
                    <button onClick={() => setRenameId(null)}>Отмена</button>
                  </>
                ) : (
                  <>
                    {file.original_name}
                    {!userId && (
                      <button onClick={() => { setRenameId(file.id); setRenameValue(file.original_name); }}>Переименовать</button>
                    )}
                  </>
                )}
              </td>
              <td>
                {editCommentId === file.id ? (
                  <>
                    <input
                      value={editCommentValue}
                      onChange={e => setEditCommentValue(e.target.value)}
                      placeholder="Комментарий"
                    />
                    <button onClick={() => handleEditComment(file.id)}>OK</button>
                    <button onClick={() => setEditCommentId(null)}>Отмена</button>
                  </>
                ) : (
                  <>
                    {file.comment}
                    {!userId && (
                      <button onClick={() => { setEditCommentId(file.id); setEditCommentValue(file.comment); }}>Изменить</button>
                    )}
                  </>
                )}
              </td>
              <td>{file.size}</td>
              <td>{file.upload_date}</td>
              <td>{file.last_download || '-'}</td>
              <td>
                <button onClick={() => handleDownload(file.id, file.original_name)}>Скачать</button>
                {!userId && (
                  <>
                    <button onClick={() => handleDelete(file.id)}>Удалить</button>
                  </>
                )}
                <button onClick={() => handleCopyLink(file.special_link)}>Копировать ссылку</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {}
      <img
        src="/kot.jpg"
        alt="Кот"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          width: 350,
          height: 'auto',
          zIndex: 100
        }}
      />
    </div>
  );
};

export default Dashboard;
