

import { useState, useEffect } from "react";
import bg from "./assets/bg-liquid.png";

const SHEET_API =
   "https://script.google.com/macros/s/AKfycbyEEJrQN0Nf4UkW0jAbi23Pxvid1p8Aaf1OneJ-PyE_1YkIXjnWTjnlz-SKIC58uSY8/exec";

export default function MiniSklepLiquidow() {
  const [serverInventory, setServerInventory] = useState({});
  const [selectedFlavor, setSelectedFlavor] = useState(null);

  const [name, setName] = useState(
    () => localStorage.getItem("miniSklepName") || ""
  );

 const [discountCode,setDiscountCode]=
useState(
()=>localStorage.getItem(
"miniSklepCode"
)||""
);
const [bonusMl,setBonusMl]=useState(0);

const [codeActivated,setCodeActivated]=
useState(false);

const [codes,setCodes]=useState([]);
  const [ml, setMl] = useState(
    () => localStorage.getItem("miniSklepMl") || ""
  );

  const [strength, setStrength] = useState(() => {
    const s = localStorage.getItem("miniSklepStrength");
    return s ? Number(s) : null;
  });

  const [base, setBase] = useState(
    () => localStorage.getItem("miniSklepBase") || null
  );

  const [cart, setCart] = useState(() => {
    const c = localStorage.getItem("miniSklepCart");
    return c ? JSON.parse(c) : [];
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
 const [isSending, setIsSending] = useState(false);

const [showReferralPopup, setShowReferralPopup] =
  useState(false);
 
const [lastOrderTotal, setLastOrderTotal] =
  useState(0);

const [orderSent,setOrderSent]=
useState(false);



  // ================= HELPERS =================

  const showMessage = (txt, type = "info") => {
    setMessage(txt);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // ================= FETCH INVENTORY =================

  useEffect(() => {
    const fetchInventory = () => {
      fetch(SHEET_API)
        .then((r) => r.json())
        .then((d)=>{
 setServerInventory(d.inventory || {});
 setCodes(d.codes || []);
})
        .catch(console.error);
    };

    fetchInventory();

    const interval = setInterval(fetchInventory, 5000);

    return () => clearInterval(interval);
  }, []);

  // ================= SAVE =================

useEffect(() => {

 if(orderSent) return;

 localStorage.setItem(
   "miniSklepName",
   name
 );

}, [name,orderSent]);
useEffect(() => {

 if(orderSent) return;

 localStorage.setItem(
   "miniSklepMl",
   ml
 );

}, [ml,orderSent]);

useEffect(() => {

 if(orderSent) return;

 localStorage.setItem(
   "miniSklepStrength",
   strength ?? ""
 );

}, [strength,orderSent]);

useEffect(() => {

 if(orderSent) return;

 localStorage.setItem(
   "miniSklepBase",
   base ?? ""
 );

}, [base,orderSent]);

useEffect(() => {

 if(orderSent) return;

 localStorage.setItem(
   "miniSklepCart",
   JSON.stringify(cart)
 );

}, [cart,orderSent]);

useEffect(() => {

 if(orderSent) return;

 localStorage.setItem(
   "miniSklepCode",
   discountCode
 );

}, [discountCode,orderSent]);

useEffect(() => {

 const sent =
 localStorage.getItem(
   "miniSklepOrderSent"
 );

 if(sent==="1"){

   localStorage.removeItem(
    "miniSklepCart"
   );

   localStorage.removeItem(
    "miniSklepName"
   );

   localStorage.removeItem(
    "miniSklepMl"
   );

   localStorage.removeItem(
    "miniSklepStrength"
   );

   localStorage.removeItem(
    "miniSklepBase"
   );

   localStorage.removeItem(
    "miniSklepCode"
   );

   setCart([]);
   setName("");
   setMl("");
   setStrength(null);
   setBase(null);

   // TO ZOSTAW NA SAMYM KOŃCU:
   localStorage.removeItem(
     "miniSklepOrderSent"
   );
 }

},[]);
  // ================= VALIDATION =================

  useEffect(() => {
    if (strength === 36 && base === "nikotyna") {
      setBase(null);
    }
  }, [strength, base]);

  useEffect(() => {
    if (base === "nikotyna" && strength === 36) {
      setStrength(null);
    }
  }, [base, strength]);

  // ================= STOCK =================

  const getReservedInCart = (flavorId) =>
    cart
      .filter((i) => i.flavor.id === flavorId)
      .reduce((s, i) => s + i.ml / 10, 0);

  const getAvailableMl = (flavorId) => {
    const server = serverInventory[flavorId] || 0;
    const reserved = getReservedInCart(flavorId);

    return Math.max(0, (server - reserved) * 10);
  };

  // ================= PRICE =================

  const calculatePrice = (volume, strength, baseType) => {
    let price = 0;
    let p10 = 0,
      p60 = 0;

    if (baseType === "sól") {
      if ([6, 12, 18].includes(strength)) {
        p10 = 15;
        p60 = 79;
      } else {
        p10 = 16;
        p60 = 85;
      }
    } else {
      if ([6, 12].includes(strength)) {
        p10 = 11;
        p60 = 55;
      } else if (strength === 18) {
        p10 = 12;
        p60 = 61;
      } else if (strength === 24) {
        p10 = 13;
        p60 = 67;
      }
    }

    let remainder = volume;

    const num60 = Math.floor(remainder / 60);

    price += num60 * p60;

    remainder %= 60;

    const num30 = Math.floor(remainder / 30);

    if (num30 > 0) {

  
      const price30 = (() => {
        if (baseType === "nikotyna") {
          if ([6, 12].includes(strength)) return 32.5;
          if (strength === 18) return 35.5;
          if (strength === 24) return 38.5;
        } else {
          if ([6, 12, 18].includes(strength)) return 44.5;
          if ([24, 36].includes(strength)) return 47.5;
        }

        return 0;
      })();

      price += num30 * price30;

      remainder %= 30;
    }

    price += (remainder / 10) * p10;

    return price;
  };
  const checkDiscountCode = () => {

  const found = codes.find(
    i =>
      i.code.toLowerCase() ===
        discountCode.toLowerCase() &&
      Number(i.active) === 1
  );

 if (!found) {

setBonusMl(0);

setCodeActivated(false);

setDiscountCode("");

showMessage(
"❌ Kod nieaktywny lub nieprawidłowy",
"error"
);

return;

}

setBonusMl(found.ml);

setCodeActivated(true);

showMessage(
`🎁 Możesz dodać do koszyka ${found.ml}ml`,
"success"
);
};
  // ================= ADD TO CART =================

  const addToCart = () => {
    if (!selectedFlavor)
      return showMessage("❌ Wybierz smak", "error");

    if (!ml)
      return showMessage("❌ Podaj ilość", "error");

    if (ml % 10 !== 0)
      return showMessage("❌ Tylko co 10ml", "error");

    if (!strength)
      return showMessage("❌ Wybierz moc", "error");

    if (!base)
      return showMessage("❌ Wybierz bazę", "error");

    const maxMl = getAvailableMl(selectedFlavor.id);

    if (ml > maxMl)
      return showMessage(`❌ Max ${maxMl}ml`, "error");

    let price = calculatePrice(
Number(ml),
strength,
base
);

const alreadyHasBonus = cart.some(
 item => item.price === 0
);

if (
  bonusMl > 0 &&
  !alreadyHasBonus &&
  Number(ml) === bonusMl
) {
  price = 0;

  showMessage(
    `🎁 Dodano gratis ${bonusMl}ml`,
    "success"
  );
}
    setCart([
      ...cart,
     {
 flavor:selectedFlavor,
 ml:Number(ml),
 strength,
 base,
 price,
 isBonus:
   price===0
}
    ]);

    setMl("");

    showMessage("✅ Dodano do koszyka", "success");
  };

  const removeItem = (idx) => {

const removedItem = cart[idx];

const newCart =
cart.filter((_,i)=>i!==idx);

setCart(newCart);

// jeśli usunięto gratis
if(removedItem?.isBonus){

setBonusMl(0);

setCodeActivated(false);

showMessage(
"ℹ️ Usunięto bonus — kod ponownie aktywny",
"info"
);

}

};

  // ================= SEND =================

const sendOrder = async () => {

   if (
  codeActivated &&
  !cart.some(item => item.isBonus)
) {
  return showMessage(
    `❌ Aktywowałeś kod ${discountCode}. Musisz dodać gratis ${bonusMl}ml do koszyka.`,
    "error"
  );
}
  if (!name)
    return showMessage("❌ Podaj imię", "error");

  if (cart.length === 0)
    return showMessage("❌ Koszyk pusty", "error");

  if (isSending) return;

  setIsSending(true);

  const orderText = cart
    .map(
      (i) =>
        `${i.flavor.id}/${i.ml}ml/${i.strength}mg/${i.base}/${i.price.toFixed(2)}`
    )
    .join("\n");

  const total = cart.reduce(
    (s, i) => s + i.price,
    0
  );

  const usedAromas = {};

  cart.forEach((i) => {
    usedAromas[i.flavor.id] =
      (usedAromas[i.flavor.id] || 0) + i.ml / 10;
  });

try {

setShowReferralPopup(true);
setLastOrderTotal(total);

setTimeout(() => {

showMessage(
"✅ Zamówienie wysłane! Odezwij się po odbiór 😎",
"success"
);

localStorage.setItem(
 "miniSklepOrderSent",
 "1"
);

localStorage.removeItem("miniSklepCart");
localStorage.removeItem("miniSklepName");
localStorage.removeItem("miniSklepMl");
localStorage.removeItem("miniSklepStrength");
localStorage.removeItem("miniSklepBase");
localStorage.removeItem("miniSklepCode");

setCart([]);
setName("");
setMl("");
setStrength(null);
setBase(null);
setSelectedFlavor(null);
setDiscountCode("");
setBonusMl(0);
setCodeActivated(false);

fetch(SHEET_API,{
method:"POST",
body:JSON.stringify({
name,
orderText,
total,
usedAromas,

usedCode:

cart.some(
 item =>
 item.isBonus===true
)

? discountCode

: null

})
});

},0);



} catch (err) {

  console.error(err);

  showMessage(
    "❌ Problem z wysyłką",
    "error"
  );

}finally {

  setOrderSent(false);

  setIsSending(false);

}
};
  const total = cart.reduce(
    (s, i) => s + i.price,
    0
  );

  // ================= CATEGORY =================

   const categoryColors = {
    "Miksy owocowe":["#f87171","#fecaca"],
    "Owoce leśne":["#a78bfa","#e9d5ff"],
    "Tropikalne/Egzotyczne":["#facc15","#fef08a"],
    "Cytrusy/kwaśne":["#fde68a","#fef9c3"],
    "Miętowe/mentholowe":["#60a5fa","#bfdbfe"],
    "Inne smaki":["#34d399","#bbf7d0"],
    "Nowości":["#f472b6","#fce7f3"]
  };

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
      {id:49,name:"Brzoskwinia, Kiwi, Malina"},
      {id:50,name:"Winogrono"},
      {id:51,name:"Winogrono, Jabłko"},
      {id:52,name:"Winogrono, Efekt chłodu"},
      {id:53,name:"Czerwone owoce, Malina, Efekt chłodu"},
      {id:54,name:"Czerwone jagody, Kaktus, Cytryna, Efekt chłodu"}
    ],
        "Nowości":[
      {id:55,name:"Mango, Efekt chłodu"},
      {id:56,name:"Smoczy owoc, Truskawka, Efekt chłodu"},
      {id:57,name:"Niebieska malina, Jeżyna, Cukierki"},
      {id:58,name:"Melon, Efekt chłodu"},
      {id:59,name:"Kaktus, Limonka, Efekt chłodu"}
    ],
  };
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 15,
        borderRadius: 12,
        background: `url(${bg}) center/cover`,
        boxShadow: "0 0 20px rgba(0,0,0,.2)",
      }}
    >

