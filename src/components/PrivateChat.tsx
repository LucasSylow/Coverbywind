import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { db, auth, handleFirestoreError } from "../firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc
} from "firebase/firestore";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  isAdmin: boolean;
  createdAt: number;
}

interface PrivateChatProps {
  customerId: string;
  customerName: string;
  isAdminMode: boolean; // true if admin is viewing, false if customer is viewing
}

export default function PrivateChat({ customerId, customerName, isAdminMode }: PrivateChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const userId = isAdminMode ? "admin" : (customerId || "unknown");
  const actualName = isAdminMode ? "Coverbywind" : (customerName || "Kunde");

  useEffect(() => {
    if (!customerId) return;

    let unsubMsgs: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) return; // Wait for Firebase Auth

      if (!unsubMsgs) {
        // Points to the specific customer messages subcollection
        const qMsgs = query(collection(db, "customers", customerId, "messages"), orderBy("createdAt", "desc"), limit(50));
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
      if (unsubMsgs) unsubMsgs();
    };
  }, [customerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId || !customerId) return;
    
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
        senderName: actualName,
        isAdmin: isAdminMode,
        createdAt: Date.now()
      };
      await addDoc(collection(db, "customers", customerId, "messages"), payload);
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, 'write' as any, `customers/${customerId}/messages`);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!messageId) return;
    try {
      await deleteDoc(doc(db, "customers", customerId, "messages", messageId));
    } catch (err: any) {
      alert("Kunne ikke slette besked: " + err.message);
    }
  };

  return (
    <div className="flex flex-col bg-[#111111] border border-zinc-800/80 rounded-3xl overflow-hidden h-[500px]">
      {/* Header */}
      <div className="px-5 py-4 bg-[#1a1a1a] border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-base">
            {isAdminMode ? `Chat med ${customerName}` : "Chat med Coverbywind"}
          </h3>
          <p className="text-xs text-zinc-400">
            {isAdminMode ? "Privat samtale med kunde" : "Her kan du kontakte os direkte"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col gap-2 items-center justify-center text-zinc-500">
            <MessageSquare className="w-10 h-10 opacity-50 mb-2" />
            <span className="text-sm">Ingen beskeder endnu...</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === userId;
            const initials = msg.senderName ? msg.senderName.substring(0, 2).toUpperCase() : "??";
            
            return (
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1 w-full`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                    msg.isAdmin ? 'bg-blue-600' : 'bg-zinc-700'
                  }`}>
                    {initials}
                  </div>
                  
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
                      {(isMe || isAdminMode) && (
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
    </div>
  );
}
