"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getConcursos } from "@/lib/api/concursos";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [concursos, setConcursos] = useState<any[]>([]);
  const [concursoSelecionado, setConcursoSelecionado] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  // Verifica se usuário está logado
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Carrega concursos quando logado
  useEffect(() => {
    if (user) {
      getConcursos("br").then(setConcursos);
    }
  }, [user]);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else {
      await supabase
        .from("usuarios")
        .insert({ id: data.user?.id, nome, email });
      alert("Cadastrado! Verifique seu e-mail.");
    }
    setLoading(false);
  };

  const handleGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: "google" });

  const handleForgotPassword = async () => {
    const emailInput = prompt("Digite seu e-mail:");
    if (emailInput) {
      await supabase.auth.resetPasswordForEmail(emailInput);
      alert("Link de recuperação enviado!");
    }
  };

  // Se não estiver logado → mostra login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          <h1 className="text-4xl font-bold text-center mb-10">Fullgazcon</h1>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={loading}
              >
                Entrar
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
              >
                Entrar com Google
              </Button>
              <Button
                variant="link"
                className="w-full text-blue-600"
                onClick={handleForgotPassword}
              >
                Esqueci minha senha
              </Button>
            </TabsContent>

            <TabsContent value="cadastro" className="space-y-4 mt-6">
              <div>
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSignup}
                disabled={loading}
              >
                Cadastrar
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
              >
                Cadastrar com Google
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Usuário logado → mostra escolha de concurso
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10">Fullgazcon</h1>

        <div className="bg-white rounded-2xl shadow p-10">
          <h2 className="text-2xl font-semibold mb-6">Escolha o concurso</h2>

          <Select onValueChange={setConcursoSelecionado}>
            <SelectTrigger className="w-full text-lg py-6">
              <SelectValue placeholder="Selecione um concurso" />
            </SelectTrigger>
            <SelectContent>
              {concursos.map((c: any, i) => (
                <SelectItem key={i} value={c.nome}>
                  {c.nome} —{" "}
                  {c.status === "open"
                    ? "Aberto"
                    : c.status === "expected"
                    ? "Previsto"
                    : "Encerrado"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {concursoSelecionado && (
            <Link
              href={`/simulado?concurso=${encodeURIComponent(
                concursoSelecionado
              )}`}
            >
              <Button className="w-full mt-8 py-8 text-xl">
                Gerar Simulado para {concursoSelecionado}
              </Button>
            </Link>
          )}
        </div>

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
