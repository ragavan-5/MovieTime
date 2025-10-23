const express = require('express')
const router = express.Router()
const db = require('../db')
const auth = require('../utils/authMiddleware')
router.get('/', auth, async (req,res)=>{
  try{ const [rows] = await db.query('SELECT * FROM bookings WHERE user_id=? ORDER BY created_at DESC',[req.user.id]); const data = rows.map(r=>({ ...r, seats: JSON.parse(r.seats) })); res.json(data) }catch(e){ console.error(e); res.status(500).json({message:'Server error'}) }
})
router.post('/', auth, async (req,res)=>{
  const { movieId, date, time, seats } = req.body
  if(!movieId || !date || !time || !seats || !Array.isArray(seats)) return res.status(400).json({message:'Missing fields'})
  try{ const bookingId = 'b_' + Date.now(); await db.query('INSERT INTO bookings (id, user_id, movie_id, date, time, seats) VALUES (?,?,?,?,?,?)', [bookingId, req.user.id, movieId, date, time, JSON.stringify(seats)]); res.json({bookingId}) }catch(e){ console.error(e); res.status(500).json({message:'Server error'}) }
})
router.delete('/:id', auth, async (req,res)=>{
  const id = req.params.id
  try{ const [result] = await db.query('DELETE FROM bookings WHERE id=? AND user_id=?', [id, req.user.id]); if(result.affectedRows===0) return res.status(404).json({message:'Not found'}); res.json({ok:true}) }catch(e){ console.error(e); res.status(500).json({message:'Server error'}) }
})
module.exports = router
