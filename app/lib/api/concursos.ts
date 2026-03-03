export interface Concurso {
  nome: string;
  orgao: string;
  status: "open" | "expected" | "closed";
  vagas: number;
  salario: string;
  banca?: string;
  link?: string;
}

export async function getConcursos(uf: string = "br"): Promise<Concurso[]> {
  try {
    const res = await fetch(`https://concursos-api.deno.dev/${uf}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
