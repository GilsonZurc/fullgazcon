"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";

export default function Dashboard() {
  const [erros, setErros] = useState<any[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);
  const [pegadinhas, setPegadinhas] = useState<any[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Análise de pegadinhas
    const { data: respostasErradas } = await supabase
      .from("respostas_simulados")
      .select(
        `
        correto,
        questoes!inner(pegadinha, questao)
      `
      )
      .eq("correto", false)
      .eq("simulados.usuario_id", user.id);

    // Contagem de pegadinhas
    const contagem: any = {};
    respostasErradas?.forEach((r) => {
      const p = r.questoes.pegadinha || "Outros";
      contagem[p] = (contagem[p] || 0) + 1;
    });

    setPegadinhas(
      Object.entries(contagem).map(([name, value]) => ({ name, value }))
    );

    // Histórico
    const { data: hist } = await supabase
      .from("simulados")
      .select("*")
      .eq("usuario_id", user.id)
      .order("data", { ascending: false });

    setHistorico(hist || []);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Histórico de Simulados - Fullgazcon", 20, 20);

    let y = 40;
    historico.forEach((sim, i) => {
      doc.setFontSize(12);
      doc.text(
        `${i + 1}. ${sim.concurso} - ${sim.data.slice(0, 10)} - Nota: ${
          sim.nota
        }%`,
        20,
        y
      );
      y += 10;
    });

    doc.save("historico-fullgazcon.pdf");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">Dashboard - Fullgazcon</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Análise de Pegadinhas */}
        <Card className="p-8">
          <h2 className="text-2xl font-semibold mb-6">
            Pegadinhas mais frequentes
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pegadinhas}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Histórico */}
        <Card className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Histórico de Simulados</h2>
            <Button onClick={exportarPDF}>Exportar PDF</Button>
          </div>

          <div className="space-y-4">
            {historico.map((sim) => (
              <div
                key={sim.id}
                className="flex justify-between bg-gray-50 p-4 rounded-lg"
              >
                <div>
                  <p className="font-medium">{sim.concurso}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(sim.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-600">{sim.nota}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