<h2 style={{ textAlign: "center" }}>
  Mini sklep liquidów
</h2>

<input
  placeholder="Imię i Nazwisko"
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={{
    width: "50%",
    padding: "4px 6px",
    marginBottom: 10,
    fontSize: 18,
  }}
/>

<h3>Smaki</h3>

{Object.entries(flavorCategories).map(
  ([cat, flavors]) => {
    const [main, light] =
      categoryColors[cat];

    return (
      <details
        key={cat}
        style={{
          marginBottom: 10,
          borderRadius: 8,
          padding: 5,
          background: main,
        }}
      >
        <summary
          style={{
            fontWeight: "bold",
            padding: 6,
          }}
        >
          {cat}
        </summary>

        <div
          style={{
            padding: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {flavors.map((f) => {
            const stock =
              getAvailableMl(f.id);

            const stockColor =
              stock === 0
                ? "red"
                : stock < 120
                ? "#facc15"
                : "#22c55e";

            return (
              <label
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  background: `linear-gradient(90deg, ${light}, #fff)`,
                  borderRadius: 6,
                  padding: "4px 6px",
                  cursor:
                    stock === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    stock === 0 ? 0.6 : 1,
                  transition: ".2s",
                }}
                onClick={() => {
                  if (stock === 0) {
                    showMessage(
                      "❌ Brak na stanie",
                      "error"
                    );
                  } else {
                    setSelectedFlavor(f);
                  }
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "1px solid #000",
                    display: "inline-block",
                    marginRight: 6,
                    textAlign: "center",
                    lineHeight: "16px",
                    background:
                      selectedFlavor?.id ===
                      f.id
                        ? "green"
                        : "#fff",
                    color: "#fff",
                  }}
                >
                  {selectedFlavor?.id ===
                  f.id
                    ? "✔"
                    : ""}
                </span>

    <>
  {f.id}. {f.name}

  {[1, 21, 29, 34, 37, 39, 41, 45, 52].includes(f.id) && (
    <span className="bestseller">
      🔥 BESTSELLER
    </span>
  )}

  <span
    style={{
      marginLeft: 6,
      fontWeight: "bold",
      color: stockColor,
      fontSize: 12,
    }}
  >
    (na stanie: {stock}ml)
  </span>

  {stock <= 60 && stock > 0 && (
    <span
      className="lowStock"
      style={{ marginLeft: 6 }}
    >
      ⚠️ Końcówka
    </span>
  )}
</>
              </label>
            );
          })}
        </div>
      </details>
    );
  }
)}

<h3>Baza</h3>

{["Nikotyna","Sól"].map((v)=>{

const disabled =
  v==="Nikotyna" &&
  strength===36;

return(
<div
key={v}
onClick={()=>
 !disabled &&
 setBase(v.toLowerCase())
}

style={{
display:"inline-block",
width:70,
height:30,
marginRight:6,
border:"1px solid #000",
borderRadius:4,
textAlign:"center",
lineHeight:"30px",

cursor:
disabled
? "not-allowed"
: "pointer",

opacity:
disabled
? 0.35
: 1,

filter:
disabled
? "grayscale(100%)"
: "none",

background:
base?.toLowerCase()===
v.toLowerCase()
? "green"
: disabled
? "#d1d5db"
: "#eee",

color:
base?.toLowerCase()===
v.toLowerCase()
? "#fff"
: disabled
? "#6b7280"
: "#000",

transition:"all .2s"
}}
>
{v}
</div>
);
})}
<h3>Moc</h3>

{[6,12,18,24,36].map(v=>{
  const disabled =
    base==="nikotyna" && v===36;

  return (
    <div
      key={v}
      onClick={() =>
        !disabled && setStrength(v)
      }
      style={{
        display:"inline-block",
        width:40,
        height:30,
        marginRight:6,
        border:"1px solid #000",
        borderRadius:4,
        textAlign:"center",
        lineHeight:"30px",

        cursor:
          disabled
          ? "not-allowed"
          : "pointer",

        opacity:
          disabled ? 0.35 : 1,

        filter:
          disabled
          ? "grayscale(100%)"
          : "none",

        background:
          strength===v
            ? "green"
            : disabled
            ? "#d1d5db"
            : "#eee",

        color:
          strength===v
            ? "#fff"
            : disabled
            ? "#6b7280"
            : "#000",

        transition:"all .2s"
      }}
    >
      {v}mg
    </div>
  );
})}

<h3>Ilość (ml)</h3>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
  }}
>
  <input
    type="number"
    step={10}
    min={10}
    value={ml}
    onChange={(e) =>
      setMl(e.target.value)
    }
    style={{
      width: "30%",
      padding: "4px 6px",
      fontSize: 18,
    }}
  />

  <span
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#b91c1c",
      background: "#fef08a",
      padding: "2px 6px",
      borderRadius: 6,
      animation: "pulse 1s infinite",
    }}
  >
    🌟 Kupując 60ml jednego smaku oszczędzasz!
  </span>
</div>

{ml > 0 && ml < 60 && (
  <div className="progressBox">
    🔥 Do najlepszej ceny brakuje Ci tylko{" "}
    {60 - Number(ml)}ml
  </div>
)}

<button
  onClick={addToCart}
  className={`addBtn ${
    Number(ml) === 60
      ? "bestPrice"
      : ""
  }`}
  style={{
    width: "100%",
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    background: "#22c55e",
    color: "#fff",
    border: "none",
    fontSize: 16,
  }}
>
  {Number(ml) === 60
    ? "🔥 Najlepsza opcja — dodaj 60ml"
    : "➕ Dodaj do koszyka"}
</button>

{message && (
  <div
    className={
      messageType === "success"
        ? "successPulse"
        : ""
    }
    style={{
      marginTop: 8,
      padding: 8,
      background:
        messageType === "error"
          ? "#fecaca"
          : "#bbf7d0",
      borderRadius: 6,
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    {message}
  </div>
)}
<h3>Kod rabatowy</h3>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
  }}
