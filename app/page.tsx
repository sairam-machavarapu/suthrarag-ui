'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import ProfilePanel from '@/components/ProfilePanel';
import { ChatMessage, TokenUsage, Conversation } from '@/types/rag';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    model: 'gpt-4o-mini',
  });

  // Load conversations from local storage
  useEffect(() => {
    const saved = localStorage.getItem('suthra_chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (e) {
        console.error('Failed to parse conversations', e);
      }
    }
  }, []);

  // Save conversations to local storage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('suthra_chats', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Update messages when activeId changes
  useEffect(() => {
    if (activeId) {
      const conv = conversations.find(c => c.id === activeId);
      if (conv) {
        setMessages(conv.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeId, conversations]);

  // Update conversation when messages change
  useEffect(() => {
    if (messages.length > 0 && activeId) {
      setConversations(prev => prev.map(c => {
        if (c.id === activeId) {
          return {
            ...c,
            messages,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      }));
    } else if (messages.length > 0 && !activeId) {
      // New conversation
      const newId = Date.now().toString();
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg ? (firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')) : 'New Chat';

      const newConv: Conversation = {
        id: newId,
        title,
        messages,
        updatedAt: new Date().toISOString(),
      };

      setConversations(prev => [newConv, ...prev]);
      setActiveId(newId);
    }
  }, [messages, activeId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) return null;

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    setActiveId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) {
      handleNewChat();
    }
  };

  const handleTokenUsageUpdate = (usage: TokenUsage) => {
    setStats(prev => ({
      totalRequests: prev.totalRequests + 1,
      promptTokens: prev.promptTokens + usage.prompt_tokens,
      completionTokens: prev.completionTokens + usage.completion_tokens,
      totalTokens: prev.totalTokens + usage.total_tokens,
      model: usage.model,
    }));
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      {session.user && (
        <Sidebar
          onProfileClick={handleProfileClick}
          onNewChat={handleNewChat}
          user={session.user as any}
          conversations={conversations}
          activeId={activeId || ''}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}

      {/* Main Chat Interface */}
      <ChatWindow
        onTokenUsageUpdate={handleTokenUsageUpdate}
        messages={messages}
        setMessages={setMessages}
      />

      {/* User Profile Panel Overlay */}
      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        stats={stats}
      />

      {/* Overlay for clicking out of profile panel */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={handleCloseProfile}
        />
      )}
    </div>
  );
}
