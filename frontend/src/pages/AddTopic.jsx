import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';

function AddTopic() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/topic/api/topic/teachers/me/topics', { title, description });
      navigate('/topics');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при создании темы');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto" style={{ maxWidth: '600px' }}>
      <Card.Body>
        <Card.Title className="text-center mb-4">Добавить тему ВКР</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Название темы</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название темы"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание темы, требования к студенту..."
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100" disabled={loading}>
            {loading ? 'Создание...' : 'Создать тему'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default AddTopic;
