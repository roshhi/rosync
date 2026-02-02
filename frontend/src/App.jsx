import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LoginForm from './components/forms/LoginForm';
import SignupForm from './components/forms/SignupForm';
import SharedFolder from './pages/SharedFolder';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout/>}>
          <Route path="/" element={<LandingPage />}/>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/share/:shareId" element={<SharedFolder />}/>
      </Routes>
    </Router>
  );
}

export default App;
