import React, { useState } from "react";
import { login, register, getCurrentUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";

//Importar imagens
import logo from "../assets/images/logo.png";
import bgImage from "../assets/images/NavBar2.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = isLogin
        ? await login(formData)
        : await register(formData);

      //guardar o token de verificação
      localStorage.setItem("token", res.access_token);
      // obter user atual
      const user = await getCurrentUser(res.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/transactions");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Credenciais inválidas ou erro de rede.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f0eee6] flex flex-col">
      <header
        className="w-full bg-[#f0eee6] py-4 flex justify-center items-center fixed top-0 left-0 z-20 "
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-10" />
        </div>
      </header>
      <div className="min-h-screen bg-[#f0eee6] flex justify-center items-center">
        <div className="bg-[#e3dacc] p-10 rounded-2xl w-[80vw] max-w-[500px] shadow-lg w-[380px] border border-[#D4A27F]/40">
          <h2 className="text-xl font-semibold text-center text-[#40403E] mb-6">
            {isLogin ? "Iniciar Sessão" : "Criar Nova Conta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#CC785C]/40"
              required
            />
            {!isLogin && (
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#CC785C]/40"
                required
              />
            )}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#CC785C]/40"
              required
            />
            {error && (
              <p className="text-center text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-[#d9a553] text-white rounded-lg hover:bg-[#85BB65] transition"
            >
              {isLogin ? "Entrar" : "Criar Conta"}
            </button>
          </form>

          <p className="text-center text-sm text-[#40403E] mt-5">
            {isLogin ? "Ainda não tens conta?" : "Já tens conta?"}{" "}
            <span
              className="text-[#CC785C] font-medium cursor-pointer hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Cria uma nova" : "Inicia sessão"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}