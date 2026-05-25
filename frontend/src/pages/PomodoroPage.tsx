import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PomodoroTimer } from '../components/PomodoroTimer';
import * as api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const PomodoroPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [customFocus, setCustomFocus] = useState(settings?.focus_duration || 25);
  const [customShortBreak, setCustomShortBreak] = useState(settings?.short_break_duration || 5);
  const [customLongBreak, setCustomLongBreak] = useState(settings?.long_break_duration || 15);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const [daily, weekly] = await Promise.all([
        api.getDailyPomodoroStats(today).catch(() => ({ data: null })),
        api.getWeeklyPomodoroStats(today).catch(() => ({ data: null })),
      ]);
      setDailyStats(daily.data);
      setWeeklyStats(weekly.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSaveSettings = async () => {
    await updateSettings({
      focus_duration: customFocus,
      short_break_duration: customShortBreak,
      long_break_duration: customLongBreak,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold">🍅 Pomodoro Timer</h1>
        <p className="text-red-100 mt-2">Stay focused and take regular breaks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-1">
          <PomodoroTimer />
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customize Timer */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Customize Durations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Focus Duration (min)
                </label>
                <input
                  type="number"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Break (min)
                </label>
                <input
                  type="number"
                  value={customShortBreak}
                  onChange={(e) => setCustomShortBreak(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Long Break (min)
                </label>
                <input
                  type="number"
                  value={customLongBreak}
                  onChange={(e) => setCustomLongBreak(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={handleSaveSettings}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Today's Statistics</h2>
            {dailyStats ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {dailyStats.completed_sessions || 0}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((dailyStats.total_minutes || 0) / 60)}h
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Focus Time</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {dailyStats.total_minutes || 0}m
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
