const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../db')
router.post('/signup', async (req,res)=>{
  const {name,email,password} = req.body
  if(!name || !email || !password) return res.status(400).json({message:'Missing fields'})
  try{
    const [rows] = await db.query('SELECT id FROM users WHERE email=?',[email])
    if(rows.length) return res.status(400).json({message:'User exists'})
    const hash = await bcrypt.hash(password, 10)
    const [result] = await db.query('INSERT INTO users (name,email,password) VALUES (?,?,?)',[name,email,hash])
    const userId = result.insertId
    const token = jwt.sign({id:userId, email, name}, process.env.JWT_SECRET || 'secret123', {expiresIn:'7d'})
    res.json({token, user:{id:userId, name, email}})
  }catch(e){ console.error(e); res.status(500).json({message:'Server error'}) }
})
router.post('/login', async (req,res)=>{
  const {email,password} = req.body
  if(!email || !password) return res.status(400).json({message:'Missing fields'})
  try{
    const [rows] = await db.query('SELECT * FROM users WHERE email=?',[email])
    if(!rows.length) return res.status(400).json({message:'Invalid credentials'})
    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if(!match) return res.status(400).json({message:'Invalid credentials'})
    const token = jwt.sign({id:user.id, email:user.email, name:user.name}, process.env.JWT_SECRET || 'secret123', {expiresIn:'7d'})
    res.json({token, user:{id:user.id, name:user.name, email:user.email}})
  }catch(e){ console.error(e); res.status(500).json({message:'Server error'}) }
})
module.exports = router
