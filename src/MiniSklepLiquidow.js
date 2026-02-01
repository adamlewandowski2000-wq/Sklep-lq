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
