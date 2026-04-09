import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/hooks";
import { ROLES } from "../../../constants/roles.jsx";
import { getChatbotHistory, sendChatbotMessage } from "../../../services/chatbotService";

const QUICK_ACTIONS = {
  Employer: {
    "Post a new job": "/employer/jobs/new",
    "View my jobs": "/employer/jobs",
    "Review applicants": "/employer/applicants",
    "Open company profile": "/employer/profile",
    "Open account": "/employer/account",
    "Open dashboard": "/employer/dashboard",
  },
  JobSeeker: {
    "Find jobs": "/jobseeker/jobs",
    "Update profile": "/jobseeker/profile",
    "Upload resume": "/jobseeker/profile?edit=1",
    "View my applications": "/jobseeker/applications",
    "Open profile": "/jobseeker/profile",
    "Open dashboard": "/jobseeker/dashboard",
  },
};

const BOT_AVATAR = {
  Employer: "ER",
  JobSeeker: "JS",
};

const BOT_ACCENT = {
  Employer: "from-blue-600 to-cyan-500",
  JobSeeker: "from-green-600 to-teal-500",
};

const getWelcomeMessage = (role, fullName) => {
  const firstName = fullName?.split(" ")?.[0] || "there";

  if (role === ROLES.EMPLOYER) {
    return `Hi ${firstName}, I can help you post jobs, review applicants, and manage your company profile.`;
  }

  return `Hi ${firstName}, I can help you search jobs, improve your profile, and track your applications.`;
};

const isGreetingMessage = (message) => {
  const normalized = message.trim().toLowerCase();
  return ["hi", "hii", "hiii", "hello", "hey", "helo", "hola"].includes(normalized);
};

const buildLocalFallbackResponse = (role, currentPath, quickActionMap, message) => {
  if (isGreetingMessage(message)) {
    return {
      text:
        role === ROLES.EMPLOYER
          ? "Hi, I can help you with posting jobs, reviewing applicants, and managing your company profile."
          : "Hi, I can help you with job search, resume updates, and tracking your applications.",
      actions: Object.keys(quickActionMap).slice(0, 4),
    };
  }

  if (currentPath.includes("/employer")) {
    return {
      text: "I could not reach the chatbot service, but I can still help with employer actions here. Try one of the quick options below.",
      actions: Object.keys(quickActionMap).slice(0, 4),
    };
  }

  return {
    text: "I could not reach the chatbot service, but I can still help with job seeker actions here. Try one of the quick options below.",
    actions: Object.keys(quickActionMap).slice(0, 4),
  };
};

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const scrollRef = useRef(null);

  const isSupportedRole = role === ROLES.EMPLOYER || role === ROLES.JOB_SEEKER;
  const quickActionMap = useMemo(() => QUICK_ACTIONS[role] || {}, [role]);

  useEffect(() => {
    if (!isAuthenticated || !isSupportedRole) {
      setMessages([]);
      setSessionId("");
      setHasLoadedHistory(false);
      setIsOpen(false);
      return;
    }

    const welcome = {
      id: "welcome",
      sender: "bot",
      text: getWelcomeMessage(role, user?.fullName),
      actions: Object.keys(quickActionMap).slice(0, 4),
    };

    setMessages([welcome]);
  }, [isAuthenticated, isSupportedRole, quickActionMap, role, user?.fullName]);

  useEffect(() => {
    if (!isOpen || !isSupportedRole || hasLoadedHistory) {
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      try {
        const history = await getChatbotHistory();

        if (!isMounted || !history?.length) {
          setHasLoadedHistory(true);
          return;
        }

        const latestSessionId = history[history.length - 1]?.sessionId || "";
        const normalizedHistory = history.flatMap((item) => [
          {
            id: `user-${item.id}`,
            sender: "user",
            text: item.message,
          },
          {
            id: `bot-${item.id}`,
            sender: "bot",
            text: item.response,
            actions: [],
          },
        ]);

        setSessionId(latestSessionId);
        setMessages((prev) => {
          const welcome = prev[0];
          return welcome ? [welcome, ...normalizedHistory] : normalizedHistory;
        });
      } catch (error) {
        console.error("Failed to load chatbot history:", error);
      } finally {
        if (isMounted) {
          setHasLoadedHistory(true);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [hasLoadedHistory, isOpen, isSupportedRole]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isAuthenticated || !isSupportedRole) {
    return null;
  }

  const handleActionClick = async (action) => {
    const path = quickActionMap[action];

    if (path) {
      navigate(path);
      return;
    }

    setInput(action);
    await handleSend(action);
  };

  const handleSend = async (messageOverride) => {
    const outgoingMessage = (messageOverride ?? input).trim();

    if (!outgoingMessage || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: outgoingMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const response = await sendChatbotMessage({
        message: outgoingMessage,
        sessionId: sessionId || null,
        currentPath: location.pathname,
      });

      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: response.response,
          actions: response.suggestedActions || [],
        },
      ]);
    } catch (error) {
      console.error("Failed to send chatbot message:", error);
      const fallback = buildLocalFallbackResponse(
        role,
        location.pathname,
        quickActionMap,
        outgoingMessage,
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          sender: "bot",
          text: fallback.text,
          actions: fallback.actions,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await handleSend();
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {isOpen && (
        <div className="mb-4 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          <div className={`bg-gradient-to-r ${BOT_ACCENT[role]} px-5 py-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-sm font-bold">
                  {BOT_AVATAR[role]}
                </div>
                <div>
                  <div className="text-sm font-semibold">Portal Assistant</div>
                  <div className="text-xs text-white/80">
                    {role === ROLES.EMPLOYER ? "Employer helper" : "Job seeker helper"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-white/90 transition hover:bg-white/15"
                aria-label="Close chatbot"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="max-h-[24rem] space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.sender === "user"
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
                {message.sender === "bot" && message.actions?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={`${message.id}-${action}`}
                        type="button"
                        onClick={() => handleActionClick(action)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  role === ROLES.EMPLOYER
                    ? "Ask about jobs, applicants, or profile..."
                    : "Ask about jobs, resume, or applications..."
                }
                rows={2}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className={`rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition ${
                  isSending || !input.trim() ? "cursor-not-allowed opacity-50" : "hover:bg-slate-800"
                }`}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-gradient-to-br ${BOT_ACCENT[role]} text-white shadow-xl transition hover:scale-105`}
        aria-label="Open chatbot"
      >
        <svg className="h-7 w-7 transition group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatbotWidget;