>
<input
placeholder="Kod"

value={discountCode}

disabled={codeActivated}

onChange={(e)=>
setDiscountCode(
e.target.value
)
}

style={{
width:"30%",
padding:"4px 6px",
fontSize:18,

background:
codeActivated
? "#e5e7eb"
: "#fff",

opacity:
codeActivated
? .6
: 1,

cursor:
codeActivated
? "not-allowed"
: "text"
}}
/>

  <button
    onClick={checkDiscountCode}
    style={{
      padding: "8px 14px"
    }}
  >
    Aktywuj
  </button>
</div>

{codeActivated && bonusMl>0 && (
<div
style={{
background:"#dcfce7",
padding:10,
borderRadius:10,
marginTop:10,
display:"flex",
alignItems:"center",
justifyContent:"space-between",
border:"2px solid #22c55e"
}}
>

<div>
🎁 Kod aktywny:
<strong>
 {" "}
{discountCode}
</strong>

<div
style={{
fontSize:12,
marginTop:4
}}
>
Gratis: {bonusMl}ml
</div>
</div>

<button
onClick={()=>{

// usuń gratis z koszyka
const newCart =
cart.filter(
 item => !item.isBonus
);

setCart(newCart);

setDiscountCode("");

setBonusMl(0);

setCodeActivated(false);

localStorage.removeItem(
"miniSklepCode"
);

showMessage(
"❌ Usunięto kod i gratis",
"info"
);

}}
style={{
background:"#ef4444",
color:"#fff",
border:"none",
padding:"6px 10px",
borderRadius:8,
cursor:"pointer",
fontWeight:"bold"
}}
>
✖
</button>

</div>
)}
<h3>Koszyk</h3>

{cart.map((i, idx) => (
  <div
    key={idx}
    style={{ marginBottom: 4 }}
  >
{i.flavor.id}/{i.ml}ml/
{i.strength}mg/{i.base}

— {i.price.toFixed(2)}zł

{i.isBonus && (
 <span
   style={{
      color:"#16a34a",
      fontWeight:"bold",
      marginLeft:6
   }}
 >
   🎁 GRATIS
 </span>
)}

    <button
      onClick={() => removeItem(idx)}
      style={{ marginLeft: 6 }}
    >
      ❌
    </button>
  </div>
))}

