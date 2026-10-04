import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.get('/user/notifications');
      if (response.data.success) {
        const notifData = response.data.data;
        setNotifications(notifData?.notifications || (Array.isArray(notifData) ? notifData : []));
      }
    } catch (err) {
      console.error('Failed to load user notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const api = (await import('../../services/api.ts')).default;
      const response = await api.patch(`/user/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h3 className="font-outfit uppercase tracking-widest text-xs font-bold text-accent">
          Notifications
        </h3>
        <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-wider font-semibold font-outfit mt-0.5">
          View critical alerts, shipment updates, and promotional items
        </p>
      </div>

      {loading ? (
        <div className="h-24 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-xs text-text-secondary uppercase tracking-widest font-semibold font-outfit flex flex-col items-center">
          <BellOff className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mb-3 stroke-[1.5]" />
          <span>No system notifications at this time.</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-dark-border text-xs leading-relaxed font-semibold font-outfit">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`py-4 flex justify-between items-start gap-4 ${
                notif.isRead ? 'opacity-65' : ''
              }`}
            >
              <div className="flex space-x-3 items-start">
                <div className={`p-1.5 rounded-full ${notif.isRead ? 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800' : 'bg-accent/15 text-accent'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`font-bold uppercase ${notif.isRead ? 'text-text-primary dark:text-neutral-300' : 'text-accent'}`}>{notif.title}</h4>
                  <p className="text-[10px] text-text-secondary dark:text-neutral-400 mt-0.5">{notif.message}</p>
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-600 block mt-1 font-normal font-inter">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif._id)}
                  className="p-1 border border-gray-200 dark:border-dark-border hover:border-accent text-neutral-400 hover:text-accent transition-colors rounded-full"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
