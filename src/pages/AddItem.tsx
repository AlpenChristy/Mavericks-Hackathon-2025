import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Upload, X, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:3001/api';

const AddItem: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_name: '',
    type: '',
    size: '',
    condition: '',
    tags: '',
    points_value: 0
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  if (!user || !profile) {
    return <Navigate to="/login" />;
  }

  const conditions = ['Excellent', 'Very Good', 'Good', 'Fair'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

  const fixedCategories = [
    'Outerwear',
    'Tops',
    'Bottoms',
    'Dresses',
    'Footwear',
    'Accessories',
    'Activewear',
    'Formal',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate points when condition or category changes
    if (name === 'condition' || name === 'category_name') {
      const newFormData = { ...formData, [name]: value };
      const estimatedPoints = estimatePoints(newFormData);
      setFormData(prev => ({ ...prev, [name]: value, points_value: estimatedPoints }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const target = event.target as FileReader;
          if (target && target.result) {
            setImages(prev => [...prev, target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const estimatePoints = (data: typeof formData) => {
    const basePoints = {
      'Excellent': 60,
      'Very Good': 45,
      'Good': 30,
      'Fair': 15
    };
    
    const categoryMultiplier = {
      'Formal': 1.2,
      'Outerwear': 1.1,
      'Dresses': 1.0,
      'Footwear': 1.1,
      'Accessories': 0.8,
      'Tops': 0.9,
      'Bottoms': 0.9,
      'Activewear': 0.9
    };

    const base = basePoints[data.condition as keyof typeof basePoints] || 30;
    const multiplier = categoryMultiplier[data.category_name as keyof typeof categoryMultiplier] || 1;
    
    return Math.round(base * multiplier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (images.length === 0) {
      setError('Please add at least one image');
      setLoading(false);
      return;
    }

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_name: formData.category_name,
          type: formData.type,
          size: formData.size,
          condition: formData.condition,
          tags: tagsArray,
          images: images,
          points_value: formData.points_value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to list item');
      }

      // Show success toast
      setToastMessage('Item listed successfully! It will be reviewed by our team.');
      setToastType('success');
      setShowToast(true);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to list item. Please try again.';
      setError(errorMsg);
      setToastMessage(errorMsg);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
          <div className="p-8 border-b border-neutral-200">
            <h1 className="text-3xl font-bold text-black">List a New Item</h1>
            <p className="text-neutral-600 mt-2 text-lg">
              Share your unused clothes with the community and earn points
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                Photos *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-black transition-colors duration-200 group">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2 group-hover:text-black transition-colors duration-200" />
                      <span className="text-sm text-neutral-600 group-hover:text-black transition-colors duration-200">Add Photo</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-sm text-neutral-500">
                Upload up to 5 photos. First photo will be the main image.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Title */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Vintage Denim Jacket"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Category *
                </label>
                <select
                  id="category_name"
                  name="category_name"
                  required
                  value={formData.category_name}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select category</option>
                  {fixedCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-neutral-700 mb-2">
                  Type *
                </label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Jacket, Shirt, Dress"
                />
              </div>

              {/* Size */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-neutral-700 mb-2">
                  Size
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select size</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-neutral-700 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              {/* Points Value */}
              <div>
                <label htmlFor="points_value" className="block text-sm font-medium text-neutral-700 mb-2">
                  Points Value
                </label>
                <input
                  type="number"
                  id="points_value"
                  name="points_value"
                  value={formData.points_value}
                  onChange={handleInputChange}
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="Auto-calculated"
                  readOnly
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Points are calculated based on condition and category
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                placeholder="Describe your item in detail..."
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-neutral-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                placeholder="vintage, denim, casual (separate with commas)"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Add relevant tags to help others find your item
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Listing Item...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    List Item
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem;