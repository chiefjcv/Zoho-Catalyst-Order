# Catalyst Data Store Setup Guide

Your application has been refactored to use **Zoho Catalyst's Data Store** instead of PostgreSQL. Follow these steps to set up your database tables.

## Step 1: Access Catalyst Console

1. Go to [Zoho Catalyst Console](https://catalyst.zoho.com)
2. Navigate to your project: **CatalystOrder** (or your project name)
3. In the left sidebar, go to **Cloud Scale** → **Data Store**

## Step 2: Create the Tables

You need to create 4 tables in the Data Store. Follow these steps for each table:

### Table 1: Users

1. Click **Create a new Table**
2. **Table Name**: `users`
3. Add the following columns:

| Column Name | Type | Properties |
|------|------|-----------|
| id | Auto ID | Primary Key |
| email | text | Unique, Not Null |
| password | text | Not Null |
| name | text | Not Null |
| created_at | DateTime | Not Null, Default: Current DateTime |

4. Click **Create Table**

---

### Table 2: Orders

1. Click **Create a new Table**
2. **Table Name**: `orders`
3. Add the following columns:

| Column Name | Type | Properties |
|------|------|-----------|
| id | Auto ID | Primary Key |
| patient_name | text | Not Null |
| status | text | Not Null, Default: 'Open' |
| order_type | text | Not Null, Default: 'Stock' |
| date_created | DateTime | Not Null, Default: Current DateTime |
| due_date | DateTime | Not Null |
| created_by | BigInt | Allow Null (User ID) |
| sph_od | Double | Allow Null |
| cyl_od | Double | Allow Null |
| axis_od | Int | Allow Null |
| add_od | Double | Allow Null |
| va_od | text | Allow Null |
| prism_bases_od | text | Allow Null |
| sph_os | Double | Allow Null |
| cyl_os | Double | Allow Null |
| axis_os | Int | Allow Null |
| add_os | Double | Allow Null |
| va_os | text | Allow Null |
| prism_bases_os | text | Allow Null |

4. Click **Create Table**

---

### Table 3: Comments

1. Click **Create a new Table**
2. **Table Name**: `comments`
3. Add the following columns:

| Column Name | Type | Properties |
|------|------|-----------|
| id | Auto ID | Primary Key |
| order_id | BigInt | Not Null |
| user_id | BigInt | Not Null |
| comment | text | Not Null |
| created_at | DateTime | Not Null, Default: Current DateTime |

4. Click **Create Table**

---

### Table 4: Order History

1. Click **Create a new Table**
2. **Table Name**: `order_history`
3. Add the following columns:

| Column Name | Type | Properties |
|------|------|-----------|
| id | Auto ID | Primary Key |
| order_id | BigInt | Not Null |
| user_id | BigInt | Not Null |
| field_name | text | Not Null |
| old_value | text | Allow Null |
| new_value | text | Allow Null |
| created_at | DateTime | Not Null, Default: Current DateTime |

4. Click **Create Table**

---

## Step 3: Configure Scopes & Permissions (Optional)

To allow your frontend/users to access the Data Store:

1. Go to each table in the Data Store
2. Click **Scopes & Permissions**
3. Configure access levels based on your needs

For basic setup, you can skip this if your backend handles all database operations.

## Step 4: Set Environment Variables

In your Catalyst deployment settings, add:

```
JWT_SECRET=your-secret-key-here
NODE_ENV=production
PORT=5000
```

No `DATABASE_URL` is needed anymore!

## Step 5: Deploy

Once the tables are created and environment variables are set:

1. Go to **Deployments**
2. Click **Deploy** or **Build & Deploy**
3. Monitor the logs for any errors

## Testing

After deployment, test the API:

```bash
# Register a user
curl -X POST https://your-app.catalystapp.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST https://your-app.catalystapp.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create an order (replace TOKEN with your JWT token)
curl -X POST https://your-app.catalystapp.io/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "due_date": "2026-03-20",
    "status": "Open"
  }'
```

## Troubleshooting

### "Table not found" errors
- Make sure all 4 tables are created in Catalyst Data Store
- Table names must be lowercase: `users`, `orders`, `comments`, `order_history`

### Authentication errors
- Verify JWT_SECRET is set in environment variables
- Check that the token is being sent in the Authorization header

### ZCQL query errors
- ZCQL is Catalyst's query language (similar to SQL)
- Check the exact table and column names in your queries
- JOINs syntax: `SELECT o.*, u.name FROM orders o LEFT JOIN users u ON o.created_by = u.id`

### Connection issues
- Catalyst initializes the SDK automatically for Advanced I/O functions
- Ensure your `index.ts` properly initializes the Catalyst SDK middleware

## Key Changes from PostgreSQL

- **No connection strings** - All database access goes through Catalyst SDK
- **ZCQL queries** - Uses Catalyst's query language instead of pure SQL
- **Auto IDs** - Primary keys are auto-generated by Catalyst
- **No migrations** - Table structure is defined in the console

## Next Steps

After setup:
1. Test all API endpoints
2. Monitor logs in Catalyst console
3. Configure Scopes & Permissions for your needs
4. Set up backups in Catalyst settings

For more help, see:
- [Catalyst Data Store Docs](https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/introduction/)
- [ZCQL Query Language](https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/introduction/)
- [Catalyst SDK Documentation](https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/overview/)
