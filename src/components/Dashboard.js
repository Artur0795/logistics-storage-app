import React, { useEffect, useState, useCallback } from 'react';
import API from '../api';

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

const styles = {
  container: {
    maxWidth: 1100,
    margin: '40px auto 60px auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 32px rgba(33,150,243,0.10)',
    padding: '36px 44px 44px 44px',
    minHeight: '70vh',
    position: 'relative',
  },
  title: {
    fontSize: '2.1rem',
    fontWeight: 700,
    color: '#1976d2',
    marginBottom: 32,
    letterSpacing: '0.5px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    marginBottom: 32,
    background: '#f5faff',
    padding: '18px 24px',
    borderRadius: 10,
    boxShadow: '0 2px 8px rgba(33,150,243,0.07)',
  },
  input: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #bcdffb',
    fontSize: '1rem',
    outline: 'none',
    minWidth: 180,
    background: '#fff',
  },
  button: {
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 18px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  buttonSecondary: {
    background: '#e3f2fd',
    color: '#1976d2',
    border: 'none',
    borderRadius: 6,
    padding: '8px 14px',
    fontWeight: 500,
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginLeft: 8,
    transition: 'background 0.2s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#f8fbff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(33,150,243,0.07)',
    marginBottom: 40,
  },
  th: {
    background: '#e3f2fd',
    color: '#1976d2',
    fontWeight: 700,
    padding: '14px 8px',
    fontSize: '1.05rem',
    borderBottom: '2px solid #bcdffb',
    textAlign: 'left',
  },
  td: {
    padding: '12px 8px',
    fontSize: '1rem',
    borderBottom: '1px solid #e3f2fd',
    background: '#fff',
    verticalAlign: 'middle',
  },
  actions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  kot: {
    position: 'fixed',
    right: 40,
    bottom: 40,
    width: 320,
    height: 'auto',
    zIndex: 100,
    boxShadow: '0 2px 16px rgba(33,150,243,0.13)',
    borderRadius: 12,
  },
  pageBg: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(120deg, #e3f2fd 0%, #fff 100%)',
    zIndex: -1,
  }
};

