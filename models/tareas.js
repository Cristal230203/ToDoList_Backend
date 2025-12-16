const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la tarea es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID de usuario es requerido'],
    index: true // Índice para búsquedas más rápidas
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índice compuesto para búsquedas eficientes por usuario y fecha
todoSchema.index({ userId: 1, createdAt: -1 });

// Método para marcar como completada
todoSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  return this.save();
};

// Método estático para obtener tareas de un usuario
todoSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Método estático para contar tareas pendientes
todoSchema.statics.countPending = function(userId) {
  return this.countDocuments({ userId, completed: false });
};

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;