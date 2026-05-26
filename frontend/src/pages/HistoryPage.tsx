import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Edit2, Save, X } from 'lucide-react';
import * as api from '../services/api';

interface DailyData {
  date: string;
  summary: string;
  mood?: string;
  energy?: number;
  tasksCompleted?: number;
  pomodoroSessions?: number;
}

export const HistoryPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState('😐');
  const [editEnergy, setEditEnergy] = useState(5);

  const moods = ['😞', '😕', '😐', '🙂', '😄'];

  useEffect(() => {
    loadDailyData(selectedDate);
  }, [selectedDate]);

  const loadDailyData = async (date: string) => {
    try {
      const data = await api.getDailySummary(date);
      if (data) {
        setDailyData(data);
        setEditContent(data.summary || '');
        setEditMood(data.mood || '😐');
        setEditEnergy(data.energy || 5);
      } else {
        setDailyData(null);
        setEditContent('');
        setEditMood('😐');
        setEditEnergy(5);
      }
    } catch (error) {
      console.error('加载日报出错:', error);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateDailySummary(selectedDate, {
        content: editContent,
        mood: editMood,
        energy_level: editEnergy,
      });
      loadDailyData(selectedDate);
      setIsEditing(false);
    } catch (error) {
      console.error('保存日报出错:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 空白日期
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // 月份中的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`p-2 text-center rounded-lg transition-colors ${
            isSelected
              ? 'bg-blue-500 text-white font-bold'
              : isToday
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthYear = currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold">📊 历史统计</h1>
        <p className="text-purple-100 mt-2">查看您的历史记录和日报总结</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 日历 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{monthYear}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 dark:text-gray-400 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
        </div>

        {/* 日报内容 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 日期信息 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {new Date(selectedDate).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {/* 心情 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    心情
                  </label>
                  <div className="flex gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setEditMood(mood)}
                        className={`text-3xl p-2 rounded-lg transition-colors ${
                          editMood === mood ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 能量等级 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    能量等级: {editEnergy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editEnergy}
                    onChange={(e) => setEditEnergy(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* 日报内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    今日总结
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="记录今天的收获和感受..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* 保存/取消按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={18} /> 保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadDailyData(selectedDate);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={18} /> 取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {dailyData ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">心情</p>
                      <p className="text-4xl mt-2">{dailyData.mood || '😐'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">能量等级</p>
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-full rounded ${
                              i < (dailyData.energy || 5)
                                ? 'bg-yellow-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">今日总结</p>
                      <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {dailyData.summary || '(暂无记录)'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">这一天暂无记录</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      添加日报
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
