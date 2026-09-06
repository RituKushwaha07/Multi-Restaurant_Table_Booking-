import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../services/api"; 

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/restaurants')
      .then(res => setRestaurants(res.data.data || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Restaurants</h2>
      <div className="row g-4">
        {restaurants.map((r) => (
          <div className="col-md-4" key={r._id}>
            <div className="card h-100 shadow-sm">
              <img src={r.image || 'https://via.placeholder.com/300x180'} className="card-img-top" alt={r.name} />
              <div className="card-body">
                <h5 className="card-title">{r.name}</h5>
                <p className="card-text text-muted">{r.address}</p>
                <Link to={`/restaurant/${r._id}`} className="btn btn-primary">View & Book</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}