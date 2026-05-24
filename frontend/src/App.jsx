import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyCode from './pages/VerifyCode';
import Topics from './pages/Topics';
import AddTopic from './pages/AddTopic';
import AdminDashboard from './pages/AdminDashboard';
import ConfirmApplication from './pages/ConfirmApplication';
import TeacherApplications from './pages/TeacherApplications';
import RequireRole from './components/RequireRole';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

function HomeRedirect() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/export" replace />;
  return <Navigate to="/topics" replace />;
}

const roleLabels = {
  student: 'Студент',
  teacher: 'Преподаватель',
  admin: 'Администратор',
};

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-changed', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-changed', syncAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">ВКР Финуниверситет</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/topics">Темы</Nav.Link>
              {role === 'teacher' && (
                <>
                  <Nav.Link as={Link} to="/add-topic">Добавить тему</Nav.Link>
                  <Nav.Link as={Link} to="/teacher-applications">Заявки</Nav.Link>
                </>
              )}
              {role === 'admin' && (
                <Nav.Link as={Link} to="/export">Выгрузка</Nav.Link>
              )}
            </Nav>
            <Nav>
              {token ? (
                <>
                  <Navbar.Text className="me-2 text-light">
                    {roleLabels[role] || role}
                  </Navbar.Text>
                  <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    Выход
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                  <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/add-topic" element={<AddTopic />} />
          <Route path="/confirm-application" element={<ConfirmApplication />} />
          <Route path="/teacher-applications" element={<TeacherApplications />} />
          <Route
            path="/export"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route path="/admin" element={<Navigate to="/export" replace />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
