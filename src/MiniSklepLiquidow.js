


import { useState, useEffect } from "react";
import bg from "./assets/bg-liquid.png";

const SHEET_API = "https://script.google.com/macros/s/AKfycbx-MB1gYK5FvUa7KNQBB6bL50A0JK_xoHELyGSMSPawOAwsJ7vQ8ADNJAS2TBz-5Y76/exec";

export default function MiniSklepLiquidow() {
  const [inventory, setInventory] = useState({});
  const [name, setName] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [ml, setMl] = useState("");
  const [strength, setStrength] = useState(null);
  const [base, setBase] = useState(null);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isSending, setIsSending] = useState(false);

  const showMessage = (txt, type = "info") => {
    setMessage(txt);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    fetch(SHEET_API)
      .then(r => r.json())
      .then(d => setInventory(d))
      .catch(console.error);
  }, []);

  useEffect(() => { if (strength === 36 && base === "nikotyna") setBase(null); }, [strength, base]);
  useEffect(() => { if (base === "nikotyna" && strength === 36) setStrength(null); }, [base, strength]);


const calculatePrice = (volume, strength, baseType) => {
  let price = 0;

  let p10 = 0, p60 = 0;

  if (baseType === "sól") {
    if ([6,12,18].includes(strength)) { p10=14.5; p60=76; } 
    else { p10=15.5; p60=82; }
  } else { // nikotyna
    if ([6,12].includes(strength)) { p10=10.5; p60=52; } 
    else if(strength===18){ p10=11.5; p60=58; } 
    else if(strength===24){ p10=12.5; p60=64; }
  }

  let remainder = volume;

  // ================== Pełne 60ml ==================
  const num60 = Math.floor(remainder / 60);
  price += num60 * p60;
  remainder = remainder % 60;

  // ================== Pełne 30ml ==================
  const num30 = Math.floor(remainder / 30);
  if (num30 > 0) {
    const price30 = (() => {
      if (baseType === "nikotyna") {
        if ([6,12].includes(strength)) return 31;
        if (strength === 18) return 34;
        if (strength === 24) return 37;
      } else if (baseType === "sól") {
        if ([6,12,18].includes(strength)) return 43;
        if ([24,36].includes(strength)) return 46;
      }
      return 0;
    })();
    price += num30 * price30;
    remainder = remainder % 30;
  }

  // ================== Reszta po 10ml ==================
  price += (remainder / 10) * p10;

  return price;
};
  const addToCart = () => {
    if (!name || !selectedFlavor || !ml || !strength || !base) { showMessage("❌ Uzupełnij formularz","error"); return; }
    if (ml%10!==0){ showMessage("❌ Tylko co 10ml","error"); return; }
    const maxMl = (inventory[selectedFlavor.id]||0)*10;
    if (ml > maxMl){ showMessage(`❌ Max ${maxMl}ml`,"error"); return; }
    const price = calculatePrice(Number(ml), strength, base);
    setCart([...cart, { flavor:selectedFlavor, ml:Number(ml), strength, base, price }]);
    setInventory(prev => ({ ...prev, [selectedFlavor.id]: prev[selectedFlavor.id]-ml/10 }));
    setMl(""); showMessage("✅ Dodano do koszyka","success");
  };

  const removeItem = idx => {
    const item = cart[idx];
    setInventory(prev => ({ ...prev, [item.flavor.id]: prev[item.flavor.id]+item.ml/10 }));
    setCart(cart.filter((_,i)=>i!==idx));
  };

const sendOrder = async () => {
  if(cart.length===0){ showMessage("❌ Koszyk pusty","error"); return; }
  if(isSending) return;
  setIsSending(true);

  const d = new Date();
  const date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; // pełna data

  const orderText = cart.map(i=>`${i.flavor.id}/${i.ml}ml/${i.strength}mg/${i.base}/${i.price.toFixed(2)}`).join("\n");
  const total = cart.reduce((s,i)=>s+i.price,0);

  const usedAromas = {};
  cart.forEach(i=>{
    usedAromas[i.flavor.id] = (usedAromas[i.flavor.id]||0) + i.ml/10;
  });

  try {
    await fetch(SHEET_API, {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // <--- bardzo ważne
  body: JSON.stringify({ date, name, orderText, total, usedAromas })
});
    showMessage("✅ Zamówienie wysłane!","success");
    setCart([]);
  } catch {
    showMessage("❌ Błąd wysyłki","error");
  } finally {
    setIsSending(false);
  }
};

  const total = cart.reduce((s,i)=>s+i.price,0);

  const categoryColors = {
    "Miksy owocowe":["#f87171","#fecaca"],
    "Owoce leśne":["#a78bfa","#e9d5ff"],
    "Tropikalne/Egzotyczne":["#facc15","#fef08a"],
    "Cytrusy/kwaśne":["#fde68a","#fef9c3"],
    "Miętowe/mentholowe":["#60a5fa","#bfdbfe"],
    "Inne smaki":["#34d399","#bbf7d0"]
  };

  // ================= SMAKI =================
  const flavorCategories = {
    "Miksy owocowe":[
      {id:1,name:"Czerwone owoce, Czarna porzeczka, Truskawka, Jeżyna, Malina, Jagoda, Efekt chłodu"},
      {id:2,name:"Czerwone owoce, Truskawka, Czarna porzeczka, Efekt lodowaty"},
      {id:3,name:"Czerwone owoce, Jagoda, Malina, Wiśniowy, Efekt chłodu"},
      {id:4,name:"Czerwone owoce, Ananas, Efekt lodowaty"},
      {id:5,name:"Czerwone owoce, Mango, Efekt chłodu"},
      {id:6,name:"Czerwone owoce, Wata cukrowa"},
      {id:7,name:"Czerwone owoce, Jabłko, Cytryna"},
      {id:8,name:"Czerwone owoce, Wiśniowy, Jagody, Anyż, Eukaliptus, Mentol, Efekt chłodu"},
      {id:9,name:"Czerwone owoce, Anyż, Mentol, Efekt chłodu"},
      {id:10,name:"Czerwone owoce, Guma do żucia, Mentol, Anyż, Efekt chłodu"},
      {id:11,name:"Czerwone owoce, Winogrono, Anyż, Mentol, Efekt chłodu"}
    ],
    "Owoce leśne":[
      {id:12,name:"Czarna porzeczka, Efekt chłodu"},
      {id:13,name:"Jagody, Jabłko, Efekt chłodu"},
      {id:14,name:"Truskawka, Malina, Czarna porzeczka, Jeżyna, Efekt chłodu"},
      {id:15,name:"Jagoda, Czerwona porzeczka, Owoc węża, Efekt chłodu"},
      {id:16,name:"Malina, Brzoskwinia, Cytryna, Cynamon, Efekt chłodu"},
      {id:17,name:"Owoce leśne, Granat, Róża, Nutka świeżości"},
      {id:18,name:"Wiśnia, Agrest czarny"},
      {id:19,name:"Wata cukrowa, Fiołek, Jagoda, Owoce leśne, Nutka świeżości"},
      {id:20,name:"Malina, Jagoda, Cytryna"},
      {id:21,name:"Granat, Truskawka, Czarna porzeczka, Efekt chłodu"}
    ],
    "Tropikalne/Egzotyczne":[
      {id:22,name:"Granat, Truskawka, Kiwi, Efekt chłodu"},
      {id:23,name:"Granat, Truskawka, Smoczy owoc, Efekt chłodu"},
      {id:24,name:"Arbuz, Kiwi"},
      {id:25,name:"Arbuz, Truskawka, Granat, Efekt chłodu"},
      {id:26,name:"Żółty owoc smoka, Melon, Arbuz, Efekt chłodu"},
      {id:27,name:"Truskawka, Mango, Granat, Efekt chłodu"},
      {id:28,name:"Ananas, Cytryna, Efekt chłodu"},
      {id:29,name:"Ananas, Liczi, Efekt chłodu"},
      {id:30,name:"Smoczy owoc, Kiwi, Guawa, Truskawka"},
      {id:31,name:"Smoczy owoc, Truskawka, Efekt chłodu"},
      {id:32,name:"Kokos, Banan, Kiwi"}
    ],
    "Cytrusy/kwaśne":[
      {id:33,name:"Cytryna, Cytryna zielona, Efekt chłodu"},
      {id:34,name:"Kwaśne cukierki, Jabłko, Efekt chłodu"},
      {id:35,name:"Grejpfrut, Truskawka"}
    ],
    "Miętowe/mentholowe":[
      {id:36,name:"Menthol"},
      {id:37,name:"Mięta słodka"},
      {id:38,name:"Mięta lodowa"}
    ],
    "Inne smaki":[
      {id:39,name:"Granat, Truskawka, Efekt lodowaty"},
      {id:40,name:"Wiśnia, Truskawka, Efekt chłodu"},
      {id:41,name:"Jabłko, Gruszka, Kaktus, Efekt chłodu"},
      {id:42,name:"Brzoskwinia, Morela, Efekt chłodu"},
      {id:43,name:"Gruszka, Melon, Granat, Efekt chłodu"},
      {id:44,name:"Żółte kiwi, Truskawka, Granat, Efekt chłodu"},
      {id:45,name:"Niebieska malina, Melon, Efekt chłodu"},
      {id:46,name:"Cola, Efekt lodowaty"},
      {id:47,name:"Arbuz"},
      {id:48,name:"Energetyk"},
      {id:49,name:"Brzoskwinia"},
      {id:50,name:"Winogrono"},
      {id:51,name:"Winogrono, Jabłko"},
      {id:52,name:"Herbata"},
      {id:53,name:"Czerwone owoce, Malina, Efekt chłodu"}
    ]
  };


  return (
    <div style={{ maxWidth:520, margin:"40px auto", padding:15, borderRadius:12, background:`url(${bg}) center/cover`, boxShadow:"0 0 20px rgba(0,0,0,.2)" }}>
      <h2 style={{textAlign:"center"}}>Mini sklep liquidów</h2>

      {/* ===== IMIĘ ===== */}
      <input placeholder="Imię" value={name} onChange={e=>setName(e.target.value)}
        style={{width:"50%", padding:"4px 6px", marginBottom:10, fontSize:14}} />

  


{/* ===== SMAKI ===== */}
<h3>Smaki</h3>
{Object.entries(flavorCategories).map(([cat, flavors])=>{
  const [main, light] = categoryColors[cat];
  return <details key={cat} style={{marginBottom:10, borderRadius:8, padding:5, background:main}}>
    <summary style={{fontWeight:"bold", padding:6}}>{cat}</summary>
    <div style={{padding:6, display:"flex", flexDirection:"column", gap:4}}>
      {flavors.map(f=>{
        const stock=(inventory[f.id]||0)*10;
        const stockColor = stock===0?"red":stock<120?"#facc15":"#22c55e";

        return <label key={f.id} style={{
          display:"flex", alignItems:"center", fontSize:13, 
          background:`linear-gradient(90deg, ${light}, #fff)`, borderRadius:6, padding:"4px 6px",
          cursor:stock===0?"not-allowed":"pointer", opacity:stock===0?0.6:1
        }}
        onClick={()=>{
          if(stock===0) showMessage("❌ Brak na stanie", "error");
          else setSelectedFlavor(f);
        }}>
          <span style={{
            width:16, height:16, border:"1px solid #000", display:"inline-block",
            marginRight:6, textAlign:"center", lineHeight:"16px",
            background:selectedFlavor?.id===f.id?"green":"#fff", color:"#fff"
          }}>{selectedFlavor?.id===f.id?"✔":""}</span>
          {f.id}. {f.name}
          <span style={{marginLeft:6, fontWeight:"bold", color:stockColor}}>
            (na stanie: {stock}ml)
          </span>
        </label>
      })}
    </div>
  </details>
})}

{/* ===== BAZA ===== */}
<h3>Baza</h3>
{["Nikotyna","Sól"].map(v=>{
  const disabled = v==="Nikotyna" && strength===36;
  return <div key={v} onClick={()=>!disabled && setBase(v.toLowerCase())} 
    style={{
      display:"inline-block", width:70, height:30, marginRight:6,
      border:"1px solid #000", borderRadius:4, textAlign:"center",
      lineHeight:"30px", cursor:disabled?"not-allowed":"pointer",
      background:base?.toLowerCase()===v.toLowerCase()?"green":"#eee",
      color:base?.toLowerCase()===v.toLowerCase()?"#fff":"#000",
      opacity:disabled?.4:1
    }}>
      {v}
  </div>
})}

{/* ===== MOC ===== */}
<h3>Moc</h3>
{[6,12,18,24,36].map(v=>{
  const disabled = base==="nikotyna" && v===36;
  return <div key={v} onClick={()=>!disabled && setStrength(v)} style={{
    display:"inline-block", width:40, height:30, marginRight:6, 
    border:"1px solid #000", borderRadius:4, textAlign:"center",
    lineHeight:"30px", cursor:disabled?"not-allowed":"pointer",
    background:strength===v?"green":"#eee", color:strength===v?"#fff":"#000",
    opacity:disabled?.4:1
  }}>{v}mg</div>
})}

      {/* ===== ILOŚĆ ===== */}
      <h3>Ilość (ml)</h3>
      <input type="number" step={10} min={10} value={ml} onChange={e=>setMl(e.target.value)} style={{width:"30%", padding:"4px 6px", fontSize:14, WebkitAppearance:"none"}}/>

      <button onClick={addToCart} style={{width:"100%", marginTop:10, padding:12, borderRadius:8, background:"#22c55e", color:"#fff", border:"none"}}>➕ Dodaj do koszyka</button>

      {message && <div style={{marginTop:8, padding:8, background:messageType==="error"?"#fecaca":"#bbf7d0", borderRadius:6, textAlign:"center"}}>{message}</div>}

      <h3>Koszyk</h3>
      {cart.map((i,idx)=><div key={idx}>{i.flavor.id}/{i.ml}ml/{i.strength}mg/{i.base} — {i.price.toFixed(2)}zł <button onClick={()=>removeItem(idx)}>❌</button></div>)}

      <h3>Suma: {total.toFixed(2)} zł</h3>

      <button disabled={isSending} onClick={sendOrder} style={{width:"100%", marginTop:15, padding:12, background:isSending?"#9ca3af":"#16a34a", color:"#fff", border:"none", borderRadius:8}}>
        {isSending?"Wysyłanie...":"📤 Wyślij zamówienie"}
      </button>
    </div>
  );
}
