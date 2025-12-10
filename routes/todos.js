const express = require('express');
const router = express.Router();
const Todo = require('../models/tareas'); // el modelo existente se guarda en tareas.js y exporta 'Todo'
const auth = require('../middleware/auth');

// Nota: el frontend que proporcionaste usa la propiedad `text` para la tarea.
// Este router adapta esa forma a la estructura del modelo (title/description) para mantener compatibilidad.

// Obtener todas las tareas del usuario
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
    // mapear title -> text para el frontend
    const mapped = todos.map(t => ({
      _id: t._id,
      text: t.title,
      description: t.description,
      completed: t.completed,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));
    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// Crear nueva tarea (acepta { text })
router.post('/', auth, async (req, res) => {
  try {
    const { text, description } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'El texto de la tarea es requerido' });

    const todo = new Todo({
      title: text.trim(),
      description: description || '',
      userId: req.userId
    });
    await todo.save();

    res.status(201).json({
      _id: todo._id,
      text: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// Actualizar tarea (acepta { text?, completed? })
router.put('/:id', auth, async (req, res) => {
  try {
    const update = {};
    if (req.body.text !== undefined) update.title = req.body.text;
    if (req.body.description !== undefined) update.description = req.body.description;
    if (req.body.completed !== undefined) update.completed = req.body.completed;

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true }
    );

    if (!todo) return res.status(404).json({ error: 'Tarea no encontrada' });

    res.json({
      _id: todo._id,
      text: todo.title,
      description: todo.description,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// Eliminar tarea
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!todo) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

module.exports = router;
