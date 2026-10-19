import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api.ts';

interface Message {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/admin/messages');
      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (err: any) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data } = await api.patch(`/admin/messages/${id}`, { status });
      if (data.success) {
        toast.success(`Message marked as ${status}`);
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-text-secondary">Loading messages...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-gray-100 dark:border-dark-border pb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-outfit uppercase tracking-wider text-text-primary dark:text-white">
          Customer Messages
        </h1>
        <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
          Enquiries from the Contact Us form
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface p-8 text-center text-gray-500 rounded-xs border border-gray-100 dark:border-dark-border">
            No messages found.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`p-4 sm:p-6 border rounded-sm bg-white dark:bg-dark-surface shadow-xs ${msg.status === 'unread' ? 'border-l-4 border-l-accent border-gray-200 dark:border-gray-800' : 'border-gray-100 dark:border-gray-800'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text-primary dark:text-white">{msg.subject}</h3>
                  <div className="text-xs text-text-secondary mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>From:</strong> {msg.name}</span>
                    <span><strong>Email:</strong> <a href={`mailto:${msg.email}`} className="text-accent hover:underline">{msg.email}</a></span>
                    {msg.mobile && <span><strong>Mobile:</strong> {msg.mobile}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400 font-mono">{new Date(msg.createdAt).toLocaleString()}</span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {msg.status === 'unread' && (
                      <button onClick={() => updateStatus(msg._id, 'read')} className="text-[11px] bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold">
                        Mark Read
                      </button>
                    )}
                    {msg.status !== 'replied' && (
                      <button onClick={() => updateStatus(msg._id, 'replied')} className="text-[11px] bg-green-100 text-green-700 px-2.5 py-1 rounded hover:bg-green-200 font-semibold">
                        Mark Replied
                      </button>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      msg.status === 'unread' ? 'bg-red-100 text-red-600' :
                      msg.status === 'read' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-dark-bg p-3.5 sm:p-4 rounded text-xs sm:text-sm text-text-primary dark:text-gray-300 whitespace-pre-wrap border border-gray-100 dark:border-gray-800">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
