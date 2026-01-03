import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalWorkouts: number;
  popularWorkouts: { title: string; count: string }[];
  completionsOverTime: { date: string; count: string | number }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getAdminStats();
        // Convert counts to numbers for the chart and format date
        data.completionsOverTime = data.completionsOverTime.map((item: any) => ({
          ...item,
          count: parseInt(item.count),
          date: new Date(item.date).toLocaleDateString()
        }));
        setStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <p style={metricStyle}>{stats.totalUsers}</p>
        </div>
        <div style={cardStyle}>
          <h3>Active Subscriptions</h3>
          <p style={metricStyle}>{stats.activeSubscriptions}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Workouts Completed</h3>
          <p style={metricStyle}>{stats.totalWorkouts}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
        {/* Chart */}
        <div style={{ height: '400px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Workout Activity (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.completionsOverTime}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Workouts Completed" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Workouts */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Most Popular Workouts</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Workout</th>
                <th style={{ padding: '10px' }}>Completions</th>
              </tr>
            </thead>
            <tbody>
              {stats.popularWorkouts.length > 0 ? (
                stats.popularWorkouts.map((workout, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{workout.title}</td>
                    <td style={{ padding: '10px' }}>{workout.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ padding: '10px', textAlign: 'center' }}>No workout data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center' as const
};

const metricStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#3b82f6',
  margin: '10px 0 0 0'
};

export default Dashboard;
