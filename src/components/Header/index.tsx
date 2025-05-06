import { useNavigate, useLocation, NavLink } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const currentRoute = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  return (
    <div className="bg-[#0F6278] absolute top-0 left-0 w-full h-[60px] flex items-center justify-between">
      {/* <img src={Logo} alt="Logo HC" className="h-[40px] ml-8" /> */}
      <span className="font-bold text-3xl text-white ml-8">Virchow</span>

      <ul className="flex space-x-8">
        {/* <NavLink
          to="/"
          className="bg-[#0C647C] text-white text-center font-bold w-[250px] px-12 py-1.5 rounded-sm max-md:text-xs"
        >
          INCLUIR LAUDO
        </NavLink> */}
        <NavLink
          to="/cadastropaciente"
          className="bg-[#197791] text-white text-center font-bold w-[250px] px-12 py-1.5 rounded-sm max-md:text-xs"
        >
          PACIENTES
        </NavLink>
        {/* <NavLink
          to="/impressoes"
          className="bg-[#0C647C] text-white text-center font-bold w-[250px] px-12 py-1.5 rounded-sm max-md:text-xs"
        >
          IMPRESSOS
        </NavLink> */}
      </ul>

      <span className="text-white hover:cursor-pointer mr-8" onClick={() => handleLogout()}>SAIR</span>
    </div>
  );
}
export default Header;