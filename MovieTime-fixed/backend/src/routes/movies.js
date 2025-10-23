const express = require('express')
const router = express.Router()
const db = require('../db')
router.get('/', async (req,res)=>{
  try{ const [rows] = await db.query('SELECT id, title, poster FROM movies ORDER BY title'); res.json(rows) }catch(e){ console.error(e); res.status(500).json({message:'Server error'}) }
})
module.exports = router
