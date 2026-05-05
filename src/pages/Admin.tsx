import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Trash2, Edit2, ShieldCheck, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp, Image as ImageIcon, Ban, Search } from "lucide-react";
import { db, auth, handleFirestoreError } from "../firebase";
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, getDocs, getDoc, query, limit, orderBy } from "firebase/firestore";
import ChatWidget from "../components/ChatWidget";
import PrivateChat from "../components/PrivateChat";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

type Status = "Afventer" | "Gennemført" | "Annulleret" | "I gang";

interface Order {
  id: string;
  artist: string;
  track: string;
  email: string;
  status: Status;
  date: string;
  ideas?: string;
  link?: string;
  imageUrl?: string;
  downloadUrl?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  orderNumber: string; // "Kode" they use to login
  imageUrl: string;
  createdAt: string;
  expirationDate?: string;
  hasAcceptedTerms?: boolean;
  isSuspended?: boolean;
  orders: Order[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const code = localStorage.getItem("cbw_admin_code");
    if (code !== "true") {
      navigate("/");
      return;
    }
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // We verify admin status implicitly. If the user doesn't actually have an admin doc
        // in Firestore, the subsequent queries will throw permission denied errors.

        // user logged in anonymously, setup snapshot for customers
        const unsubCustomers = onSnapshot(collection(db, "customers"), 
          async (snapshot) => {
            const customerList: Customer[] = [];
            
            // For each customer, we fetch their orders
            for (const docSnap of snapshot.docs) {
               const data = docSnap.data();
               const isExpired = data.expirationDate ? new Date(data.expirationDate).setHours(23, 59, 59, 999) < new Date().getTime() : false;
               
               if (isExpired && !data.isSuspended) {
                 try {
                   updateDoc(docSnap.ref, { isSuspended: true }).catch(console.error);
                 } catch(e) {}
                 data.isSuspended = true;
               }

               const customer: Customer = {
                  id: docSnap.id,
                  name: data.name || "",
                  email: data.email || "",
                  orderNumber: data.orderNumber || "",
                  imageUrl: data.imageUrl || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
                  createdAt: data.createdAt || "",
                  expirationDate: data.expirationDate || "",
                  isSuspended: data.isSuspended || false,
                  orders: []
               };
               
               // Fetch orders for this customer
               try {
                 const ordersSnap = await getDocs(collection(db, `customers/${docSnap.id}/orders`));
                 ordersSnap.forEach((orderDoc) => {
                   const orderData = orderDoc.data();
                   customer.orders.push({
                     id: orderDoc.id,
                     artist: orderData.artist || "",
                     track: orderData.track || "",
                     email: orderData.email || "",
                     status: orderData.status || "Afventer",
                     date: orderData.date || "",
                     ideas: orderData.ideas || "",
                     link: orderData.link || "",
                     imageUrl: orderData.imageUrl || "",
                     downloadUrl: orderData.downloadUrl || ""
                   });
                 });
               } catch (err) {
                 console.error("Could not fetch orders for customer", docSnap.id, err);
               }
               customerList.push(customer);
            }
            
            setCustomers(customerList);
          }, 
          (error) => handleFirestoreError(error, OperationType.LIST, "customers")
        );
        return () => unsubCustomers();
      }
    });

    return () => unsubAuth();
  }, []);

  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const [customerUnreadMap, setCustomerUnreadMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const customerIds = customers.map(c => c.id).join(',');
    if (!customerIds) return;
    
    customers.forEach(c => {
      const qMsgs = query(collection(db, "customers", c.id, "messages"), orderBy("createdAt", "desc"), limit(1));
      const unsub = onSnapshot(qMsgs, (snap) => {
        if (!snap.empty) {
           const msg = snap.docs[0].data();
           setCustomerUnreadMap(prev => ({...prev, [c.id]: !msg.isAdmin}));
        } else {
           setCustomerUnreadMap(prev => ({...prev, [c.id]: false}));
        }
      }, (error) => {
         console.error("Error listening to messages", error);
      });
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach(u => u());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers.map(c => c.id).join(',')]);

  const [searchTerm, setSearchTerm] = useState("");

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    orderNumber: "CBW-" + Math.floor(10000 + Math.random() * 90000),
    imageUrl: "",
    expirationDate: ""
  });

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: "",
    email: "",
    orderNumber: "",
    imageUrl: "",
    expirationDate: ""
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.orderNumber || !newCustomer.email) return;

    try {
      const cleanCode = newCustomer.orderNumber.replace('#', '');
      const docRef = doc(db, "customers", cleanCode);
      const payload = {
        name: newCustomer.name,
        email: newCustomer.email,
        orderNumber: newCustomer.orderNumber,
        imageUrl: newCustomer.imageUrl || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
        createdAt: new Date().toLocaleDateString("da-DK"),
        expirationDate: newCustomer.expirationDate || ""
      };
      console.log("Creating customer payload:", payload);
      await setDoc(docRef, payload);

      setNewCustomer({
        name: "",
        email: "",
        orderNumber: "CBW-" + Math.floor(10000 + Math.random() * 90000),
        imageUrl: "",
        expirationDate: ""
      });
    } catch (error) {
      alert("Kunne ikke oprette kunde: " + String(error));
      handleFirestoreError(error, OperationType.CREATE, "customers");
    }
  };

  const handleStartEdit = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setEditCustomerForm({
      name: customer.name,
      email: customer.email,
      orderNumber: customer.orderNumber,
      imageUrl: customer.imageUrl,
      expirationDate: customer.expirationDate || ""
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const ref = doc(db, "customers", id);
      await updateDoc(ref, {
        name: editCustomerForm.name,
        email: editCustomerForm.email,
        orderNumber: editCustomerForm.orderNumber,
        imageUrl: editCustomerForm.imageUrl || "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
        expirationDate: editCustomerForm.expirationDate
      });
      setEditingCustomerId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customers/${id}`);
    }
  };


  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Er du sikker på, at du vil slette denne kunde?")) {
      try {
        await deleteDoc(doc(db, "customers", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
      }
    }
  };

  const handleToggleSuspend = async (id: string, currentStatus: boolean | undefined) => {
    try {
      await updateDoc(doc(db, "customers", id), {
        isSuspended: !currentStatus
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customers/${id}`);
    }
  };

  const handleUpdateOrderStatus = async (customerId: string, orderId: string, newStatus: Status) => {
    try {
      const orderRef = doc(db, `customers/${customerId}/orders`, orderId);
      const updateData: any = { status: newStatus };
      if (newStatus === "I gang") {
        updateData.inProgressAt = Date.now();
      }
      await updateDoc(orderRef, updateData);
      
      // Update local state temporarily for snappy UI (snapshot might take a second since orders aren't hooked via real-time here)
      setCustomers(customers.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            orders: c.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
          };
        }
        return c;
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customers/${customerId}/orders/${orderId}`);
    }
  };

  const handleUpdateOrderDetails = async (customerId: string, orderId: string, details: Partial<Order>) => {
    try {
      const ref = doc(db, `customers/${customerId}/orders`, orderId);
      await updateDoc(ref, details);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customers/${customerId}/orders/${orderId}`);
    }
  };

  const handleDeleteOrder = async (customerId: string, orderId: string) => {
    if (confirm("Er du sikker på, at du vil slette denne ordre?")) {
      try {
        await deleteDoc(doc(db, `customers/${customerId}/orders`, orderId));
        setCustomers(customers.map(c => {
          if (c.id === customerId) {
            return {
              ...c,
              orders: c.orders.filter(o => o.id !== orderId)
            };
          }
          return c;
        }));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `customers/${customerId}/orders/${orderId}`);
      }
    }
  };

  const getStatusClass = (status: Status) => {
    switch (status) {
      case "Gennemført":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Afventer":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Annulleret":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "I gang":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse";
    }
  };

  const pendingOrders = customers
    .flatMap(c => c.orders.map(o => ({ ...o, customerName: c.name, customerEmail: c.email, customerId: c.id })))
    .filter(o => o.status === "Afventer" || o.status === "I gang")
    .sort((a, b) => {
      if (a.status === "I gang" && b.status !== "I gang") return -1;
      if (a.status !== "I gang" && b.status === "I gang") return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-8 pb-24 max-w-6xl mx-auto w-full px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Administrator Dashboard</h1>
            <p className="text-zinc-400">Håndter kunder og bestillinger</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsChatOpen(true)}
          className="relative overflow-hidden rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span>Åben fælleschat</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                {unreadCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Pending Orders Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Nye ordrer (Afventer / I gang) 
          <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-sm ml-2">{pendingOrders.length}</span>
        </h2>
        {pendingOrders.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 bg-[#111111] rounded-[2rem] border border-zinc-800 border-dashed">
            Ingen nye ordrer afventer.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-[#111111] border border-zinc-800/80 rounded-[1.5rem] p-5 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">{order.track}</h3>
                  <span className="text-xs font-mono text-zinc-500">#{order.id}</span>
                </div>
                <div className="text-sm text-zinc-400 mb-4 flex flex-col gap-1">
                  <div>Artist: <span className="text-white font-medium">{order.artist}</span></div>
                  <div>Kunde: <span className="text-white font-medium">{order.customerName}</span> ({order.customerEmail})</div>
                  <div>Dato: {order.date}</div>
                  {order.ideas && (
                    <div className="mt-2 pt-2 border-t border-zinc-800">
                      <span className="text-xs uppercase tracking-wider font-bold text-zinc-500 block mb-1">Idéer/Koncepter</span>
                      <p className="text-zinc-300">{order.ideas}</p>
                    </div>
                  )}
                  {order.link && (
                    <div className="mt-2">
                      <span className="text-xs uppercase tracking-wider font-bold text-zinc-500 block mb-1">Inspirations Link</span>
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                        {order.link}
                      </a>
                    </div>
                  )}
                </div>
                <select 
                  value={order.status}
                  onChange={(e) => handleUpdateOrderStatus(order.customerId, order.id, e.target.value as Status)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-bold outline-none cursor-pointer appearance-none ${getStatusClass(order.status)}`}
                >
                  <option value="Afventer" className="bg-zinc-900 text-yellow-500">Afventer</option>
                  <option value="I gang" className="bg-zinc-900 text-orange-500">I gang</option>
                  <option value="Gennemført" className="bg-zinc-900 text-green-500">Gennemført</option>
                  <option value="Annulleret" className="bg-zinc-900 text-red-500">Annulleret</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Customer Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#111111] border border-purple-500/20 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] sticky top-32">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Tilføj ny kunde
            </h2>
            
            <form onSubmit={handleAddCustomer} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Kundenavn *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  placeholder="F.eks. Mikkel"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">E-mail *</label>
                <input
                  type="email"
                  required
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  placeholder="din@email.dk"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Ordrenummer kode * (Login)</label>
                <input
                  type="text"
                  required
                  value={newCustomer.orderNumber}
                  onChange={(e) => setNewCustomer({ ...newCustomer, orderNumber: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Profilbillede URL (Valgfri)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newCustomer.imageUrl}
                    onChange={(e) => setNewCustomer({ ...newCustomer, imageUrl: e.target.value })}
                    className="flex-1 bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Udløbsdato (Valgfri)</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newCustomer.expirationDate}
                    onChange={(e) => setNewCustomer({ ...newCustomer, expirationDate: e.target.value })}
                    className="flex-1 bg-[#0a0a0a] border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl px-4 py-3 transition-colors"
              >
                Opret kunde
              </button>
            </form>
          </div>
        </div>

        {/* Customer List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#111111] border border-zinc-800/80 rounded-[1.5rem] p-4 flex items-center shadow-lg gap-3">
            <Search className="w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Søg efter navn, e-mail eller kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
          {filteredCustomers.length === 0 ? (
             <div className="text-center py-12 text-zinc-500 bg-[#111111] rounded-[2rem] border border-zinc-800 border-dashed">
                {customers.length === 0 ? "Ingen kunder oprettet endnu." : "Ingen kunder matchede din søgning."}
             </div>
          ) : (
             filteredCustomers.map(customer => (
               <div key={customer.id} className="bg-[#111111] border border-zinc-800/80 rounded-[2rem] p-6 shadow-lg overflow-hidden">
                 
                 <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                   <div className="flex items-center gap-4 w-full sm:w-auto">
                     <img src={customer.imageUrl} alt={customer.name} className="w-16 h-16 rounded-full border-2 border-zinc-700 object-cover" />
                     {editingCustomerId === customer.id ? (
                       <div className="flex flex-col gap-2 w-full">
                         <input 
                           type="text" 
                           value={editCustomerForm.name} 
                           onChange={(e) => setEditCustomerForm({...editCustomerForm, name: e.target.value})}
                           className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-sm"
                           placeholder="Navn"
                         />
                         <input 
                           type="email" 
                           value={editCustomerForm.email} 
                           onChange={(e) => setEditCustomerForm({...editCustomerForm, email: e.target.value})}
                           className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-sm"
                           placeholder="E-mail"
                         />
                         <input 
                           type="text" 
                           value={editCustomerForm.orderNumber} 
                           onChange={(e) => setEditCustomerForm({...editCustomerForm, orderNumber: e.target.value})}
                           className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-sm font-mono"
                           placeholder="Kode/Ordrenr."
                         />
                         <input 
                           type="url" 
                           value={editCustomerForm.imageUrl} 
                           onChange={(e) => setEditCustomerForm({...editCustomerForm, imageUrl: e.target.value})}
                           className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-sm"
                           placeholder="Billede URL"
                         />
                         <input 
                           type="date" 
                           value={editCustomerForm.expirationDate} 
                           onChange={(e) => setEditCustomerForm({...editCustomerForm, expirationDate: e.target.value})}
                           className="bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-sm"
                         />
                         <div className="flex gap-2">
                           <button onClick={() => handleSaveEdit(customer.id)} className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-500">Gem</button>
                           <button onClick={() => setEditingCustomerId(null)} className="bg-zinc-700 text-white px-3 py-1 rounded text-sm hover:bg-zinc-600">Annuller</button>
                         </div>
                       </div>
                     ) : (
                       <div>
                         <h3 className="text-xl font-bold text-white leading-tight flex items-center gap-2">
                           {customer.name}
                           {customerUnreadMap[customer.id] && (
                             <span className="bg-purple-600 text-white text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wide shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                               Ny besked
                             </span>
                           )}
                           {customer.isSuspended && (
                             <span className="bg-red-600 text-white text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wide shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                               Suspenderet
                             </span>
                           )}
                         </h3>
                         <div className="flex flex-col gap-1 items-start mt-1">
                           <span className="text-zinc-300 text-sm">{customer.email}</span>
                           <span className="text-zinc-400 font-mono text-sm bg-zinc-900 px-2 py-0.5 rounded inline-block border border-zinc-800">Kode: {customer.orderNumber}</span>
                           <span className="text-xs text-zinc-500">Oprettet: {customer.createdAt}</span>
                           {customer.expirationDate && (
                             <span className="text-xs text-amber-500 font-medium">Udløber: {customer.expirationDate}</span>
                           )}
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                     {editingCustomerId !== customer.id && (
                       <button
                         onClick={() => handleStartEdit(customer)}
                         className="p-2 text-zinc-500 hover:text-purple-400 hover:bg-purple-400/10 rounded-xl transition-colors"
                         title="Rediger kunde"
                       >
                         <Edit2 className="w-5 h-5" />
                       </button>
                     )}
                     <button
                       onClick={() => setExpandedCustomer(expandedCustomer === customer.id ? null : customer.id)}
                       className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                     >
                       {customer.orders.length} ordrer
                       {expandedCustomer === customer.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                     </button>
                     <button
                       onClick={() => handleToggleSuspend(customer.id, customer.isSuspended)}
                       className={`p-2 rounded-xl transition-colors ${
                         customer.isSuspended 
                         ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' 
                         : 'text-zinc-500 hover:text-red-400 hover:bg-red-400/10'
                       }`}
                       title={customer.isSuspended ? "Aktiver kunde" : "Suspendere kunde"}
                     >
                       <Ban className="w-5 h-5" />
                     </button>
                     <button
                       onClick={() => handleDeleteCustomer(customer.id)}
                       className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                       title="Slet kunde"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                   </div>
                 </div>

                 {/* Orders list */}
                 {expandedCustomer === customer.id && (
                   <div className="mt-8 pt-6 border-t border-zinc-800/80">
                     <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4">Kunde ordrer</h4>
                     
                     {customer.orders.length === 0 ? (
                       <p className="text-zinc-500 text-sm italic">Ingen ordrer fundet.</p>
                     ) : (
                       <div className="flex flex-col gap-4">
                         {customer.orders.map(order => (
                           <div key={order.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
                             
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                               <div>
                                 <div className="flex items-baseline gap-2">
                                   <span className="text-lg font-bold text-white">{order.track}</span>
                                   <span className="text-zinc-500 text-sm">#{order.id}</span>
                                 </div>
                                 <div className="text-zinc-400 text-sm mt-1">
                                   {order.artist} • {order.email} • {order.date}
                                 </div>
                               </div>

                               <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                 <select 
                                   value={order.status}
                                   onChange={(e) => handleUpdateOrderStatus(customer.id, order.id, e.target.value as Status)}
                                   className={`px-3 py-1.5 rounded-xl border text-sm font-bold outline-none cursor-pointer appearance-none ${getStatusClass(order.status)}`}
                                 >
                                   <option value="Afventer" className="bg-zinc-900 text-yellow-500">Afventer</option>
                                   <option value="I gang" className="bg-zinc-900 text-orange-500">I gang</option>
                                   <option value="Gennemført" className="bg-zinc-900 text-green-500">Gennemført</option>
                                   <option value="Annulleret" className="bg-zinc-900 text-red-500">Annulleret</option>
                                 </select>

                                 <button
                                   onClick={() => handleDeleteOrder(customer.id, order.id)}
                                   className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
                                   title="Slet ordre"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               </div>
                             </div>

                             {/* Order details */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-zinc-800">
                               <div>
                                 <span className="text-zinc-500 block mb-1">Idéer:</span>
                                 <p className="text-zinc-300">{order.ideas || "-"}</p>
                               </div>
                               <div>
                                 <span className="text-zinc-500 block mb-1">Inspirations link:</span>
                                 {order.link ? (
                                   <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                                     {order.link}
                                   </a>
                                 ) : (
                                   <span className="text-zinc-300">-</span>
                                 )}
                               </div>
                               
                               {order.status === "Gennemført" && (
                                 <div className="md:col-span-2 flex flex-col gap-3 mt-2 border-t border-zinc-800 pt-4">
                                   <div className="text-sm font-bold text-green-400 flex items-center gap-2 mb-2">
                                     <CheckCircle2 className="w-5 h-5" />
                                     Gennemført ordre filer
                                   </div>
                                   <div>
                                     <label className="text-sm font-medium text-zinc-400 block mb-1">Download Link URL:</label>
                                     <input 
                                       type="url" 
                                       defaultValue={order.downloadUrl || ""} 
                                       onBlur={(e) => handleUpdateOrderDetails(customer.id, order.id, { downloadUrl: e.target.value })}
                                       placeholder="https://..."
                                       className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 px-3 py-2 rounded-lg text-sm outline-none focus:border-purple-500 transition-colors" 
                                     />
                                   </div>
                                   <div>
                                     <label className="text-sm font-medium text-zinc-400 block mb-1">Coverbillede URL:</label>
                                     <input 
                                       type="url" 
                                       defaultValue={order.imageUrl || ""} 
                                       onBlur={(e) => handleUpdateOrderDetails(customer.id, order.id, { imageUrl: e.target.value })}
                                       placeholder="https://..."
                                       className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 px-3 py-2 rounded-lg text-sm outline-none focus:border-purple-500 transition-colors" 
                                     />
                                     {order.imageUrl && (
                                       <img src={order.imageUrl} alt="" className="mt-3 w-16 h-16 rounded-xl border border-zinc-700 object-cover" />
                                     )}
                                   </div>
                                 </div>
                               )}
                             </div>
                             
                           </div>
                         ))}
                       </div>
                     )}

                     {/* Private Chat */}
                     <div className="mt-8 pt-6 border-t border-zinc-800/80">
                       <PrivateChat 
                         customerId={customer.id} 
                         customerName={customer.name} 
                         isAdminMode={true} 
                       />
                     </div>
                   </div>
                 )}

               </div>
             ))
          )}
        </div>

      </div>
      
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onUnreadCountChange={setUnreadCount} />
    </div>
  );
}
