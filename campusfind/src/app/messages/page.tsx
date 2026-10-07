'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Message, User } from '@/types';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  Shield,
  Building,
  User as UserIcon,
  MapPin,
  Clock,
  Lock,
  CheckCheck
} from 'lucide-react';

interface ConversationThread {
  contact_id: number;
  contact_name: string;
  contact_role: string;
  contact_department: string;
  contact_image?: string;
  item_id?: number;
  item_title?: string;
  last_message: string;
  last_timestamp: string;
  unread_count: number;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const targetUserId = searchParams.get('user_id');
  const targetItemId = searchParams.get('item_id');

  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(
    targetUserId ? Number(targetUserId) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchThreadsAndMessages = async () => {
    if (!user) return;
    try {
      let url = '/api/messages';
      if (activeContactId) {
        url += `?user_id=${activeContactId}`;
        if (targetItemId) url += `&item_id=${targetItemId}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setThreads(data.threads || []);
      setMessages(data.messages || []);

      // If no active contact selected and threads exist, select first thread
      if (!activeContactId && data.threads?.length > 0) {
        setActiveContactId(data.threads[0].contact_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreadsAndMessages();
    const interval = setInterval(fetchThreadsAndMessages, 10000);
    return () => clearInterval(interval);
  }, [user, activeContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeContactId || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: activeContactId,
          item_id: targetItemId ? Number(targetItemId) : undefined,
          message: messageText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages(prev => [...prev, data.message]);
        setMessageText('');
        fetchThreadsAndMessages();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-heading">Login to Access Campus Messages</h2>
        <p className="text-xs text-slate-400">
          In-app messaging protects your privacy. You must be authenticated to chat with item finders or reporters.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
        >
          Login with Campus Credentials
        </Link>
      </div>
    );
  }

  const activeThread = threads.find(t => t.contact_id === activeContactId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Safe Handover Advice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Encrypted Campus Messaging</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-heading">
            Safe Communication
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Coordinate item recovery without sharing private mobile numbers, personal email, or living addresses.
          </p>
        </div>

        {/* Safe Handover Pill */}
        <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-700/40 text-xs text-indigo-200 max-w-md">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
            <Building className="w-4 h-4 shrink-0" />
            <span>Campus-Approved Handover Spots:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Campus Security Post (Main Gatehouse) or Central Library Circulation Desk.
          </p>
        </div>
      </div>

      {/* Main Two-Panel Chat Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[620px] rounded-3xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
        {/* Left Column: Conversation Threads (4 cols) */}
        <aside className="md:col-span-4 border-r border-slate-800/80 bg-slate-950/60 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <span className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Conversation Threads ({threads.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {threads.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-slate-500">
                  When you message a finder or receive a claim enquiry, threads will appear here.
                </p>
              </div>
            ) : (
              threads.map(thread => {
                const isSelected = activeContactId === thread.contact_id;
                return (
                  <button
                    key={thread.contact_id}
                    onClick={() => setActiveContactId(thread.contact_id)}
                    className={`w-full p-4 text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-l-4 border-cyan-400'
                        : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <img
                      src={thread.contact_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={thread.contact_name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate">
                          {thread.contact_name}
                        </span>
                        {thread.unread_count > 0 && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate capitalize">
                        {thread.contact_role} • {thread.contact_department}
                      </span>
                      {thread.item_title && (
                        <span className="text-[10px] text-indigo-300 font-medium block truncate">
                          Re: {thread.item_title}
                        </span>
                      )}
                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {thread.last_message}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Chat History & Send (8 cols) */}
        <main className="md:col-span-8 flex flex-col h-full bg-slate-900/40 overflow-hidden">
          {activeContactId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {activeThread?.contact_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white">
                      {activeThread?.contact_name || 'Campus Member'}
                    </h3>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {activeThread?.contact_role || 'Student'} • Verified College ID
                    </span>
                  </div>
                </div>

                {activeThread?.item_id && (
                  <Link
                    href={`/items/${activeThread.item_id}`}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"
                  >
                    View Referenced Item
                  </Link>
                )}
              </div>

              {/* Chat Messages scroll area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs space-y-1">
                    <p>No messages in this conversation yet.</p>
                    <p className="text-[11px]">Send a greeting to coordinate your verification or handover!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                              : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send message form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type a safe message... (e.g. 'Can we meet at the Library front desk at 2 PM?')"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-600" />
              <h3 className="text-base font-bold text-white font-heading">Select a Conversation</h3>
              <p className="text-xs max-w-sm">
                Choose a thread from the list on the left or click &quot;Message Finder&quot; on any item details page to start a chat.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
