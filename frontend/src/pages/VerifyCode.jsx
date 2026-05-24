import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

function VerifyCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || '';
  const debugCode = searchParams.get('debug_code') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/verify', { email, code });
      const userRole = data.user?.role || 'student';
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', userRole);
      window.dispatchEvent(new Event('auth-changed'));
      navigate(userRole === 'admin' ? '/export' : '/topics');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg).join(', ')
            : 'Неверный код или ошибка соединения'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto" style={{ maxWidth: '400px' }}>
      <Card.Body>
        <Card.Title>Подтверждение</Card.Title>
        <p className="text-muted">Вход для {email}</p>
        {debugCode && (
          <Alert variant="info">
            Код для локальной проверки: <strong>{debugCode}</strong>
          </Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-значный код"
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

export default VerifyCode;
