import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = ({ user, bgImage, logo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: "transactions/table", label: "Transações" },
    { id: "loans/table", label: "Empréstimos" },
    { id: "credit-cards/table", label: "Cartões" },
    { id: "profile", label: "Perfil" },
  ];

  return (
    <nav className="sticky top-0 z-50 h-[80px]">
      {/* Camada de fundo (imagem) */}
      <div className="absolute inset-0 z-0 h-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="relative w-full h-full z-10">
        <div className="flex justify-between items-center px-4 md:px-10 h-full bg-transparent">
          <img src={logo} alt="Finance Manager Logo" className="h-8 md:h-10 mr-3" />

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-10 text-lg font-medium text-[#141413]">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/${item.id}`}
                  className="hover:text-[#d9a553] hover:bg-[#F0EEE6]/70 hover:backdrop-blur-lg hover:shadow-md hover:shadow-[#d9a553]/30 rounded-lg px-3 py-1 transition duration-300 rounded-full"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center">
            {user && (
              <h1 className="hidden md:block text-[#141413] font-semibold ml-6">
                Bem-vindo, {user.username} 👋
              </h1>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden ml-4 text-[#141413] p-1 hover:bg-black/5 rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[80px] left-0 w-full bg-[#F0EEE6] border-b border-[#d9a553] shadow-xl z-40 animate-in slide-in-from-top-5 duration-200">
          <ul className="flex flex-col p-4 space-y-2 text-lg font-medium text-[#141413]">
            {navLinks.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/${item.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 hover:bg-[#d9a553]/10 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {user && (
            <div className="p-4 border-t border-[#d9a553]/20 text-center text-[#666663] text-sm">
              Bem-vindo, {user.username} 👋
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;