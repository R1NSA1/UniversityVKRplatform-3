import React from 'react';
import { Navigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';

function RequireRole({ role, children }) {
  const token = localStorage.getItem('token');
  const currentRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== role) {
    return (
      <Alert variant="warning">
        Раздел доступен только администратору. Войдите под учётной записью с ролью «Администратор».
      </Alert>
    );
  }

  return children;
}

export default RequireRole;
