import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';

function Register() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/register', { 
        email, 
        full_name: fullName, 
        password,
        role 
      });
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 404 || detail === 'Not Found') {
        setError(
          'Сервер не найден. Запустите Docker (infra) и перезапустите npm run dev.'
        );
      } else {
        setError(
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
              ? detail.map((d) => d.msg).join(', ')
              : 'Ошибка при регистрации'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto" style={{ maxWidth: '500px' }}>
      <Card.Body>
        <Card.Title className="text-center mb-4">Регистрация</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@edu.ru"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>ФИО</Form.Label>
            <Form.Control
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иванов Иван Иванович"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Роль</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
              <option value="admin">Администратор</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit" variant="success" className="w-100" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Register;
