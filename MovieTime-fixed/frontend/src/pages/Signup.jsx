import React, {useState} from 'react'
import { signup } from '../api'
export default function Signup(){
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); 
  const [password,setPassword]=useState('')
  const handleSignup=async(e)=>{ e.preventDefault();
     try{ const res=await signup({name,email,password}); 
  localStorage.setItem('token', res.token); 
  localStorage.setItem('user', JSON.stringify(res.user));
   window.location.href='/' }catch(e){ alert('Signup failed: ' + (e.message||e)) } }
  return (
    <form className="card auth-card" onSubmit={handleSignup}>
      <h2>Signup</h2>
      <label>Name: <input value={name} onChange={e=>setName(e.target.value)} required /></label>
      <label>Email: <input value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password: <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <div className="actions"><button className="btn" type="submit">Create account</button></div>
    </form>
  )
}
