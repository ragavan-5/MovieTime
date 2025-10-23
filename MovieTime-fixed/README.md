MovieTime Full (fixed)
----------------------
This package runs frontend and backend from root.

Instructions:
1. From project root run:
   npm install
   # postinstall installs backend & frontend deps
2. Ensure MySQL is running and create DB/tables:
   mysql -u root -p < backend/migrations/schema.sql
3. Copy backend/.env.example to backend/.env and set DB_PASSWORD and JWT_SECRET
4. Start both:
   npm run start