const Dashboard = ({ userId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentValue, setEditCommentValue] = useState('');
  const [owner, setOwner] = useState(null);
  const [filesError, setFilesError] = useState(''); // новое состояние для ошибок загрузки файлов

  // Добавить проверку соединения с API
  const checkAPIConnection = useCallback(async () => {
    try {
      console.log('Проверка подключения к API...');
      console.log('Base URL:', API.defaults.baseURL);
      const response = await API.get('/health-check/');
      console.log('API доступен:', response.data);
    } catch (error) {
      console.error('API недоступен:', error);
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setMessage('Сервер недоступен. Проверьте подключение к интернету.');
      }
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    // Получение списка файлов пользователя или любого пользователя (если админ)
    // Сервер должен проверять права доступа и принимать user_id для админа
    try {
      setLoading(true);
      setFilesError('');
      const url = userId ? `/files/?user_id=${userId}` : '/files/';
      // userId передаётся только если админ просматривает чужое хранилище
      const res = await API.get(url);
      // Сервер возвращает список файлов с метаданными:
      // original_name, size, upload_date, last_download, comment, storage_path, special_link
      const filesData = res.data.files || res.data || [];
      setFiles(Array.isArray(filesData) ? filesData : []);
      if (res.data.owner) setOwner(res.data.owner);
    } catch (error) {
      console.error('Fetch files error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request
      });

      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setFilesError('Ошибка подключения к серверу. Проверьте интернет-соединение.');
      } else if (error.response?.status === 0) {
        setFilesError('Сервер недоступен. Проверьте настройки CORS.');
      } else if (error.response?.status === 401) {
        setFilesError('Нет доступа. Авторизуйтесь или войдите заново.');
      } else {
        setFilesError('Ошибка загрузки списка файлов');
      }
      setMessage('');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkAPIConnection();
    fetchFiles();
  }, [checkAPIConnection, fetchFiles]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Пожалуйста, выберите файл');
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setMessage('Файл слишком большой (максимум 100MB)');
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('comment', comment.trim());

    try {
      console.log('Uploading file:', selectedFile.name, selectedFile.size, selectedFile.type);
      const response = await API.post('/files/upload/', formData, {
      });
      console.log('Upload response:', response);
      setMessage('Файл успешно загружен');
      setSelectedFile(null);
      setComment('');
      document.querySelector('input[type="file"]').value = '';
      fetchFiles();
    } catch (error) {
      console.error('Upload error details:', error);
      console.error('Error response:', error.response);

      let errorMessage = 'Ошибка загрузки файла';
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage = 'Файл слишком большой';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'Неверный запрос';
        } else if (error.response.status === 401) {
          errorMessage = 'Нет доступа. Авторизуйтесь или войдите заново.';
        } else if (error.response.status === 415) {
          errorMessage = 'Неподдерживаемый тип файла. Разрешены только изображения.';
        } else if (error.response.status === 500) {
          errorMessage = 'Внутренняя ошибка сервера';
        } else {
          errorMessage = `Ошибка сервера: ${error.response.status}`;
        }
        console.error('Ответ сервера:', error.response.data);
      } else if (error.request) {
        errorMessage = 'Ошибка соединения с сервером';
      }

      setMessage(errorMessage);
    } finally {
      setUploadLoading(false);
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
    if (!renameValue.trim()) {
      setMessage('Имя файла не может быть пустым');
      return;
    }
    try {
      await API.post(`/files/${fileId}/rename/`, { new_name: renameValue.trim() });
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
      await API.post(`/files/${fileId}/comment/`, { comment: editCommentValue.trim() });
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
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setMessage('Ссылка скопирована');
      }).catch(() => {
        setMessage('Ошибка копирования ссылки');
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setMessage('Ссылка скопирована');
      } catch {
        setMessage('Ошибка копирования ссылки');
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return <div>Загрузка файлов...</div>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={styles.pageBg}></div>
      <div style={styles.container}>
        <Toast message={message} onClose={() => setMessage('')} />
        <h2 style={styles.title}>
          {owner
            ? `Файлы пользователя: ${owner.username} (${owner.full_name})`
            : 'Ваши файлы'}
        </h2>
        {!userId && (
          <>
            <div style={{ marginBottom: 8, color: '#1976d2', fontWeight: 500 }}>
              Загрузите любой файл на сайт (до 100MB)
            </div>
            <form onSubmit={handleUpload} style={styles.form}>
              <input
                type="file"
                onChange={e => setSelectedFile(e.target.files[0])}
                disabled={uploadLoading}
                accept="*/*"
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Комментарий"
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={uploadLoading}
                maxLength="500"
                style={styles.input}
              />
              <button type="submit" disabled={uploadLoading || !selectedFile} style={styles.button}>
                {uploadLoading ? 'Загрузка...' : 'Загрузить'}
              </button>
            </form>
          </>
        )}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Имя файла</th>
              <th style={styles.th}>Комментарий</th>
              <th style={styles.th}>Размер (байт)</th>
              <th style={styles.th}>Дата загрузки</th>
              <th style={styles.th}>Дата последнего скачивания</th>
              <th style={styles.th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filesError ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', background: '#fff', color: '#d32f2f', fontWeight: 500 }}>
                  {filesError}
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', background: '#fff' }}>
                  Файлы не найдены
                </td>
              </tr>
            ) : (
              files.map(file => (
                <tr key={file.id}>
                  <td style={styles.td}>
                    {renameId === file.id ? (
                      <>
                        <input
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          placeholder="Новое имя"
                          style={styles.input}
                        />
                        <button style={styles.button} onClick={() => handleRename(file.id)}>OK</button>
                        <button style={styles.buttonSecondary} onClick={() => setRenameId(null)}>Отмена</button>
                      </>
                    ) : (
                      <>
                        {file.original_name}
                        {!userId && (
                          <button style={styles.buttonSecondary} onClick={() => { setRenameId(file.id); setRenameValue(file.original_name); }}>Переименовать</button>
                        )}
                      </>
                    )}
                  </td>
                  <td style={styles.td}>
                    {editCommentId === file.id ? (
                      <>
                        <input
                          value={editCommentValue}
                          onChange={e => setEditCommentValue(e.target.value)}
                          placeholder="Комментарий"
                          style={styles.input}
                        />
                        <button style={styles.button} onClick={() => handleEditComment(file.id)}>OK</button>
                        <button style={styles.buttonSecondary} onClick={() => setEditCommentId(null)}>Отмена</button>
                      </>
                    ) : (
                      <>
                        {file.comment}
                        {!userId && (
                          <button style={styles.buttonSecondary} onClick={() => { setEditCommentId(file.id); setEditCommentValue(file.comment); }}>Изменить</button>
                        )}
                      </>
                    )}
                  </td>
                  <td style={styles.td}>{file.size ? file.size.toLocaleString() : '0'}</td>
                  <td style={styles.td}>{file.upload_date ? new Date(file.upload_date).toLocaleDateString('ru-RU') : '-'}</td>
                  <td style={styles.td}>{file.last_download ? new Date(file.last_download).toLocaleDateString('ru-RU') : '-'}</td>
                  <td style={{ ...styles.td, ...styles.actions }}>
                    <button style={styles.buttonSecondary} onClick={() => handleDownload(file.id, file.original_name)}>Скачать</button>
                    {!userId && (
                      <>
                        <button style={styles.buttonSecondary} onClick={() => handleDelete(file.id)}>Удалить</button>
                      </>
                    )}
                    <button style={styles.buttonSecondary} onClick={() => handleCopyLink(file.special_link)}>Копировать ссылку</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <img
          src="/kot.jpg"
          alt="Кот"
          style={styles.kot}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
