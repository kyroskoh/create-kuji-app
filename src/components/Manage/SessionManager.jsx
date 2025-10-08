import { useState, useEffect } from 'react';
import useLocalStorageDAO from '../../hooks/useLocalStorageDAO';
import { syncUserData } from '../../services/syncService';
import { useAuth } from '../../utils/AuthContext';
import { hasEventManagement } from '../../utils/subscriptionPlans';

export default function SessionManager() {
  const { user } = useAuth();
  const { getSettings, setSettings, getEventSessions, createEventSession, endEventSession } = useLocalStorageDAO();
  const [settings, setLocalSettings] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState('');

  // Load settings and active event
  useEffect(() => {
    let mounted = true;
    (async () => {
      const currentSettings = await getSettings();
      const sessions = await getEventSessions();
      
      if (mounted) {
        setLocalSettings(currentSettings);
        
        // Find active event
        if (currentSettings.activeEventId) {
          const active = sessions.find(s => s.eventId === currentSettings.activeEventId);
          setActiveEvent(active);
        }
        
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [getSettings, getEventSessions]);

  // Update elapsed time every second
  useEffect(() => {
    if (!activeEvent || settings?.sessionStatus !== 'ACTIVE') return;

    const interval = setInterval(() => {
      const start = new Date(activeEvent.startTime);
      const now = new Date();
      const diff = now - start;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEvent, settings?.sessionStatus]);

  const handleStartEvent = async () => {
    const name = eventName.trim() || `Event ${settings.nextSessionNumber}`;
    
    // Create new event session
    const newEvent = await createEventSession(name);
    
    // Update settings to ACTIVE
    const updatedSettings = {
      ...settings,
      sessionStatus: 'ACTIVE',
      activeEventId: newEvent.eventId,
      activeEventStartTime: newEvent.startTime,
      activeEventName: newEvent.eventName
    };
    
    await setSettings(updatedSettings);
    setLocalSettings(updatedSettings);
    setActiveEvent(newEvent);
    setEventName('');

    // Sync to backend
    if (user?.username) {
      setTimeout(async () => {
        try {
          await syncUserData(user.username, 'settings', updatedSettings);
        } catch (error) {
          console.warn('Failed to sync settings:', error);
        }
      }, 500);
    }
  };

  const handlePauseEvent = async () => {
    const updatedSettings = {
      ...settings,
      sessionStatus: 'PAUSED'
    };
    
    await setSettings(updatedSettings);
    setLocalSettings(updatedSettings);

    if (user?.username) {
      setTimeout(async () => {
        try {
          await syncUserData(user.username, 'settings', updatedSettings);
        } catch (error) {
          console.warn('Failed to sync settings:', error);
        }
      }, 500);
    }
  };

  const handleResumeEvent = async () => {
    const updatedSettings = {
      ...settings,
      sessionStatus: 'ACTIVE'
    };
    
    await setSettings(updatedSettings);
    setLocalSettings(updatedSettings);

    if (user?.username) {
      setTimeout(async () => {
        try {
          await syncUserData(user.username, 'settings', updatedSettings);
        } catch (error) {
          console.warn('Failed to sync settings:', error);
        }
      }, 500);
    }
  };

  const handleEndEvent = async () => {
    if (!window.confirm('End current event session? This will prevent further draws until a new event is started.')) {
      return;
    }

    // End the event session
    await endEventSession(activeEvent.eventId);
    
    // Update settings to INACTIVE
    const updatedSettings = {
      ...settings,
      sessionStatus: 'INACTIVE',
      activeEventId: null,
      activeEventStartTime: null,
      activeEventName: null,
      nextSessionNumber: settings.nextSessionNumber + 1
    };
    
    await setSettings(updatedSettings);
    setLocalSettings(updatedSettings);
    setActiveEvent(null);

    if (user?.username) {
      setTimeout(async () => {
        try {
          await syncUserData(user.username, 'settings', updatedSettings);
        } catch (error) {
          console.warn('Failed to sync settings:', error);
        }
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="animate-pulse text-slate-400">Loading session manager...</div>
      </div>
    );
  }

  // Check if user has access to event management
  const hasAccess = hasEventManagement(settings?.subscriptionPlan || 'free');
  
  if (!hasAccess) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Event Session Manager</h3>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/30">
            Advanced+
          </span>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-1">Event Session Management</h4>
              <p className="text-sm text-slate-300 mb-3">
                Track multiple kuji events with start/end times, revenue per event, and automatic draw counting. Upgrade to Advanced or Pro to unlock this feature.
              </p>
              <ul className="text-xs text-slate-400 space-y-1 mb-3">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Named event sessions (e.g., "Summer Festival 2025")</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Revenue tracking per event</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Pause/Resume event controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Event history and analytics</span>
                </li>
              </ul>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = settings?.sessionStatus || 'INACTIVE';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Event Session Manager</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-slate-700/50 text-slate-400 border border-slate-600/30'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {status === 'INACTIVE' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Start a new event session to begin accepting draws. Each event tracks draws, revenue, and timing.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder={`Event ${settings?.nextSessionNumber || 1}`}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button
              onClick={handleStartEvent}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start Event
            </button>
          </div>
        </div>
      )}

      {status === 'ACTIVE' && activeEvent && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Event Name</div>
              <div className="text-lg font-semibold text-white">{activeEvent.eventName}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xs text-slate-400 mb-1">Elapsed Time</div>
              <div className="text-lg font-semibold text-green-400 font-mono">{elapsedTime}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePauseEvent}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
            >
              Pause Event
            </button>
            <button
              onClick={handleEndEvent}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              End Event
            </button>
          </div>
        </div>
      )}

      {status === 'PAUSED' && activeEvent && (
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-yellow-400 font-semibold">Event Paused</span>
            </div>
            <p className="text-sm text-slate-300">
              Event "{activeEvent.eventName}" is paused. Resume to continue accepting draws.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleResumeEvent}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              Resume Event
            </button>
            <button
              onClick={handleEndEvent}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              End Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
