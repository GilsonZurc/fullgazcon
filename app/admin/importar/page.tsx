"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Importar() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const importarCSV = async () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const questoes = results.data.map((row: any) => ({
          banca: row.banca,
          materia: row.materia,
          ano: row.ano,
          concurso: row.concurso,
          questao: row.questao,
          tipo: row.tipo,
          gabarito: row.gabarito,
          pegadinha: row.pegadinha,
        }));

        const { error } = await supabase.from("questoes").insert(questoes);

        if (error) setStatus("Erro: " + error.message);
        else setStatus(`${questoes.length} questões importadas com sucesso!`);
      },
    });
  };

  return (
    <Card className="max-w-2xl mx-auto p-10 mt-10">
      <h1 className="text-3xl font-bold mb-8">Importar Questões via CSV</h1>
      <Input type="file" accept=".csv" onChange={handleFile} className="mb-6" />
      <Button
        onClick={importarCSV}
        className="w-full py-6 text-lg"
        disabled={!file}
      >
        Importar CSV
      </Button>
      {status && <p className="mt-6 text-center font-medium">{status}</p>}
    </Card>
  );
}
