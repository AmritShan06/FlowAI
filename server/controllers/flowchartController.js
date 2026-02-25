import pool from '../config/db.js';

export const saveFlowchart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id, title, flowchart } = req.body || {};

    if (!title || !flowchart) {
      res.status(400);
      return res.json({ message: 'Title and flowchart are required' });
    }

    const flowchartJson = JSON.stringify(flowchart);

    if (id) {
      const [result] = await pool.query(
        'UPDATE flowcharts SET title = ?, flowchart_json = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
        [title, flowchartJson, id, userId]
      );

      if (result.affectedRows === 0) {
        res.status(404);
        return res.json({ message: 'Flowchart not found or not owned by user' });
      }

      return res.json({ id, title, flowchart });
    }

    const [insert] = await pool.query(
      'INSERT INTO flowcharts (user_id, title, flowchart_json, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [userId, title, flowchartJson]
    );

    res.status(201).json({
      id: insert.insertId,
      title,
      flowchart
    });
  } catch (err) {
    next(err);
  }
};

export const getFlowchart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT * FROM flowcharts WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      res.status(404);
      return res.json({ message: 'Flowchart not found' });
    }

    const row = rows[0];
    const flowchart = JSON.parse(row.flowchart_json || '{}');

    res.json({
      id: row.id,
      title: row.title,
      flowchart,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  } catch (err) {
    next(err);
  }
};