<h3
  style={{
    marginTop: 14,
    textAlign: "center",
    fontSize: 24,
  }}
>
  💰 Suma: {total.toFixed(2)} zł
</h3>

<div className="cartFloating">
  🛒 Koszyk: {cart.length} produktów —{" "}
  {total.toFixed(2)} zł
</div>
      <button
        disabled={isSending}
        onClick={sendOrder}
        className="addBtn"
        style={{
          width: "100%",
          marginTop: 15,
          padding: 12,
          background: isSending
            ? "#9ca3af"
            : "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        {isSending
          ? "⏳ Wysyłanie..."
          : "📤 Wyślij zamówienie"}
      </button>

{showReferralPopup && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: 20,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: 25,
        borderRadius: 16,
        width: 340,
        textAlign: "center",
        boxShadow: "0 0 25px rgba(0,0,0,.3)",
      }}
    >
 <h2
  style={{
    marginTop:0,
    color:"#16a34a",
    fontSize:28,
    textAlign:"center",
    lineHeight:1.5
  }}
>
  ✅ Zamówienie wysłane!
  <br />
  Odezwij się po odbiór 😎
</h2>

      <div
        style={{
          background: "#dcfce7",
          border: "2px solid #22c55e",
          borderRadius: 12,
          padding: 15,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 5,
          }}
        >
          💰 Do zapłaty
        </div>

        <div
          style={{
            fontSize: 34,
            fontWeight: "bold",
            color: "#15803d",
          }}
        >
          {Number(lastOrderTotal).toFixed(2)} zł
        </div>
      </div>

      <h3
        style={{
          color: "#16a34a",
        }}
      >
        🎁 Program poleceń
      </h3>

      <p
        style={{
          lineHeight: 1.6,
          fontSize: 15,
        }}
      >
        Polecaj znajomych i zdobywaj
        <strong> +10ml gratis </strong>
        za każdą poleconą osobę 👀
      </p>

      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #93c5fd",
          borderRadius: 12,
          padding: 12,
          marginTop: 15,
          marginBottom: 12,
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        🔥 Polecona osoba również otrzyma <strong> +10ml gratis </strong>
      </div>

      <div
        style={{
          background: "#fef9c3",
          border: "1px solid #fde047",
          borderRadius: 12,
          padding: 12,
          marginBottom: 18,
          fontSize: 14,
          lineHeight: 1.5,
          color: "#854d0e",
          fontWeight: "bold",
        }}
      >
        📦 Możliwa wysyłka do Paczkomatu
        w cenie 10zł
      </div>

      <button
        onClick={() =>
          setShowReferralPopup(false)
        }
        style={{
          width: "100%",
          padding: 12,
          border: "none",
          borderRadius: 12,
          background: "#16a34a",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        🔥 Rozumiem
      </button>
    </div>
  </div>
)}


  

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @keyframes glowGreen {
          0% { box-shadow: 0 0 0px #22c55e; }
          50% { box-shadow: 0 0 20px #22c55e; }
          100% { box-shadow: 0 0 0px #22c55e; }
        }

        .addBtn {
          transition: all .2s ease;
          font-weight: bold;
        }

        .addBtn:hover {
          transform: scale(1.03);
        }

        .addBtn:active {
          transform: scale(.96);
        }

        .bestPrice {
          animation: glowGreen 1.5s infinite;
        }

        .lowStock {
          animation: pulse 1s infinite;
          color: #dc2626;
          font-weight: bold;
          font-size: 12px;
        }

        .bestseller {
          background: #ef4444;
          color: white;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 10px;
          margin-left: 6px;
          font-weight: bold;
        }

        .progressBox {
          margin-top: 8px;
          background: #fef08a;
          color: #92400e;
          padding: 8px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: bold;
          text-align: center;
          animation: pulse 1.2s infinite;
        }

        .cartFloating {
          position: sticky;
          bottom: 10px;
          background: #111;
          color: #fff;
          padding: 10px 14px;
          border-radius: 12px;
          text-align: center;
          font-weight: bold;
          margin-top: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,.3);
          z-index: 999;
        }

        .successPulse {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
}
