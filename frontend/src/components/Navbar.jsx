import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Building2, User, ChevronDown, Plus, Briefcase } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import BusinessCreateModal from "../features/business/BusinessCreateModal";

const Navbar = ({ user, bgImage, logo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { environment, switchEnvironment, activeBusiness, setActiveBusiness, userBusinesses } = useBusiness();
  const navigate = useNavigate();

  const personalLinks = [
    { id: "transactions/table", label: "Transações" },
    { id: "loans/table", label: "Empréstimos" },
    { id: "credit-cards/table", label: "Cartões" },
    { id: "profile", label: "Perfil" },
  ];

  const businessLinks = [
    { id: "business/transactions", label: "Transações" },
    // Show Configs only for owner or admin
    ...((activeBusiness?.role === 'owner' || activeBusiness?.role === 'admin') ? [
      { id: "business/settings", label: "Configurações" }
    ] : []),
    { id: "profile", label: "Perfil" },
  ];

  const navLinks = environment === 'business' ? businessLinks : personalLinks;

  const handleEnvironmentSwitch = (env) => {
    switchEnvironment(env);
    setIsBusinessDropdownOpen(false);
    if (env === 'business') {
      navigate('/business/transactions');
    } else {
      navigate('/transactions/table');
    }
  };

  const handleBusinessSelect = (business) => {
    setActiveBusiness(business);
    setIsBusinessDropdownOpen(false);
  };

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
        <div className="flex justify-between items-center px-4 lg:px-10 h-full bg-transparent">
          <div className="flex items-center">
            <img src={logo} alt="Finance Manager Logo" className="h-8 mr-3" />

          </div>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex space-x-10 text-lg font-medium text-[#141413]">
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

          {/* Environment Switcher / Business Dropdown */}
          {user && (
            <div className="relative ml-6 hidden lg:block">
              {environment === 'personal' ? (
                <button
                  onClick={() => handleEnvironmentSwitch('business')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full transition-all text-[#141413] font-medium text-sm border border-transparent hover:border-[#d9a553]/30"
                >
                  <User size={18} />
                  <span>{user.username}</span>
                  <span className="text-xs opacity-60 ml-1">(Trocar para empresa)</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                    className="flex items-center gap-2 bg-[#d9a553] hover:bg-[#c49245] text-white px-4 py-2 rounded-full transition-all font-medium text-sm shadow-lg shadow-[#d9a553]/20"
                  >
                    <Building2 size={18} />
                    <span>{activeBusiness ? activeBusiness.name : 'Select Business'}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isBusinessDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#F0EEE6] rounded-xl shadow-xl border border-[#d9a553]/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 border-b border-gray-200">
                        <button
                          onClick={() => handleEnvironmentSwitch('personal')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#666663] hover:bg-black/5 rounded-lg transition-colors"
                        >
                          <User size={16} />
                          Switch to Personal
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto py-2">
                        <div className="px-3 py-1 text-xs font-semibold text-[#d9a553] uppercase tracking-wider">Your Businesses</div>
                        {userBusinesses.map((business) => (
                          <button
                            key={business.id}
                            onClick={() => handleBusinessSelect(business)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-black/5 transition-colors ${activeBusiness?.id === business.id ? 'bg-[#d9a553]/10 text-[#d9a553] font-semibold' : 'text-[#141413]'}`}
                          >
                            <Briefcase size={18} />
                            {business.name}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-gray-200 bg-gray-50">
                        <button
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#d9a553] border border-[#d9a553] rounded-lg hover:bg-[#d9a553] hover:text-white transition-all transform hover:scale-[1.02]"
                          onClick={() => setShowCreateModal(true)}
                        >
                          <Plus size={16} />
                          Create New Business
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center">

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden ml-4 text-[#141413] p-1 hover:bg-black/5 rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-[80px] left-0 w-full bg-[#F0EEE6] border-b border-[#d9a553] shadow-xl z-40 animate-in slide-in-from-top-5 duration-200">
          <ul className="flex flex-col p-4 space-y-2 text-lg font-medium text-[#141413]">
            {navLinks.filter(item => item.id !== 'business/settings').map((item) => (
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
            {/* Mobile Environment Switcher */}
            <li className="pt-2 border-t border-[#d9a553]/20 mt-2">
              <button
                onClick={() => {
                  handleEnvironmentSwitch(environment === 'personal' ? 'business' : 'personal');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-[#d9a553]/10 rounded-lg transition-colors text-[#d9a553] font-medium"
              >
                {environment === 'personal' ? <Building2 size={20} /> : <User size={20} />}
                Switch to {environment === 'personal' ? 'Business' : 'Personal'}
              </button>
            </li>

            {/* Mobile Business List (Only in Business Mode) */}
            {environment === 'business' && (
              <li className="pl-4 border-l-2 border-[#d9a553]/20 ml-4 space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-[#666663] uppercase tracking-wider">
                  Select Business
                </div>
                {userBusinesses.map((business) => (
                  <button
                    key={business.id}
                    onClick={() => {
                      handleBusinessSelect(business);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 rounded-lg transition-colors ${activeBusiness?.id === business.id ? 'bg-[#d9a553]/10 text-[#d9a553] font-semibold' : 'text-[#666663] hover:bg-black/5'}`}
                  >
                    <Briefcase size={16} />
                    {business.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-[#d9a553] hover:bg-[#d9a553]/10 rounded-lg transition-colors font-medium text-sm mt-2"
                >
                  <Plus size={16} />
                  Create New Business
                </button>
              </li>
            )}
          </ul>
          {user && (
            <div className="p-4 border-t border-[#d9a553]/20 text-center text-[#666663] text-sm">
              Bem-vindo, {user.username} 👋
            </div>
          )}
        </div>
      )}

      {/* CREATE BUSINESS MODAL */}
      {showCreateModal && <BusinessCreateModal onClose={() => setShowCreateModal(false)} />}
    </nav>
  );
};

export default Navbar;