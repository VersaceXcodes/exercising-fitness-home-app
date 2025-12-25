import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Category } from '../../types';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.deleteCategory(id);
        loadCategories();
      } catch (error) {
        console.error(error);
        alert('Failed to delete category');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Categories</h1>
        <Link to="/admin/categories/new" style={{ padding: '10px 20px', background: '#22c55e', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Add New Category
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f5', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Description</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{category.id}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{category.name}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{category.description}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <Link to={`/admin/categories/${category.id}`} style={{ marginRight: '10px', color: '#3b82f6' }}>Edit</Link>
                <button onClick={() => handleDelete(category.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Categories;
