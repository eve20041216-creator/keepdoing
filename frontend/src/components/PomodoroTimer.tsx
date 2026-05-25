import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

export const PomodoroTimer: React.FC = () => {
  const { settings } = useApp();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    const duration =
      sessionType === 'focus'
        ? settings?.focus_duration || 25
        : sessionType === 'short_break'
        ? settings?.short_break_duration || 5
        : settings?.long_break_duration || 15;

    setTotalSeconds(duration * 60);
    setTimeLeft(duration * 60);
  }, [sessionType, settings]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          playSound();
          if (sessionType === 'focus') {
            saveSession();
            const nextSession =
              sessionsCompleted % 4 === 3 ? ('long_break' as const) : ('short_break' as const);
            setSessionType(nextSession);
            if (nextSession === 'long_break') {
              setSessionsCompleted(sessionsCompleted + 1);
            }
          } else {
            setSessionType('focus');
            if (sessionsCompleted % 4 !== 3) {
              setSessionsCompleted(sessionsCompleted + 1);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, sessionsCompleted, settings]);

  const saveSession = async () => {
    try {
      const duration = settings?.focus_duration || 25;
      await api.createPomodoroSession();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const playSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const getSessionColor = () => {
    switch (sessionType) {
      case 'focus':
        return 'from-red-500 to-pink-600';
      case 'short_break':
        return 'from-green-500 to-emerald-600';
      case 'long_break':
        return 'from-blue-500 to-cyan-600';
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'focus':
        return 'Focus Time';
      case 'short_break':
        return 'Short Break';
      case 'long_break':
        return 'Long Break';
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getSessionColor()} text-white p-8 rounded-lg shadow-lg`}>
      <div className="text-center">
        {/* Session Label */}
        <p className="text-lg font-medium opacity-90 mb-4">{getSessionLabel()}</p>

        {/* Timer Display */}
        <div className="text-7xl font-bold font-mono mb-6">{formatTime(timeLeft)}</div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-semibold">{Math.round(progressPercent)}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all transform hover:scale-110"
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              const duration =
                sessionType === 'focus'
                  ? settings?.focus_duration || 25
                  : sessionType === 'short_break'
                  ? settings?.short_break_duration || 5
                  : settings?.long_break_duration || 15;
              setTimeLeft(duration * 60);
            }}
            className="p-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all transform hover:scale-110"
          >
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Sessions Count */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <p className="text-sm opacity-90">Sessions Completed: {sessionsCompleted}</p>
        </div>
      </div>
    </div>
  );
};
