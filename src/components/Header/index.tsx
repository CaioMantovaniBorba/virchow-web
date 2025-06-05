import { useNavigate, useLocation, NavLink } from 'react-router-dom';

import Virchow from '@/assets/virchow-header.png';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const baseStyle =
    "text-white text-center font-bold w-[250px] px-12 py-1.5 rounded-sm max-md:text-xs";
  const location = useLocation();

  const isPacienteRoute = () =>
    ["/cadastropaciente", "/cadastrarpaciente", "/editarpaciente"].includes(location.pathname);

  const isLaudoRoute = () =>
    ["/incluirlaudo", "/pedidolaudo"].includes(location.pathname);

  return (
    <div className="bg-[#0F6278] absolute top-0 left-0 w-full h-[60px] flex items-center justify-between">
      <img src={Virchow} alt="Logo Virchow" className="h-[30px] ml-8" />

      <ul className="flex space-x-8">
        <NavLink
          to="/"
          className={() =>
            `${isLaudoRoute() ? "bg-[#197791]/50 border" : "bg-[#197791]"} ${baseStyle}`
          }
        >
          INCLUIR LAUDO
        </NavLink>

        <NavLink
          to="/cadastropaciente"
          className={() =>
            `${isPacienteRoute() ? "bg-[#197791]/50 border" : "bg-[#197791]"} ${baseStyle}`
          }
        >
          PACIENTES
        </NavLink>

        <NavLink
          to="/impressoes"
          className={({ isActive }) =>
            `${isActive ? "bg-[#197791]/50 border" : "bg-[#197791]"} ${baseStyle}`
          }
        >
          IMPRESSOS
        </NavLink>
      </ul>

      <span className="text-white hover:cursor-pointer mr-8" onClick={() => handleLogout()}>SAIR</span>
    </div>
  );
}
export default Header;