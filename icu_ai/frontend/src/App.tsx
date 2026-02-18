import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Auth/Login.tsx';
import Signup from './pages/Auth/Signup.tsx';
import EvaluatorInput from './pages/Evaluator/EvaluatorInput.tsx';
import EvaluatorResults from './pages/Evaluator/EvaluatorResults.tsx';
import Questionnaire from './pages/IdeaGenerator/Questionnaire.tsx';
import IdeasDisplay from './pages/IdeaGenerator/IdeasDisplay.tsx';
import Dashboard from './pages/Dashboard.tsx';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/evaluate" element={<EvaluatorInput />} />
                        <Route path="/evaluate/results/:id" element={<EvaluatorResults />} />
                        <Route path="/generate" element={<Questionnaire />} />
                        <Route path="/ideas/:id" element={<IdeasDisplay />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
