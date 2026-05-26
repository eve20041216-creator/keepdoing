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
      console.error('加载统计数据出错:', error);
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
      {/* 标题 */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold">🍅 番茄工作法</h1>
        <p className="text-red-100 mt-2">专注工作，定期休息</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 计时器 */}
        <div className="lg:col-span-1">
          <PomodoroTimer />
        </div>

        {/* 设置 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 自定义时长 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">自定义时长</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  专注时间（分钟）
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
                  短休息（分钟）
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
                  长休息（分钟）
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
              保存设置
            </button>
          </div>

          {/* 统计信息 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">今日统计</h2>
            {dailyStats ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">完成次数</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {dailyStats.completed_sessions || 0}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">总时长</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((dailyStats.total_minutes || 0) / 60)}小时
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">专注时间</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {dailyStats.total_minutes || 0}分
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
