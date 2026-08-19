# SQL Server Database Setup Guide for ProBoard

## Prerequisites
- SQL Server 2019 or later (Local or Remote)
- SQL Server Management Studio (SSMS) - Optional but recommended
- Node.js with mssql package installed

## Option 1: Using SQL Server Management Studio (SSMS)

### Step 1: Create Database
1. Open SQL Server Management Studio
2. Connect to your SQL Server instance
3. Right-click on "Databases" → Select "New Database"
4. Enter database name: `ProBoard`
5. Click "OK"

### Step 2: Run Schema Script
1. Right-click on the `ProBoard` database
2. Select "New Query"
3. Copy and paste the contents of `backend/db/schema.sql`
4. Click "Execute" or press F5
5. Verify the output shows "Database schema created successfully!"

### Step 3: Verify Tables
1. Expand the `ProBoard` database
2. Expand "Tables" folder
3. You should see the following tables:
   - Users
   - Boards
   - Columns
   - Tasks
   - Messages
   - DirectMessages
   - Activities
   - BoardMembers

---

## Option 2: Using Command Line (sqlcmd)

### Step 1: Create Database
```bash
sqlcmd -S localhost -U sa -P YourPassword123! -Q "CREATE DATABASE ProBoard"
```

### Step 2: Run Schema Script
```bash
sqlcmd -S localhost -U sa -P YourPassword123! -d ProBoard -i backend/db/schema.sql
```

---

## Option 3: Using Node.js (Programmatic)

Run this Node.js script to set up the database:

```javascript
import sql from 'mssql';
import fs from 'fs';

const config = {
  server: 'localhost',
  port: 1433,
  database: 'master', // Connect to master first
  authentication: {
	type: 'default',
	options: {
	  userName: 'sa',
	  password: 'YourPassword123!'
	}
  },
  options: {
	encrypt: false,
	trustServerCertificate: true
  }
};

async function setupDatabase() {
  try {
	// Connect to master database
	const pool = new sql.ConnectionPool(config);
	await pool.connect();

	// Create database
	await pool.request().query('CREATE DATABASE ProBoard');
	console.log('✅ Database created');

	await pool.close();

	// Connect to ProBoard database
	config.database = 'ProBoard';
	const pool2 = new sql.ConnectionPool(config);
	await pool2.connect();

	// Read and execute schema
	const schema = fs.readFileSync('./backend/db/schema.sql', 'utf8');
	const queries = schema.split('GO');

	for (const query of queries) {
	  if (query.trim()) {
		await pool2.request().query(query);
	  }
	}

	console.log('✅ Schema created successfully');
	await pool2.close();
  } catch (error) {
	console.error('❌ Setup error:', error.message);
  }
}

setupDatabase();
```

---

## Configuration

Update `.env` file in the backend folder:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=ProBoard
DB_USER=sa
DB_PASSWORD=YourPassword123!
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
SOCKET_IO_CORS=http://localhost:5173
```

---

## Testing the Connection

Run the backend server:

```bash
cd backend
npm install
npm start
```

You should see:
```
✅ Connected to SQL Server successfully
🚀 ProBoard Backend Server running on port 5000
```

---

## Sample Data

The schema includes sample data:

### Users
- **admin** / password (role: Admin)
- **john_doe** / password (role: Standard User)
- **jane_smith** / password (role: Standard User)
- **mike_wilson** / password (role: Standard User)

(Note: Passwords are hashed. Use registration endpoint to create new users with real passwords)

### Demo Board
- **ProBoard Demo** board with 3 sample columns and 4 sample tasks

---

## Backup & Restore

### Backup Database
```bash
sqlcmd -S localhost -U sa -P YourPassword123! -Q "BACKUP DATABASE ProBoard TO DISK='C:\Backups\ProBoard.bak'"
```

### Restore Database
```bash
sqlcmd -S localhost -U sa -P YourPassword123! -Q "RESTORE DATABASE ProBoard FROM DISK='C:\Backups\ProBoard.bak'"
```

---

## Troubleshooting

### Connection Error: "Cannot connect to server"
- Verify SQL Server is running
- Check server name and port (default: 1433)
- Verify credentials (username and password)
- Check firewall settings

### Error: "User does not have permission"
- Ensure the sa (System Administrator) account is used
- Verify authentication mode is set correctly

### Error: "Database already exists"
- Drop existing database first:
```bash
sqlcmd -S localhost -U sa -P YourPassword123! -Q "DROP DATABASE ProBoard"
```

---

## Next Steps

1. ✅ Database created
2. Run backend: `npm start`
3. Update frontend to use API
4. Test authentication endpoints
5. Implement remaining features
