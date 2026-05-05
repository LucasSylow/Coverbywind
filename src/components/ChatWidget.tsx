import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Circle, Users, Trash2, Info } from "lucide-react";
import { db, auth, handleFirestoreError } from "../firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  deleteDoc
} from "firebase/firestore";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  isAdmin: boolean;
  createdAt: number;
  seenBy?: { id: string; name: string; imageUrl?: string }[];
}

interface OnlineUser {
  id: string;
  name: string;
  isAdmin: boolean;
  lastActive: number;
}

enum OperationType {
  GET = 'get',
  WRITE = 'write',
  LIST = 'list',
  DELETE = 'delete'
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function ChatWidget({ isOpen, onClose, onUnreadCountChange }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const customerCode = localStorage.getItem("cbw_customer_code");
  const adminCode = localStorage.getItem("cbw_admin_code") === "true" ? "admin" : null;
  const userId = adminCode || customerCode;
  
  const isUserAdmin = !!adminCode;
  const fallbackName = isUserAdmin ? "Coverbywind" : `Kunde ${customerCode}`;
  
  const [actualName, setActualName] = useState<string>(fallbackName);
  const [actualImage, setActualImage] = useState<string | null>(null);

  // If not logged in, don't show the widget
  if (!userId) return null;

  // Fetch actual customer name if user
  useEffect(() => {
    if (isUserAdmin) {
      setActualName("Coverbywind");
      setActualImage("https://cdn-icons-png.flaticon.com/512/9131/9131529.png"); // Setting a default image for admin if needed
    } else if (customerCode) {
      const unsub = onSnapshot(doc(db, "customers", customerCode), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.name) {
            setActualName(data.name);
          }
          if (data && data.imageUrl) {
            setActualImage(data.imageUrl);
          }
        }
      });
      return () => unsub();
    }
  }, [isUserAdmin, customerCode]);

  useEffect(() => {
    if (!userId) return;

    let interval: NodeJS.Timeout;
    const userRef = doc(db, "online_users", userId);
    
    const handleBeforeUnload = () => {
      deleteDoc(userRef).catch(() => {});
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return; // Wait for auth

      const updatePresence = async () => {
        try {
          await setDoc(userRef, {
            name: actualName,
            isAdmin: isUserAdmin,
            lastActive: Date.now()
          });
        } catch (err) {
          console.error("Presence update error:", err);
        }
      };

      updatePresence();
      if (!interval) {
        interval = setInterval(updatePresence, 30000); // Heartbeat every 30s
        window.addEventListener("beforeunload", handleBeforeUnload);
      }
    });

    return () => {
      unsubscribeAuth();
      if (interval) clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      deleteDoc(userRef).catch(() => {});
    };
  }, [userId, actualName, isUserAdmin]);

  useEffect(() => {
    if (!userId) return;

    let unsubUsers: (() => void) | undefined;
    let unsubMsgs: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return; // Wait for Firebase Auth to initialize!

      // Only subscribe if not already subscribed
      if (!unsubUsers) {
        const qUsers = query(collection(db, "online_users"));
        unsubUsers = onSnapshot(qUsers, (snapshot) => {
          const now = Date.now();
          const users = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as OnlineUser))
            .filter((u) => now - u.lastActive < 60000); 
          setOnlineUsers(users);
        }, (error) => {
          console.error("Online users snapshot error: ", error);
        });
      }

      if (!unsubMsgs) {
        const qMsgs = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50));
        unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
          const msgsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          } as ChatMessage)).reverse();
          setMessages(msgsData);
        }, (error) => {
          console.error("Messages snapshot error: ", error);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUsers) unsubUsers();
      if (unsubMsgs) unsubMsgs();
    };
  }, [userId]);

  useEffect(() => {
    if (!isOpen || !userId || !actualName) return;

    // Throttle these updates slightly to avoid hammering DB
    const timer = setTimeout(() => {
      const unseenMessages = messages.filter(
        (m) => m.senderId !== userId && !(m.seenBy || []).some((s) => s.id === userId)
      );

      unseenMessages.forEach((msg) => {
        const msgRef = doc(db, "messages", msg.id);
        const newSeenBy = [...(msg.seenBy || []), { id: userId, name: actualName, imageUrl: actualImage || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png" }];
        setDoc(msgRef, { seenBy: newSeenBy }, { merge: true }).catch(console.error);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [messages, isOpen, userId, actualName, actualImage]);

  useEffect(() => {
    if (!userId) return;
    const unseenMessages = messages.filter(
      (m) => m.senderId !== userId && !(m.seenBy || []).some((s) => s.id === userId)
    );
    if (onUnreadCountChange) {
      onUnreadCountChange(unseenMessages.length);
    }
  }, [messages, userId, onUnreadCountChange]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;
    
    if (!auth.currentUser) {
      alert("Systemet er ved at forbinde. Prøv lige om et øjeblik.");
      return;
    }

    const msgText = newMessage.trim();
    setNewMessage("");

    try {
      const payload = {
        text: msgText,
        senderId: userId,
        senderName: actualName || fallbackName,
        senderImage: actualImage || "",
        isAdmin: isUserAdmin,
        createdAt: Date.now()
      };
      console.log("Sending payload:", payload);
      await addDoc(collection(db, "messages"), payload);
    } catch (err: any) {
      alert("Fejl ved afsendelse: " + (err.message || String(err)));
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!messageId) return;
    try {
      await deleteDoc(doc(db, "messages", messageId));
    } catch (err: any) {
      alert("Kunne ikke slette besked: " + err.message);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[650px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] z-50 bg-[#111111] border border-zinc-800/80 rounded-[2rem] shadow-[0_0_40px_rgba(37,99,235,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#1a1a1a] border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Fælles Chat</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    <span>{onlineUsers.length} online</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

      {/* Online Users List (Small row at top) */}
      <div className="px-4 py-2 border-b border-zinc-800/50 bg-[#161616] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-zinc-700">
        <div className="flex items-center gap-1 text-xs text-zinc-500 mr-2">
          <Users className="w-3.5 h-3.5" />
        </div>
        {onlineUsers.map(user => (
          <div key={user.id} className="flex items-center gap-1.5 bg-[#222] px-2.5 py-1 rounded-md">
            <div className={`w-1.5 h-1.5 rounded-full ${user.isAdmin ? 'bg-blue-500' : 'bg-green-500'}`} />
            <span className={`text-xs ${user.isAdmin ? 'text-blue-400 font-semibold' : 'text-zinc-300'}`}>
              {user.name}
            </span>
          </div>
        ))}
      </div>

      {/* Support Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-400/90 leading-relaxed">
          Denne chat er ikke lavet til support. Hvis du ønsker support eller at kontakte Coverbywind direkte, kan du lave en ticket på din kundeside.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col gap-2 items-center justify-center text-zinc-500">
            <MessageSquare className="w-10 h-10 opacity-50 mb-2" />
            <span className="text-sm">Ingen beskeder endnu... Vær den første!</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === userId;
            const initials = msg.senderName ? msg.senderName.substring(0, 2).toUpperCase() : "??";
            
            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 w-full`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {msg.senderImage ? (
                    <img 
                      src={msg.senderImage} 
                      alt="Profil" 
                      className={`flex-shrink-0 w-8 h-8 rounded-full object-cover shadow-md ${
                        msg.isAdmin ? 'ring-2 ring-blue-500' : 'ring-2 ring-zinc-600'
                      }`}
                    />
                  ) : (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                      msg.isAdmin ? 'bg-blue-600' : 'bg-zinc-700'
                    }`}>
                      {initials}
                    </div>
                  )}
                  
                  {/* Message Bubble + Name + Time */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 min-w-[120px]`}>
                    <div className={`flex items-center gap-2 px-1`}>
                      {!isMe && (
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${msg.isAdmin ? 'text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-sm' : 'text-zinc-500'}`}>
                          {msg.senderName}
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[10px] text-zinc-500">
                          Mig
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-600">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {(isMe || isUserAdmin) && (
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)} 
                          className="ml-1 text-zinc-600 hover:text-red-500 transition-colors"
                          title="Slet besked"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm w-fit ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-[#222] border border-zinc-800/80 text-zinc-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
                
                {/* Read Receipts */}
                {msg.seenBy && msg.seenBy.length > 0 && (
                  <div className={`flex items-center mt-0.5 gap-0.5 ${isMe ? 'justify-end pr-[42px]' : 'justify-start pl-[42px]'}`}>
                    {msg.seenBy.slice(0, 5).map((reader) => (
                      <div key={reader.id} className="relative group">
                        {reader.imageUrl ? (
                          <img 
                            src={reader.imageUrl} 
                            alt={reader.name} 
                            className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
                          />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold text-white border border-black/20 shadow-sm">
                            {reader.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-50 pointer-events-none">
                          Set af {reader.name}
                        </div>
                      </div>
                    ))}
                    {msg.seenBy.length > 5 && (
                      <div className="text-[10px] text-zinc-500 ml-1">+{msg.seenBy.length - 5}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#1a1a1a] border-t border-zinc-800 flex items-center gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Skriv en besked..."
          className="flex-1 bg-[#0a0a0a] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
          title="Send besked"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
