"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getQuestoes } from "@/lib/api/questoes";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function Simulado() {
  const searchParams = useSearchParams();
  const concurso = searchParams.get("concurso") || "";

  const [questoes, setQuestoes] = useState<any[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [tempoRestante, setTempoRestante] = useState(1800); // 30 minutos
  const [finalizado, setFinalizado] = useState(false);
  const [nota, setNota] = useState(0);

  useEffect(() => {
    if (concurso) {
      getQuestoes(concurso).then(setQuestoes);
    }
  }, [concurso]);

  // Timer
  useEffect(() => {
    if (tempoRestante <= 0) {
      finalizarSimulado();
      return;
    }
    const timer = setInterval(() => setTempoRestante((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [tempoRestante]);

  const responder = (questaoId: number, resposta: string) => {
    setRespostas((prev) => ({ ...prev, [questaoId]: resposta }));
  };

  const finalizarSimulado = async () => {
    let acertos = 0;
    const respostasArray: any[] = [];

    questoes.forEach((q) => {
      const respostaUsuario = respostas[q.id];
      const correto = respostaUsuario === q.gabarito;
      if (correto) acertos++;

      respostasArray.push({
        questao_id: q.id,
        resposta_usuario: respostaUsuario,
        correto,
      });
    });

    const notaFinal = Math.round((acertos / questoes.length) * 100);

    // Salvar no banco
    const { data: simulado } = await supabase
      .from("simulados")
      .insert({
        usuario_id: (await supabase.auth.getUser()).data.user?.id,
        data: new Date().toISOString(),
        concurso,
        banca: questoes[0]?.banca || "",
        materia: questoes[0]?.materia || "",
        nota: notaFinal,
      })
      .select()
      .single();

    // Salvar respostas
    if (simulado) {
      await supabase
        .from("respostas_simulados")
        .insert(
          respostasArray.map((r) => ({ ...r, simulado_id: simulado.id }))
        );
    }

    setNota(notaFinal);
    setFinalizado(true);
  };

  const formatTime = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (finalizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-10 text-center">
          <h1 className="text-5xl font-bold mb-4">Simulado Finalizado</h1>
          <p className="text-6xl font-bold text-green-600 mb-6">{nota}%</p>
          <Button onClick={() => (window.location.href = "/")}>
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Simulado - {concurso}</h1>
          <div className="text-2xl font-mono bg-red-100 px-6 py-2 rounded-lg">
            {formatTime(tempoRestante)}
          </div>
        </div>

        {questoes.map((q, index) => (
          <Card key={q.id} className="mb-8 p-8">
            <p className="font-semibold mb-6">
              Questão {index + 1} de {questoes.length}
            </p>
            <p className="text-lg leading-relaxed mb-8">{q.questao}</p>

            {q.tipo === "certo_errado" ? (
              <div className="flex gap-4">
                <Button
                  variant={respostas[q.id] === "C" ? "default" : "outline"}
                  onClick={() => responder(q.id, "C")}
                >
                  C - Certo
                </Button>
                <Button
                  variant={respostas[q.id] === "E" ? "default" : "outline"}
                  onClick={() => responder(q.id, "E")}
                >
                  E - Errado
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {["A", "B", "C", "D", "E"].map((alt) => (
                  <Button
                    key={alt}
                    variant={respostas[q.id] === alt ? "default" : "outline"}
                    onClick={() => responder(q.id, alt)}
                    className="justify-start"
                  >
                    {alt}){" "}
                    {q[`alternativa_${alt.toLowerCase()}`] ||
                      `Alternativa ${alt}`}
                  </Button>
                ))}
              </div>
            )}
          </Card>
        ))}

        <Button
          className="w-full py-8 text-xl"
          onClick={finalizarSimulado}
          disabled={Object.keys(respostas).length < questoes.length}
        >
          Finalizar Simulado
        </Button>
      </div>
    </div>
  );
}
