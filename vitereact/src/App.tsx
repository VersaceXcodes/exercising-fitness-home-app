import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import CategoryForm from './pages/admin/CategoryForm';
import Workouts from './pages/admin/Workouts';
import WorkoutForm from './pages/admin/WorkoutForm';
import Exercises from './pages/admin/Exercises';
import ExerciseForm from './pages/admin/ExerciseForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          <Route path="categories" element={<Categories />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id" element={<CategoryForm />} />
          
          <Route path="workouts" element={<Workouts />} />
          <Route path="workouts/new" element={<WorkoutForm />} />
          <Route path="workouts/:id" element={<WorkoutForm />} />
          
          <Route path="exercises" element={<Exercises />} />
          <Route path="exercises/new" element={<ExerciseForm />} />
          <Route path="exercises/:id" element={<ExerciseForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
