import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import { getBookings, deleteBooking } from '../api'


const localMovies = [
  { id: 'm1', title: 'Ambuli', poster: '/posters/ambuli.jpg' },
  { id: 'm2', title: 'The Pursuit of Happyness', poster: '/posters/happyness.jpg' },
  { id: 'm3', title: 'The Shawshank Redemption', poster: '/posters/shawshank.png' }
]


export default function Home({movies}) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

 
  const moviesToShow = localMovies


  const loadBookings = ()=>{
    getBookings().then(setBookings).catch(()=>setBookings([])).finally(()=>setLoading(false))
  }
  useEffect(()=>{ loadBookings() },[])

  if(!moviesToShow) return <div>Loading movies...</div>

  
  const findTitle = (movieId) => {
    const m = moviesToShow.find(x => String(x.id) === String(movieId))
    return m ? m.title : movieId
  }

  return (
    <div>
      <section className="movies-grid">
        {moviesToShow.length===0 ? (
          <div className='card'>No movies found. Check backend or run DB seed.</div>
        ) : moviesToShow.map(m=>(
          <div key={m.id} className="card">
            <img src={m.poster || '/posters/poster1.svg'} alt={m.title} />
            <h3>{m.title}</h3>
            <Link to={`/booking/${m.id}`} className="btn">Book</Link>
          </div>
        ))}
      </section>

      <section>
        <h2>Your Bookings</h2>
        {loading ? <div>Loading bookings...</div> : (bookings.length===0 ? <div>No bookings yet.</div> : (
          <div className="bookings-list">
            {bookings.map(b=>(
              <div key={b.id} className="booking-item">
                <div><strong>{findTitle(b.movie_id)}</strong> — {b.date} {b.time}</div>
                <div>Seats: {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}</div>
                <button onClick={async ()=>{ try{ await deleteBooking(b.id); loadBookings() }catch(e){ alert('Cancel failed') } }} className="btn small">Cancel</button>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}
