import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Category } from '../../types';
import CategoryFormComponent from '../../components/CategoryForm';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [category, setCategory] = useState<Partial<Category> | undefined>(undefined);

  useEffect(() => {
    if (isEditing) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      const categories = await api.getCategories();
      const cat = categories.find(c => c.id === parseInt(id!));
      if (cat) {
        setCategory(cat);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (isEditing) {
        await api.updateCategory(id!, formData);
      } else {
        await api.createCategory(formData);
      }
      navigate('/admin/categories');
    } catch (error) {
      console.error(error);
      alert('Failed to save category');
    }
  };

  return (
    <CategoryFormComponent
      initialData={category}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin/categories')}
      isEditing={isEditing}
    />
  );
};

export default CategoryForm;
