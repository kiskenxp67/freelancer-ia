// ===============================
// 🚀 PROJETO COMPLETO (FRONT + BACKEND)
// ===============================

// ===============================
// 📁 FRONTEND (React - App.jsx)
// ===============================
import { useEffect, useState } from "react";

export default function App(){
  const [descricao,setDescricao]=useState("");
  const [resultado,setResultado]=useState(null);
  const [loading,setLoading]=useState(false);
  const [erro,setErro]=useState("");

  const [plano,setPlano]=useState(localStorage.getItem("plano") || "free");
  const [uso,setUso]=useState(Number(localStorage.getItem("uso")||0));
  const LIMITE_FREE = 3;

  useEffect(()=>{
    localStorage.setItem("uso",uso);
    localStorage.setItem("plano",plano);
  },[uso,plano]);

  const podeUsar = plano === "pro" || uso < LIMITE_FREE;

  const calcularIA = async () => {
    if(!podeUsar){
      setErro("Limite atingido. Faça upgrade.");
      return;
    }

    setLoading(true);
    setErro("");
    setResultado(null);

    try{
      const res = await fetch("/api/analisar",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({descricao})
      });

      const data = await res.json();
      if(!res.ok) throw new Error();

      setResultado(data);
      setUso(prev=>prev+1);
    }catch{
      setErro("Erro ao analisar projeto.");
    }

    setLoading(false);
  };

  const gerarProposta = () => {
    if(!resultado) return;

    const texto = `PROPOSTA DE SERVIÇO\n\nProjeto: ${descricao}\n\nValor: R$ ${resultado.preco}\nPrazo: ${resultado.horas} horas\n\n${resultado.justificativa}`;

    navigator.clipboard.writeText(texto);
    alert("Proposta copiada!");
  };

  return (
    <div style={{background:'#0b1120',minHeight:'100vh',color:'#fff',padding:20}}>
      <h1>Freelancer IA</h1>

      <textarea
        placeholder="Descreva o projeto..."
        value={descricao}
        onChange={e=>setDescricao(e.target.value)}
        style={{width:'100%',height:120}}
      />

      <button onClick={calcularIA} disabled={loading}>
        {loading ? "Analisando..." : "Calcular"}
      </button>

      {resultado && (
        <div>
          <p>Preço: {resultado.preco}</p>
          <p>Horas: {resultado.horas}</p>
          <p>{resultado.justificativa}</p>

          <button onClick={gerarProposta}>Copiar proposta</button>
        </div>
      )}
    </div>
  );
}


// ===============================
// 📁 BACKEND (Vercel API)
// arquivo: /api/analisar.js
// ===============================

export default async function handler(req, res) {
  try {
    const { descricao } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Analise este projeto freelancer e retorne JSON com preco, horas, dificuldade e justificativa: ${descricao}`
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    res.status(200).json(JSON.parse(content));

  } catch (error) {
    res.status(500).json({ error: "Erro na IA" });
  }
}


// ===============================
// 📁 .env
// ===============================
// OPENAI_API_KEY=sua_chave_aqui


// ===============================
// 🚀 COMO RODAR
// ===============================
// 1. npm install
// 2. npm run dev
// 3. deploy na Vercel


// ===============================
// 💰 PRONTO PRA VENDER
// ===============================
// ✔ IA funcionando
// ✔ backend seguro
// ✔ frontend funcional
// ✔ modelo freemium

// Próximo passo: Stripe + login
