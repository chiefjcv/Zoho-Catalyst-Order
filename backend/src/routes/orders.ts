import express from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { dbAll, dbGetByColumn, dbRun, dbUpdate, dbDelete } from '../database.js';

const router = express.Router();

const ORDER_TYPES = ['Stock', 'Purchase', 'Special'];

// Get all orders
router.get('/', async (req: AuthRequest, res) => {
  try {
    const app = req.zcatalystApp;
    const orders = await dbAll(app, `
      SELECT o.*, u.name as created_by_name 
      FROM orders o 
      LEFT JOIN users u ON o.created_by = u.id 
      ORDER BY o.date_created DESC
    `);

    // Get comments for each order
    for (const order of orders) {
      const comments = await dbAll(app, `
        SELECT c.*, u.name as user_name 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.order_id = ${order.id} 
        ORDER BY c.created_at DESC
      `);
      order.comments = comments;
    }

    res.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const app = req.zcatalystApp;
    const orderId = req.params.id;

    const orders = await dbAll(app, `
      SELECT o.*, u.name as created_by_name 
      FROM orders o 
      LEFT JOIN users u ON o.created_by = u.id 
      WHERE o.id = ${orderId}
    `);

    const order = orders[0];
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get comments
    const comments = await dbAll(app, `
      SELECT c.*, u.name as user_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.order_id = ${orderId}
      ORDER BY c.created_at DESC
    `);

    // Get history
    const history = await dbAll(app, `
      SELECT h.*, u.name as user_name 
      FROM order_history h 
      JOIN users u ON h.user_id = u.id 
      WHERE h.order_id = ${orderId}
      ORDER BY h.created_at DESC
    `);

    order.comments = comments;
    order.history = history;

    res.json(order);
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
router.post('/', async (req: AuthRequest, res) => {
  try {
    const app = req.zcatalystApp;
    const {
      patient_name,
      due_date,
      status,
      order_type,
      sph_od,
      cyl_od,
      axis_od,
      add_od,
      va_od,
      prism_bases_od,
      sph_os,
      cyl_os,
      axis_os,
      add_os,
      va_os,
      prism_bases_os
    } = req.body;

    const type = order_type && ORDER_TYPES.includes(order_type) ? order_type : 'Stock';

    if (!patient_name || !due_date) {
      return res.status(400).json({ error: 'Patient name and due date are required' });
    }

    const result = await dbRun(app, 'orders', {
      patient_name,
      due_date,
      status: status || 'Open',
      order_type: type,
      created_by: req.userId,
      sph_od: sph_od || null,
      cyl_od: cyl_od || null,
      axis_od: axis_od || null,
      add_od: add_od || null,
      va_od: va_od || null,
      prism_bases_od: prism_bases_od || null,
      sph_os: sph_os || null,
      cyl_os: cyl_os || null,
      axis_os: axis_os || null,
      add_os: add_os || null,
      va_os: va_os || null,
      prism_bases_os: prism_bases_os || null
    });

    // Log creation in history
    await dbRun(app, 'order_history', {
      order_id: result.lastID,
      user_id: req.userId,
      field_name: 'status',
      old_value: null,
      new_value: status || 'Open'
    });

    const orders = await dbAll(app, `SELECT * FROM orders WHERE id = ${result.lastID}`);
    res.status(201).json(orders[0]);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const app = req.zcatalystApp;
    const {
      patient_name,
      due_date,
      status,
      order_type,
      sph_od,
      cyl_od,
      axis_od,
      add_od,
      va_od,
      prism_bases_od,
      sph_os,
      cyl_os,
      axis_os,
      add_os,
      va_os,
      prism_bases_os
    } = req.body;
    const orderId = req.params.id;

    // Get current order
    const currentOrders = await dbAll(app, `SELECT * FROM orders WHERE id = ${orderId}`);
    const currentOrder = currentOrders[0];
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const newOrderType =
      order_type !== undefined && ORDER_TYPES.includes(order_type)
        ? order_type
        : (currentOrder.order_type ?? 'Stock');

    // Prepare update data
    const updateData: any = {};
    if (patient_name !== undefined) updateData.patient_name = patient_name;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (status !== undefined) updateData.status = status;
    updateData.order_type = newOrderType;
    if (sph_od !== undefined) updateData.sph_od = sph_od;
    if (cyl_od !== undefined) updateData.cyl_od = cyl_od;
    if (axis_od !== undefined) updateData.axis_od = axis_od;
    if (add_od !== undefined) updateData.add_od = add_od;
    if (va_od !== undefined) updateData.va_od = va_od;
    if (prism_bases_od !== undefined) updateData.prism_bases_od = prism_bases_od;
    if (sph_os !== undefined) updateData.sph_os = sph_os;
    if (cyl_os !== undefined) updateData.cyl_os = cyl_os;
    if (axis_os !== undefined) updateData.axis_os = axis_os;
    if (add_os !== undefined) updateData.add_os = add_os;
    if (va_os !== undefined) updateData.va_os = va_os;
    if (prism_bases_os !== undefined) updateData.prism_bases_os = prism_bases_os;

    // Update order
    await dbUpdate(app, 'orders', parseInt(orderId), updateData);

    // Log changes in history
    if (status !== undefined && status !== currentOrder.status) {
      await dbRun(app, 'order_history', {
        order_id: orderId,
        user_id: req.userId,
        field_name: 'status',
        old_value: currentOrder.status,
        new_value: status
      });
    }

    if (patient_name !== undefined && patient_name !== currentOrder.patient_name) {
      await dbRun(app, 'order_history', {
        order_id: orderId,
        user_id: req.userId,
        field_name: 'patient_name',
        old_value: currentOrder.patient_name,
        new_value: patient_name
      });
    }

    if (due_date !== undefined && due_date !== currentOrder.due_date) {
      await dbRun(app, 'order_history', {
        order_id: orderId,
        user_id: req.userId,
        field_name: 'due_date',
        old_value: currentOrder.due_date,
        new_value: due_date
      });
    }

    if (newOrderType !== (currentOrder.order_type ?? 'Stock')) {
      await dbRun(app, 'order_history', {
        order_id: orderId,
        user_id: req.userId,
        field_name: 'order_type',
        old_value: currentOrder.order_type ?? 'Stock',
        new_value: newOrderType
      });
    }

    // Log prescription field changes
    const prescriptionFields = [
      { dbCol: 'sph_od', displayName: 'Sph (OD)' },
      { dbCol: 'cyl_od', displayName: 'Cyl (OD)' },
      { dbCol: 'axis_od', displayName: 'Axis (OD)' },
      { dbCol: 'add_od', displayName: 'Add (OD)' },
      { dbCol: 'va_od', displayName: 'VA (OD)' },
      { dbCol: 'prism_bases_od', displayName: 'Prism Bases (OD)' },
      { dbCol: 'sph_os', displayName: 'Sph (OS)' },
      { dbCol: 'cyl_os', displayName: 'Cyl (OS)' },
      { dbCol: 'axis_os', displayName: 'Axis (OS)' },
      { dbCol: 'add_os', displayName: 'Add (OS)' },
      { dbCol: 'va_os', displayName: 'VA (OS)' },
      { dbCol: 'prism_bases_os', displayName: 'Prism Bases (OS)' }
    ];

    const valueMap = { sph_od, cyl_od, axis_od, add_od, va_od, prism_bases_od, sph_os, cyl_os, axis_os, add_os, va_os, prism_bases_os };

    for (const field of prescriptionFields) {
      const newVal = valueMap[field.dbCol as keyof typeof valueMap];
      if (newVal !== undefined && newVal !== currentOrder[field.dbCol as keyof typeof currentOrder]) {
        await dbRun(app, 'order_history', {
          order_id: orderId,
          user_id: req.userId,
          field_name: field.displayName,
          old_value: currentOrder[field.dbCol as keyof typeof currentOrder]?.toString() || null,
          new_value: newVal?.toString() || null
        });
      }
    }

    const updatedOrders = await dbAll(app, `SELECT * FROM orders WHERE id = ${orderId}`);
    res.json(updatedOrders[0]);
  } catch (error: any) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete order
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const app = req.zcatalystApp;
    const orderId = req.params.id;

    const orders = await dbAll(app, `SELECT * FROM orders WHERE id = ${orderId}`);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await dbDelete(app, 'orders', parseInt(orderId));
    res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
router.post('/:id/comments', async (req: AuthRequest, res) => {
  try {
    const app = req.zcatalystApp;
    const { comment } = req.body;
    const orderId = req.params.id;

    if (!comment) {
      return res.status(400).json({ error: 'Comment is required' });
    }

    const orders = await dbAll(app, `SELECT * FROM orders WHERE id = ${orderId}`);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const result = await dbRun(app, 'comments', {
      order_id: orderId,
      user_id: req.userId,
      comment
    });

    const comments = await dbAll(app, `
      SELECT c.*, u.name as user_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = ${result.lastID}
    `);

    res.status(201).json(comments[0]);
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

