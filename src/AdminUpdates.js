import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

const AdminUpdates = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    featured: false
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Check if already authenticated (Supabase session) and verify admin access
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is the admin
        const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'officialquickbite@gmail.com';
        if (session.user.email?.toLowerCase() === adminEmail.toLowerCase()) {
          setIsAuthenticated(true);
          fetchUpdates();
        } else {
          // Not the admin user - sign them out
          await supabase.auth.signOut();
          setPasswordError('Access denied. Only admin users can access this panel.');
        }
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'officialquickbite@gmail.com';
        if (session.user.email?.toLowerCase() === adminEmail.toLowerCase()) {
          setIsAuthenticated(true);
          fetchUpdates();
        } else {
          await supabase.auth.signOut();
          setPasswordError('Access denied. Only admin users can access this panel.');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        console.error('Auth error:', authError);
        setPasswordError('Invalid email or password. Please try again.');
        setPassword('');
      } else {
        // Verify the user is the admin
        const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'officialquickbite@gmail.com';
        if (data.user.email?.toLowerCase() === adminEmail.toLowerCase()) {
          setIsAuthenticated(true);
          setPasswordError('');
          setEmail('');
          setPassword('');
          fetchUpdates();
        } else {
          // Not the admin - sign them out
          await supabase.auth.signOut();
          setPasswordError('Access denied. Only admin users can access this panel.');
          setPassword('');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setPasswordError('An error occurred. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setUpdates([]);
  };

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching updates:', fetchError);
        setError('Failed to load updates. Please try again.');
      } else {
        setUpdates(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('updates')
        .insert([{
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category || 'General',
          featured: formData.featured || false
        }]);

      if (insertError) {
        console.error('Error creating update:', insertError);
        setError('Failed to create update. Please try again.');
      } else {
        setSuccess('Update created successfully!');
        setFormData({ title: '', content: '', category: 'General', featured: false });
        fetchUpdates();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleEdit = (update) => {
    setEditingId(update.id);
    setFormData({
      title: update.title,
      content: update.content,
      category: update.category || 'General',
      featured: update.featured || false
    });
    setError(null);
    setSuccess('');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('updates')
        .update({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category || 'General',
          featured: formData.featured || false
        })
        .eq('id', editingId);

      if (updateError) {
        console.error('Error updating update:', updateError);
        setError('Failed to update. Please try again.');
      } else {
        setSuccess('Update updated successfully!');
        setEditingId(null);
        setFormData({ title: '', content: '', category: 'General', featured: false });
        fetchUpdates();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('updates')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting update:', deleteError);
        setError('Failed to delete update. Please try again.');
      } else {
        setSuccess('Update deleted successfully!');
        setDeleteConfirm(null);
        fetchUpdates();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', category: 'General', featured: false });
    setError(null);
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-md w-full mx-4">
          <div className="card bg-white p-8 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Access</h2>
            <p className="text-gray-600 mb-6 text-center">Enter your admin email and password to access the admin panel</p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Admin email"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Password"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                  required
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-2">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Login
              </button>
            </form>
            
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-gray-600 hover:text-quickbites-yellow transition-colors w-full text-center"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin interface
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Updates</h1>
            <p className="text-gray-600">Manage your website updates</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {/* Create/Edit Form */}
        <div className="card bg-white mb-8 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? 'Edit Update' : 'Create New Update'}
          </h2>
          
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Update title"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Update content"
                rows="8"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300 resize-vertical"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-quickbites-yellow focus:outline-none transition-colors duration-300"
                >
                  <option value="General">General</option>
                  <option value="Launch">Launch</option>
                  <option value="Feature">Feature</option>
                  <option value="Update">Update</option>
                  <option value="Announcement">Announcement</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-quickbites-yellow border-gray-300 rounded focus:ring-quickbites-yellow"
                  />
                  <span className="ml-3 text-gray-700 font-medium">Featured Update</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary"
              >
                {editingId ? 'Update' : 'Create'} Update
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Updates List */}
        <div className="card bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Updates ({updates.length})</h2>
          
          {loading ? (
            <p className="text-gray-600 text-center py-8">Loading updates...</p>
          ) : updates.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No updates yet. Create your first update above!</p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-quickbites-yellow transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{update.title}</h3>
                        {update.featured && (
                          <span className="bg-quickbites-yellow text-white px-3 py-1 rounded-full text-xs font-bold">
                            Featured
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {update.category}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        Created: {formatDate(update.created_at)}
                        {update.updated_at !== update.created_at && (
                          <span className="ml-2">• Updated: {formatDate(update.updated_at)}</span>
                        )}
                      </p>
                      <p className="text-gray-600 line-clamp-2">{update.content.substring(0, 150)}...</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(update)}
                      className="px-4 py-2 bg-quickbites-yellow text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(update.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Delete Confirmation */}
                  {deleteConfirm === update.id && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 mb-3">Are you sure you want to delete this update? This action cannot be undone.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDelete(update.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpdates;
