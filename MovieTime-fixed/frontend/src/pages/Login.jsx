import React, {useState} from 'react'
import { login } from '../api'
export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('')
  const handleLogin=async(e)=>{ e.preventDefault(); try{ const res=await login({email,password}); localStorage.setItem('token', res.token); localStorage.setItem('user', JSON.stringify(res.user)); window.location.href='/' }catch(e){ alert('Login failed: ' + (e.message||e)) } }
  return (
    <form className="card auth-card" onSubmit={handleLogin}>
      <h2>Login</h2>
      <label>Email: <input value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password: <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <div className="actions"><button className="btn" type="submit">Login</button></div>
    </form>
  )
}
