/*const jwt = require('jsonwebtoken')
module.exports = function(req,res,next){
  const auth = req.headers.authorization
  if(!auth) return res.status(401).json({message:'No token'})
  const parts = auth.split(' ')
  if(parts.length!==2) return res.status(401).json({message:'Bad auth header'})
  const token = parts[1]
  try{ const data = jwt.verify(token, process.env.JWT_SECRET || 'secret123'); req.user = data; next() }catch(e){ return res.status(401).json({message:'Invalid token'}) }
}
*/
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = authMiddleware;

