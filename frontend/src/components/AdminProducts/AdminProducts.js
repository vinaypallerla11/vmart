import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Make sure to install js-cookie
import { useNavigate } from 'react-router-dom'; // If you're using react-router for navigation
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    image: '',
    rating: {
      rate: '',
      count: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch products on initial load
  useEffect(() => {
    const token = Cookies.get('jwt_token');
    if (!token) {
      alert('You need to login first');
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('https://vmart-yxk6.onrender.com/admin/products', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        alert('Error fetching products: ' + error.message);
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nameParts = name.split('.');
    if (nameParts.length === 2) {
      setFormData((prevData) => ({
        ...prevData,
        [nameParts[0]]: {
          ...prevData[nameParts[0]],
          [nameParts[1]]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const isValidUrl = (str) => {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const token = Cookies.get('jwt_token');
    if (!token) {
      alert('You need to login first');
      navigate('/login');
      return;
    }

    if (!formData.title || !formData.price || !formData.description || !formData.category || !formData.image || !formData.rating.rate || !formData.rating.count) {
      alert('Please fill out all fields.');
      return;
    }

    if (isNaN(parseFloat(formData.price)) || isNaN(parseFloat(formData.rating.rate)) || isNaN(parseInt(formData.rating.count))) {
      alert('Please enter valid numbers for Price, Rating (Rate), and Rating (Count).');
      return;
    }

    if (!isValidUrl(formData.image)) {
      alert('Please enter a valid image URL.');
      return;
    }

    const newProduct = {
      title: formData.title,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      image: formData.image,
      rating: {
        rate: parseFloat(formData.rating.rate),
        count: parseInt(formData.rating.count),
      },
    };

    setLoading(true);
    try {
      const response = await fetch('https://vmart-yxk6.onrender.com/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
        credentials: 'include',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to add product.');
      }

      const result = await response.json();
      setProducts((prevProducts) => [...prevProducts, result.product]);
      setFormData({
        title: '',
        price: '',
        description: '',
        category: '',
        image: '',
        rating: {
          rate: '',
          count: '',
        },
      });

      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('There was an error adding the product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-products">
      <h2>Admin Products</h2>

      <form onSubmit={handleAddProduct}>
        <div>
          <label>Title: </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Price: </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description: </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Category: </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Image URL: </label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Rating (Rate): </label>
          <input
            type="number"
            name="rating.rate"
            value={formData.rating.rate}
            onChange={handleChange}
            required
            min="0"
            max="5"
          />
        </div>
        <div>
          <label>Rating (Count): </label>
          <input
            type="number"
            name="rating.count"
            value={formData.rating.count}
            onChange={handleChange}
            required
            min="0"
          />
        </div>
        <button type="submit" disabled={loading}>Add Product</button>
      </form>

      {loading && <div className="loading">Loading...</div>}

      <h3>Total Products: {products.length}</h3>

      <div className="product-list">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            <img src={product.image} alt={product.title} />
            <h4>{product.title}</h4>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Category: {product.category}</p>
            <p>Rating: {product.rating.rate} ({product.rating.count} reviews)</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
