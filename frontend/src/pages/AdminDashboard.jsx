import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/admin/applications');
      setApplications(response.data.applications || []);
    } catch (err) {
      setError('Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/api/admin/export/excel', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Ошибка при выгрузке');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="mb-1">Выгрузка</h2>
          <p className="text-muted mb-0">Утверждённые заявки на темы ВКР</p>
        </div>
        <Button variant="primary" onClick={handleExport} disabled={exporting || applications.length === 0}>
          {exporting ? 'Выгрузка...' : 'Скачать Excel'}
        </Button>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Студент</th>
            <th>Email</th>
            <th>Тема ВКР</th>
            <th>Руководитель</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">Нет утверждённых заявок</td>
            </tr>
          ) : (
            applications.map((app, idx) => (
              <tr key={idx}>
                <td>{app.student_name}</td>
                <td>{app.student_email}</td>
                <td>{app.topic_title}</td>
                <td>{app.supervisor_name}</td>
                <td><span className="badge bg-success">{app.status === 'approved' ? '✅ Утверждена' : app.status}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}

export default AdminDashboard;
