import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Circle, Users } from "lucide-react";
import { db, handleFirestoreError } from "../firebase";
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

export default function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const customerCode = localStorage.getItem("cbw_customer_code");
  const adminCode = localStorage.getItem("cbw_admin_code") === "Peniscola123" ? "admin" : null;
  const userId = adminCode || customerCode;
  
  const isUserAdmin = !!adminCode;
  const fallbackName = isUserAdmin ? "Operator" : `Kunde ${customerCode}`;
  
  const [actualName, setActualName] = useState<string>(fallbackName);
  const [actualImage, setActualImage] = useState<string | null>(null);

  // If not logged in, don't show the widget
  if (!userId) return null;

  // Fetch actual customer name if user
  useEffect(() => {
    if (isUserAdmin) {
      setActualName("Operator");
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

    // Presence system
    const userRef = doc(db, "online_users", userId);
    
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
    const interval = setInterval(updatePresence, 30000); // Heartbeat every 30s

    // Cleanup on unmount or tab close
    const handleBeforeUnload = () => {
      deleteDoc(userRef).catch(() => {});
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      deleteDoc(userRef).catch((err) => console.error("Presence delete error:", err));
    };
  }, [userId, actualName, isUserAdmin]);

  useEffect(() => {
    // Listen to online users
    const qUsers = query(collection(db, "online_users"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      const now = Date.now();
      const users = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as OnlineUser))
        .filter((u) => now - u.lastActive < 60000); // Consider online if active in last 60s
      setOnlineUsers(users);
    }, (error) => {
      console.error("Online users snapshot error: ", error);
    });

    return () => unsubUsers();
  }, []);

  useEffect(() => {
    // Listen to messages
    const qMsgs = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(50));
    const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
      const msgsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage)).reverse();
      setMessages(msgsData);
    }, (error) => {
      console.error("Messages snapshot error: ", error);
    });

    return () => unsubMsgs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const msgText = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "messages"), {
        text: msgText,
        senderId: userId,
        senderName: actualName || fallbackName,
        senderImage: actualImage || "",
        isAdmin: isUserAdmin,
        createdAt: Date.now()
      });
    } catch (err: any) {
      alert("Fejl ved afsendelse: " + (err.message || String(err)));
      console.error(err);
    }
  };

  return (
    <div className="w-full h-[600px] bg-[#111111] border border-zinc-800/80 rounded-[2rem] shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-[#1a1a1a] border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
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
      </div>

      {/* Online Users List (Small row at top) */}
      <div className="px-4 py-2 border-b border-zinc-800/50 bg-[#161616] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-zinc-700">
        <div className="flex items-center gap-1 text-xs text-zinc-500 mr-2">
          <Users className="w-3.5 h-3.5" />
        </div>
        {onlineUsers.map(user => (
          <div key={user.id} className="flex items-center gap-1.5 bg-[#222] px-2.5 py-1 rounded-md">
            <div className={`w-1.5 h-1.5 rounded-full ${user.isAdmin ? 'bg-amber-500' : 'bg-green-500'}`} />
            <span className={`text-xs ${user.isAdmin ? 'text-amber-400 font-semibold' : 'text-zinc-300'}`}>
              {user.name}
            </span>
          </div>
        ))}
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
                        msg.isAdmin ? 'ring-2 ring-amber-500' : 'ring-2 ring-purple-600'
                      }`}
                    />
                  ) : (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                      msg.isAdmin ? 'bg-amber-500' : 'bg-purple-600'
                    }`}>
                      {initials}
                    </div>
                  )}
                  
                  {/* Message Bubble + Name */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                    <div className={`flex items-center gap-2 px-1`}>
                      {!isMe && (
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${msg.isAdmin ? 'text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm' : 'text-zinc-500'}`}>
                          {msg.senderName}
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[10px] text-zinc-500">
                          Mig
                        </span>
                      )}
                    </div>
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-purple-600 text-white rounded-br-sm' 
                          : 'bg-[#222] border border-zinc-800/80 text-zinc-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
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
          className="flex-1 bg-[#0a0a0a] border border-zinc-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="w-12 h-12 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg"
          title="Send besked"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
