import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import api from '../api/client';

function ConfirmApplication() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const applicationId = searchParams.get('application_id') || '';
  const hintCode = searchParams.get('code') || '';
  const topicTitle = searchParams.get('topic') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/topic/api/topic/confirm', null, {
        params: { application_id: applicationId, code },
      });
      setSuccess(data.message || 'Код подтверждён');
      setTimeout(() => navigate('/topics'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка подтверждения');
    } finally {
      setLoading(false);
    }
  };

  if (!applicationId) {
    return (
      <Alert variant="warning">
        Заявка не найдена. <Link to="/topics">Вернуться к темам</Link>
      </Alert>
    );
  }

  return (
    <Card className="mx-auto" style={{ maxWidth: '450px' }}>
      <Card.Body>
        <Card.Title>Подтверждение заявки</Card.Title>
        {topicTitle && <p className="text-muted">Тема: {topicTitle}</p>}
        {hintCode && (
          <Alert variant="info">
            Код для локальной проверки: <strong>{hintCode}</strong>
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>6-значный код</Form.Label>
            <Form.Control
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100" disabled={loading}>
            {loading ? 'Проверка...' : 'Подтвердить'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ConfirmApplication;
