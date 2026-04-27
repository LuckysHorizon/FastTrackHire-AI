import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatTicker from '../components/interview/ChatTicker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Send, Terminal, FileText, AlertCircle, Info, Zap, BarChart2, Code2 } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useCodingStore } from '../stores/codingStore';
import CodingRoom from '../components/coding/CodingRoom';
import { COMPANY_LOGOS } from '../lib/logos';

const InterviewRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { API_URL, user } = useAuth();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [tickerText, setTickerText] = useState('Initializing interview context...');
  const eventSourceRef = useRef(null);
  const scrollRef = useRef(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatWidth, setChatWidth] = useState(600);
  const [codingMode, setCodingMode] = useState(false);
  const isResizing = useRef(false);
  const { status: codingStatus, initSession: initCodingSession } = useCodingStore();

  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 400 && newWidth < window.innerWidth - 400) {
      setChatWidth(newWidth);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/sessions/${sessionId}?token=${token}`);
        setSession(res.data);
        setMessages(res.data?.chat_history || []);
        setCompleted(res.data?.completed || false);
        setTickerText(res.data?.completed ? "Interview Complete" : `Awaiting candidate response for ${res.data?.company || 'Organization'}`);
      } catch (err) {
        console.error(err);
        setError("Failed to load interview session context.");
      }
    };
    fetchSession();
  }, [sessionId, API_URL]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping || completed) return;

    setError(null);
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setStreamingMessage('');
    setTickerText(`${session?.company} is analyzing response...`);

    const token = localStorage.getItem('token');
    const url = `${API_URL}/sessions/${sessionId}/message/stream?token=${token}&content=${encodeURIComponent(userMsg.content)}`;
    
    if (eventSourceRef.current) eventSourceRef.current.close();
    
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStreamingMessage(prev => prev + (data.token || ''));
      } catch (err) {
        console.error("Parse error", err);
      }
    };

    eventSourceRef.current.addEventListener('done', (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, { role: 'assistant', content: data.full_response }]);
        setStreamingMessage('');
        setIsTyping(false);
        setCompleted(data.completed);
        setTickerText(data.completed ? "Interview Complete" : `Awaiting candidate response for ${session?.company}`);
        eventSourceRef.current.close();
      } catch (err) {
        console.error("Done event parse error", err);
      }
    });

    eventSourceRef.current.addEventListener('error', (err) => {
      console.error("SSE Error:", err);
      setError("Intelligence stream interrupted. Please try again.");
      setIsTyping(false);
      if (eventSourceRef.current) eventSourceRef.current.close();
    });
  };

  const generateFeedback = async () => {
    const token = localStorage.getItem('token');
    try {
      setTickerText("Compiling Intelligence Report...");
      await axios.post(`${API_URL}/sessions/${sessionId}/complete?token=${token}`);
      navigate(`/interview/${sessionId}/feedback`);
    } catch (err) {
      console.error(err);
    }
  };

  if (codingMode || (session?.codingRound?.status && session?.codingRound?.status !== 'pending')) {
    return (
        <div className="h-screen w-full flex flex-col bg-[#16161E] overflow-hidden">
            <ChatTicker text="Coding Assessment Phase Active" />
            <div className="flex-1 overflow-hidden">
                <CodingRoom sessionId={sessionId} onBack={() => setCodingMode(false)} />
            </div>
        </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-bg-base overflow-hidden">
      <ChatTicker text={tickerText} />

      {error && (
        <div className="bg-error/10 border-b border-error/20 p-3 flex items-center justify-center text-error text-[13px] font-medium animate-in fade-in slide-in-from-top-2 duration-300">
           <AlertCircle className="w-4 h-4 mr-2" /> {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Chat */}
        <div 
          style={{ width: `${chatWidth}px` }}
          className="border-r border-bg-muted flex flex-col bg-bg-surface shrink-0 h-full overflow-hidden"
        >
          <div className="p-6 border-b border-bg-muted flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-white border border-bg-muted overflow-hidden p-1.5 shadow-sm shrink-0">
                {COMPANY_LOGOS[session?.company] ? (
                  <img 
                    src={COMPANY_LOGOS[session?.company].logo} 
                    alt={session?.company} 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = "w-full h-full bg-accent text-white flex items-center justify-center font-bold uppercase";
                      fallback.innerText = session?.company?.charAt(0) || 'C';
                      e.target.parentElement.appendChild(fallback);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-accent text-white flex items-center justify-center font-bold uppercase">
                    {session?.company?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-serif text-[18px] font-bold text-accent">{session?.company} Simulation</h3>
                <p className="text-[11px] text-text-tertiary flex items-center">
                  <span className="w-1 h-1 rounded-full bg-success mr-2"></span> Active Session
                </p>
              </div>
            </div>
            {completed && (
              <Button size="sm" onClick={generateFeedback}>View Feedback</Button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth no-scrollbar">
            {messages.length === 0 && !isTyping && (
               <div className="h-full flex flex-col items-center justify-center text-center px-12">
                 <div className="w-12 h-12 bg-bg-subtle rounded-full flex items-center justify-center mb-4">
                    <Terminal className="w-6 h-6 text-text-tertiary" />
                 </div>
                 <p className="text-[14px] text-text-secondary leading-relaxed">
                   The simulation has been initialized. Send a message to begin your technical interview with {session?.company}.
                 </p>
               </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'user' ? (
                    <Avatar size="sm" fallback={user?.full_name?.charAt(0)} className="ml-3" />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-white border border-bg-muted flex items-center justify-center mr-3 overflow-hidden p-1 shrink-0">
                      {COMPANY_LOGOS[session?.company] ? (
                        <img 
                          src={COMPANY_LOGOS[session?.company].logo} 
                          alt={session?.company} 
                          className="w-full h-full object-contain" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = document.createElement('div');
                            fallback.className = "w-full h-full bg-accent text-white flex items-center justify-center text-[12px] font-bold uppercase";
                            fallback.innerText = session?.company?.charAt(0) || 'C';
                            e.target.parentElement.appendChild(fallback);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-accent text-white flex items-center justify-center text-[12px] font-bold uppercase">
                          {session?.company?.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm markdown-content ${
                      msg.role === 'user' 
                        ? 'bg-accent text-text-inverse rounded-tr-none' 
                        : 'bg-bg-subtle text-text-primary rounded-tl-none border border-bg-muted'
                    }`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <p className={`text-[10px] mt-1 text-text-tertiary ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.role === 'user' ? 'Candidate' : `${session?.company} Interviewer`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row">
                  <div className="w-8 h-8 rounded-md bg-white border border-bg-muted flex items-center justify-center mr-3 overflow-hidden p-1 shrink-0">
                    {COMPANY_LOGOS[session?.company] ? (
                      <img 
                        src={COMPANY_LOGOS[session?.company].logo} 
                        alt={session?.company} 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.className = "w-full h-full bg-accent text-white flex items-center justify-center text-[12px] font-bold uppercase";
                          fallback.innerText = session?.company?.charAt(0) || 'C';
                          e.target.parentElement.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-accent text-white flex items-center justify-center text-[12px] font-bold uppercase">
                        {session?.company?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="p-4 rounded-2xl rounded-tl-none text-[14px] leading-relaxed bg-bg-subtle text-text-primary border border-bg-muted shadow-sm markdown-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {streamingMessage}
                      </ReactMarkdown>
                      <span className="inline-block w-1 h-4 bg-accent ml-1 animate-pulse align-middle"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-bg-muted bg-bg-base/50">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                disabled={isTyping || completed}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={completed ? "Interview completed" : "Type your response..."}
                className="w-full bg-bg-surface border border-bg-muted rounded-full py-4 pl-6 pr-14 text-[14px] outline-none focus:border-accent transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping || completed}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Resizer Handle */}
        <div 
          onMouseDown={startResizing}
          className="w-1.5 h-full cursor-col-resize hover:bg-accent/40 active:bg-accent/60 transition-colors z-20 absolute top-0 bottom-0"
          style={{ left: `${chatWidth - 3}px` }}
        />

        {/* Right Panel: Context */}
        <div className="flex-1 bg-bg-base p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-[800px] mx-auto">
             <div className="flex items-center space-x-3 mb-8">
               <div className="bg-white p-2 rounded-lg border border-bg-muted shadow-sm">
                 <Terminal className="w-5 h-5 text-accent" />
               </div>
               <h4 className="font-serif text-[20px] font-bold text-accent">Simulation Intelligence</h4>
             </div>

             <div className="grid grid-cols-1 gap-6">
                <Card className="border-l-4 border-l-accent">
                   <div className="flex items-start">
                     <AlertCircle className="w-5 h-5 text-accent mr-3 mt-0.5 shrink-0" />
                     <div>
                       <h5 className="font-bold text-[14px] mb-2 uppercase tracking-wider text-text-secondary">Session Directive</h5>
                       <p className="text-[15px] text-text-primary leading-relaxed">
                         Present your technical expertise regarding the projects and roles listed in your resume. Be concise and focus on architectural impact.
                       </p>
                     </div>
                   </div>
                </Card>

                <Card className="p-0 overflow-hidden border-bg-muted shadow-sm">
                   <div className="p-6 border-b border-bg-muted bg-bg-subtle/30 flex items-center justify-between">
                     <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center mr-3 border border-accent/10">
                           <Zap className="w-4 h-4 text-accent" />
                        </div>
                        <h5 className="font-bold text-[14px] uppercase tracking-wider text-accent">Real-time Intelligence</h5>
                     </div>
                     {(!session?.codingRound?.status || session?.codingRound?.status === 'pending') && !completed && (
                        <button 
                            onClick={() => setCodingMode(true)}
                            className="h-9 px-4 rounded-lg bg-accent text-white text-[12px] font-bold flex items-center gap-2 hover:bg-accent-hover transition-all shadow-md shadow-accent/10 active:scale-95 group"
                        >
                            <Code2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                            Start Coding Assessment
                        </button>
                      )}
                   </div>
                   <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-text-tertiary mr-3" />
                          <h5 className="font-bold text-[13px] uppercase tracking-wide text-text-secondary">Resume Context</h5>
                        </div>
                        <div className="flex items-center px-2 py-1 rounded-full bg-success/10 border border-success/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-success mr-2 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-success uppercase tracking-wider">Parsed & Active</span>
                        </div>
                      </div>
                      
                      <div className="bg-bg-subtle/50 p-6 rounded-2xl border border-bg-muted text-[13px] text-text-secondary leading-relaxed max-h-[400px] overflow-y-auto no-scrollbar font-sans whitespace-pre-wrap relative">
                        <div className="absolute top-4 right-4">
                           <div className="px-2 py-1 bg-white/80 backdrop-blur rounded border border-bg-muted text-[10px] text-text-tertiary font-bold uppercase tracking-tighter">Source: PDF</div>
                        </div>
                        {session?.resume_text || "Intelligence not available for this session."}
                      </div>

                      <div className="flex items-center p-4 bg-info-light/30 rounded-xl border border-info/10 text-info">
                         <BarChart2 className="w-4 h-4 mr-3 shrink-0" />
                         <p className="text-[11px] font-medium leading-relaxed">Intelligence metrics are derived from real-time analysis of candidate responses and resume data.</p>
                      </div>
                   </div>
                </Card>

                <div className="flex items-center p-4 bg-info-light rounded-xl border border-info/10 text-info">
                   <Info className="w-4 h-4 mr-3" />
                   <p className="text-[12px] font-medium">Responses are evaluated in real-time by the FastTrackHire LLM pipeline.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
