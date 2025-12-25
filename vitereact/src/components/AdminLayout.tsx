import { Link, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', background: '#f4f4f5', padding: '20px', borderRight: '1px solid #e4e4e7' }}>
        <h2 style={{ marginBottom: '20px' }}>Admin Dashboard</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/admin" style={{ textDecoration: 'none', color: '#333' }}>Dashboard</Link>
          <Link to="/admin/categories" style={{ textDecoration: 'none', color: '#333' }}>Categories</Link>
          <Link to="/admin/workouts" style={{ textDecoration: 'none', color: '#333' }}>Workouts</Link>
          <Link to="/admin/exercises" style={{ textDecoration: 'none', color: '#333' }}>Exercises</Link>
        </nav>
        <button 
          onClick={handleLogout}
          style={{ marginTop: 'auto', padding: '10px', width: '100%', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </aside>
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
