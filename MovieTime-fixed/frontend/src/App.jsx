import React, {useState, useEffect} from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Booking from './pages/Booking'
import ConfirmBooking from './pages/ConfirmBooking'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { getMovies } from './api'
export default function App(){
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')||'null'))
  const [movies, setMovies] = useState([])
  const navigate = useNavigate()
  useEffect(()=>{
    getMovies().then(setMovies).catch(e=>{ console.error('Could not load movies', e); setMovies([]) })
  },[])
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    navigate('/')
  }
  return (
    <div className="app">
      <header className="topbar">
        <h1>MovieTime</h1>
        <nav>
          <Link to="/">Home</Link>
          {currentUser ? (
            <>
              <span className="muted">Hello, {currentUser.name}</span>
              <button className="linkish" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home movies={movies} />} />
          <Route path="/booking/:id" element={<Booking movies={movies} />} />
          <Route path="/confirm" element={<ConfirmBooking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
    </div>
  )
}
