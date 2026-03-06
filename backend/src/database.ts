import catalyst from 'zcatalyst-sdk-node';

// Initialize Catalyst Data Store
export const initDatabase = async () => {
  try {
    console.log('Catalyst Data Store initialized');
    // Tables must be created in Catalyst console first
    // Users should create these tables:
    // 1. users (email, password, name, created_at)
    // 2. orders (patient_name, status, order_type, date_created, due_date, created_by, sph_od, cyl_od, axis_od, add_od, va_od, prism_bases_od, sph_os, cyl_os, axis_os, add_os, va_os, prism_bases_os)
    // 3. comments (order_id, user_id, comment, created_at)
    // 4. order_history (order_id, user_id, field_name, old_value, new_value, created_at)
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Get datastore instance from Catalyst app context
export const getDatastore = (app: any) => {
  return app.datastore();
};

// Get a table instance
export const getTable = (app: any, tableName: string) => {
  const datastore = getDatastore(app);
  return datastore.getTableInstance(tableName);
};

// Insert a row
export const dbRun = async (app: any, tableName: string, data: Record<string, any>) => {
  try {
    const table = getTable(app, tableName);
    const result = await table.insertRow(data);
    return { lastID: result.getID?.() || result.id, changes: 1 };
  } catch (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    throw error;
  }
};

// Get a single row by ID
export const dbGet = async (app: any, tableName: string, recordId: number) => {
  try {
    const table = getTable(app, tableName);
    const result = await table.getRow(recordId);
    return result;
  } catch (error) {
    console.error(`Error getting row from ${tableName}:`, error);
    return null;
  }
};

// Get rows with a ZCQL query
export const dbAll = async (app: any, query: string) => {
  try {
    const zcql = app.zcql();
    const result = await zcql.executeZCQLQuery(query);
    return result.data || [];
  } catch (error) {
    console.error(`Error executing ZCQL query:`, error);
    return [];
  }
};

// Update a row
export const dbUpdate = async (app: any, tableName: string, recordId: number, data: Record<string, any>) => {
  try {
    const table = getTable(app, tableName);
    await table.updateRow(recordId, data);
    return { changes: 1 };
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    throw error;
  }
};

// Delete a row
export const dbDelete = async (app: any, tableName: string, recordId: number) => {
  try {
    const table = getTable(app, tableName);
    await table.deleteRow(recordId);
    return { changes: 1 };
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    throw error;
  }
};

// Get a row by column value
export const dbGetByColumn = async (app: any, tableName: string, columnName: string, value: any) => {
  const escapedValue = String(value).replace(/'/g, "''");
  const query = `SELECT * FROM ${tableName} WHERE ${columnName} = '${escapedValue}'`;
  const rows = await dbAll(app, query);
  return rows.length > 0 ? rows[0] : null;
};

// Get all rows from a table
export const dbGetAll = async (app: any, tableName: string, orderBy?: string) => {
  const query = orderBy 
    ? `SELECT * FROM ${tableName} ORDER BY ${orderBy}`
    : `SELECT * FROM ${tableName}`;
  return dbAll(app, query);
};

