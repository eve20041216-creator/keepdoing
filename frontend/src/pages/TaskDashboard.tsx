import React, { useState } from 'react';
import { CheckCircle2, Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';
import { Task, Plan } from '../types';

export const TaskDashboard: React.FC = () => {
  const { tasks, plans, addTask, completeTask, deleteTask, refreshTasks } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedPlan) return;

    try {
      const task = await api.createTask({
        plan_id: selectedPlan,
        title: newTaskTitle,
        duration_minutes: newTaskDuration,
      });
      setNewTaskTitle('');
      setNewTaskDuration(30);
      setShowForm(false);
      refreshTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.completeTask(taskId);
      refreshTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      refreshTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const todaysTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold">📋 Today's Tasks</h1>
        <p className="text-blue-100 mt-2">Complete {todaysTasks.length} tasks to finish your day</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{todaysTasks.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{completionRate}%</p>
        </div>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Plan
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Choose a plan...</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Task Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Add New Task
        </button>
      )}

      {/* Pending Tasks */}
      {todaysTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Pending Tasks</h2>
          {todaysTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="text-gray-400 hover:text-green-500 transition-colors flex-shrink-0"
              >
                <CheckCircle2 size={24} />
              </button>
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 dark:text-white">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {task.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {task.duration_minutes}m
                    </span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Completed Tasks</h2>
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow flex items-center gap-4 opacity-60"
            >
              <CheckCircle2 size={24} className="text-green-500" />
              <div className="flex-grow">
                <h3 className="font-semibold text-gray-600 dark:text-gray-300 line-through">
                  {task.title}
                </h3>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && !showForm && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-8 rounded-lg text-center">
          <p className="text-blue-800 dark:text-blue-200 text-lg">No tasks yet. Create your first task to get started! 🚀</p>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
