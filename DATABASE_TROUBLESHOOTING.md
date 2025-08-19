# Database Connection Troubleshooting

## Current Issue
The MySQL database at `medplusafrica.com:3306` is refusing connections with error `ECONNREFUSED`.

## Possible Solutions

### 1. Check MySQL Server Configuration
The MySQL server might not be configured to accept remote connections. On the server hosting `medplusafrica.com`, check:

```sql
-- Check if MySQL allows remote connections
SHOW VARIABLES LIKE 'bind_address';
-- Should show '0.0.0.0' or '*' for all interfaces

-- Check user privileges
SELECT user, host FROM mysql.user WHERE user='medplusa_invoicing';
-- The host should allow connections from your IP or be '%' for all hosts
```

### 2. Firewall Configuration
Check if port 3306 is open on the server:
```bash
# On the MySQL server
sudo ufw status
sudo iptables -L

# Or test from external location
telnet medplusafrica.com 3306
nc -zv medplusafrica.com 3306
```

### 3. Alternative Connection Methods

#### Option A: Try with SSL disabled
```javascript
const connection = await mysql.createConnection({
  host: 'medplusafrica.com',
  port: 3306,
  user: 'medplusa_invoicing',
  password: 'x2J2^CV%rwrhhsw6',
  database: 'medplusa_invoicing',
  ssl: false, // Disable SSL
});
```

#### Option B: Try different SSL modes
```javascript
const connection = await mysql.createConnection({
  host: 'medplusafrica.com',
  port: 3306,
  user: 'medplusa_invoicing',
  password: 'x2J2^CV%rwrhhsw6',
  database: 'medplusa_invoicing',
  ssl: {
    rejectUnauthorized: false,
    secureProtocol: 'TLSv1_2_method'
  },
});
```

#### Option C: Alternative port
Some hosting providers use different ports:
- Try port 3307, 33060, or other common MySQL ports
- Check with hosting provider for correct port

### 4. Check Hosting Provider Settings
If this is a shared hosting or managed database:
- Verify remote access is enabled in hosting control panel
- Check if your current IP address is whitelisted
- Some providers require connecting through SSH tunnel

### 5. Test Connection Locally
If you have access to the server, test locally:
```bash
mysql -h localhost -u medplusa_invoicing -p medplusa_invoicing
```

## Recommended Next Steps

1. **Contact the hosting provider** to verify:
   - Remote MySQL access is enabled
   - Correct connection details (host, port, SSL requirements)
   - IP whitelist requirements

2. **Alternative: Use SSH Tunnel**
   If direct connection isn't possible, consider SSH tunnel:
   ```bash
   ssh -L 3306:localhost:3306 user@medplusafrica.com
   ```

3. **Consider Database Migration**
   For easier management, consider migrating to:
   - [Neon (Postgres)](#open-mcp-popover) - Connect to Neon MCP
   - [Supabase](#open-mcp-popover) - Connect to Supabase MCP
   - [PlanetScale (MySQL)](https://planetscale.com) - Cloud MySQL

## Current Environment Variables
```
DB_HOST=medplusafrica.com
DB_PORT=3306
DB_USER=medplusa_invoicing
DB_PASSWORD=x2J2^CV%rwrhhsw6
DB_NAME=medplusa_invoicing
```
