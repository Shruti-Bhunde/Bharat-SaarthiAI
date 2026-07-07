import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/api';
import { Send, Languages, Sparkles, User, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getChatContent } from '../constants/chatLanguages';

const createSessionId = () => 'session_' + Math.random().toString(36).substring(2, 15);

const createGreetingMessage = (language) => ({
  sender: 'ai',
  text: getChatContent(language).greeting,
  timestamp: new Date(),
});

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const chatContent = getChatContent(language);

  const resetConversation = useCallback((selectedLanguage, newSessionId) => {
    setSessionId(newSessionId);
    sessionStorage.setItem('bs_chat_session', newSessionId);
    sessionStorage.setItem('bs_chat_language', selectedLanguage);
    setMessages([createGreetingMessage(selectedLanguage)]);
    setInput('');
  }, []);

  useEffect(() => {
    let existingSession = sessionStorage.getItem('bs_chat_session');
    const savedLanguage = sessionStorage.getItem('bs_chat_language') || 'English';

    if (!existingSession) {
      existingSession = createSessionId();
      sessionStorage.setItem('bs_chat_session', existingSession);
    }

    setLanguage(savedLanguage);
    setSessionId(existingSession);
    setMessages([createGreetingMessage(savedLanguage)]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLanguageChange = (nextLanguage) => {
    if (nextLanguage === language) return;

    const newSessionId = createSessionId();
    setLanguage(nextLanguage);
    resetConversation(nextLanguage, newSessionId);
  };

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    if (!textToSend) setInput('');

    const userMsg = { sender: 'user', text: queryText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // #region agent log
    fetch('http://127.0.0.1:7528/ingest/ca0691f7-a646-4671-aeb4-d1e35bdcabc5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '65a641' },
      body: JSON.stringify({
        sessionId: '65a641',
        location: 'AIChat.jsx:handleSend',
        message: 'Sending chat message',
        data: { language, messageLen: queryText.length, sessionIdPrefix: sessionId.slice(0, 12) },
        timestamp: Date.now(),
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion

    try {
      const result = await apiService.sendMessage(queryText, sessionId, language);
      const aiMsg = { sender: 'ai', text: result.response, timestamp: new Date() };

      // #region agent log
      fetch('http://127.0.0.1:7528/ingest/ca0691f7-a646-4671-aeb4-d1e35bdcabc5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '65a641' },
        body: JSON.stringify({
          sessionId: '65a641',
          location: 'AIChat.jsx:handleSend',
          message: 'Chat response received',
          data: {
            language,
            responseLen: result.response?.length || 0,
            looksLikeError: /AI system error|सीमा|मर्यादा|usage limits/i.test(result.response || ''),
          },
          timestamp: Date.now(),
          hypothesisId: 'D',
        }),
      }).catch(() => {});
      // #endregion

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg = {
        sender: 'ai',
        text: chatContent.connectionError,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    resetConversation(language, createSessionId());
  };

  const parseMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return <h4 key={index} className="text-md font-bold text-gov-blue-900 mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={index} className="text-lg font-bold text-gov-blue-900 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={index} className="text-xl font-extrabold text-gov-blue-900 mt-5 mb-3">{line.replace('# ', '')}</h2>;
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="ml-5 list-disc text-slate-700 my-1">
            {formatBoldText(line.substring(2))}
          </li>
        );
      }

      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={index} className="ml-5 my-1 flex items-start gap-2">
            <span className="font-bold text-gov-blue-700">{numMatch[1]}.</span>
            <span className="text-slate-700">{formatBoldText(numMatch[2])}</span>
          </div>
        );
      }

      return (
        <p key={index} className="text-slate-700 my-1.5 leading-relaxed">
          {formatBoldText(line)}
        </p>
      );
    });
  };

  const formatBoldText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-gov-blue-800">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-gov-saffron-500 via-white to-gov-green-600"></div>

      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-500 hover:text-gov-blue-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇮🇳</span>
            <div>
              <h1 className="text-lg font-bold text-gov-blue-900 leading-tight">Bharat Saarthi AI</h1>
              <p className="text-xs text-slate-500">Personal Civic Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700">
            <Languages className="h-4 w-4 text-gov-blue-700" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-slate-700"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
            </select>
          </div>

          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-gov-saffron-600 border border-slate-200 hover:border-gov-saffron-500 bg-white px-2.5 py-1.5 rounded-lg transition-all"
            title="Start New Session"
          >
            <RefreshCw className="h-3 w-3" />
            Reset Chat
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex items-center justify-center h-9 w-9 shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-gov-blue-700 text-white'
                    : 'bg-gov-saffron-50 text-gov-saffron-600 border border-gov-saffron-200'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              </div>

              <div
                className={`p-4 rounded-2xl shadow-sm text-sm border ${
                  msg.sender === 'user'
                    ? 'bg-gov-blue-50 text-slate-800 border-gov-blue-100 rounded-tr-none'
                    : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                ) : (
                  <div>{parseMarkdown(msg.text)}</div>
                )}
                <span className="text-[10px] text-slate-400 block mt-2 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="p-2 rounded-xl bg-gov-saffron-50 text-gov-saffron-600 border border-gov-saffron-200 flex items-center justify-center h-9 w-9 animate-spin">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div className="p-4 rounded-2xl shadow-sm text-sm border bg-white border-slate-100 rounded-tl-none flex items-center gap-2">
                <span className="text-slate-500">{chatContent.loading}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && !loading && (
          <div className="mb-6">
            <p className="text-xs text-slate-500 font-semibold mb-3">{chatContent.suggestionsTitle}</p>
            <div className="flex flex-wrap gap-2">
              {chatContent.suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.text)}
                  className="bg-white border border-slate-200 hover:border-gov-blue-600 text-gov-blue-900 text-xs px-3 py-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:bg-gov-blue-50/20 text-left"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={chatContent.placeholder}
            className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-800 outline-none placeholder-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-gov-blue-700 hover:bg-gov-blue-800 disabled:bg-slate-200 text-white rounded-xl transition-colors shadow-sm disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
