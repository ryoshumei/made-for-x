'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function BreakTimer() {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'break' | 'longBreak'>('break');
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const modes = useMemo(
    () => ({
      break: { duration: 5 * 60, label: 'Short Break', color: 'from-green-500 to-emerald-600' },
      longBreak: { duration: 15 * 60, label: 'Long Break', color: 'from-purple-500 to-violet-600' },
    }),
    []
  );

  useEffect(() => {
    if (isActive && timeLeft > 0 && startTimestamp) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
        const remaining = modes[mode].duration - elapsedSeconds;

        if (remaining <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          setStartTimestamp(null);
        } else {
          setTimeLeft(remaining);
        }
      }, 100); // Update more frequently for accuracy
    } else if (timeLeft === 0) {
      setIsActive(false);
      setStartTimestamp(null);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, mode, startTimestamp, modes]);

  const toggleTimer = () => {
    if (!isActive) {
      // Starting or resuming: calculate start timestamp based on remaining time
      const elapsedSeconds = modes[mode].duration - timeLeft;
      setStartTimestamp(Date.now() - elapsedSeconds * 1000);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].duration);
    setStartTimestamp(null);
  };

  const switchMode = (newMode: 'break' | 'longBreak') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setStartTimestamp(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Break Timer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Take a break, recharge yourself
          </p>
        </div>

        {/* Mode Selector */}
        <div className="p-1 backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-xl rounded-lg">
          <div className="flex rounded-lg overflow-hidden">
            {Object.entries(modes).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => switchMode(key as 'break' | 'longBreak')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ${
                  mode === key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border-white/20 shadow-2xl rounded-lg">
          {/* Progress Ring Background */}
          <div className="absolute inset-0">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${modes[mode].color} opacity-10 transition-all duration-1000`}
              style={{
                clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,
              }}
            />
          </div>

          <div className="relative p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl font-mono font-bold text-slate-900 dark:text-white tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <div className="text-lg font-medium text-slate-600 dark:text-slate-400">
                {modes[mode].label}
              </div>

              {/* Progress Ring */}
              <div className="flex justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200 dark:text-slate-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className="text-green-500" stopColor="currentColor" />
                        <stop offset="100%" className="text-emerald-600" stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center ${
              isActive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
            }`}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
