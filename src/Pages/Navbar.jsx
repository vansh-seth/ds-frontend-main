import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const location = useLocation(); 
  const navigate = useNavigate();

  const handleNav = () => {
    setNav(!nav);
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="relative flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white">
      <h1 className="w-full text-3xl font-bold text-[#00df9a]">
        <Link to="/" onClick={handleHomeClick}>Data science</Link>
      </h1>
      <ul className="hidden md:flex">
        <li className="p-4 cursor-pointer hover:text-gray-500 hover:underline">
          <Link to="/" onClick={handleHomeClick}>Home</Link>
        </li>
      </ul>
      <div onClick={handleNav} className="block md:hidden cursor-pointer z-50">
        {nav ? <AiOutlineClose size={30} /> : <AiOutlineMenu size={30} />}
      </div>
      <ul
        className={
          nav
            ? "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500 z-40"
            : "ease-in-out duration-500 fixed left-[-100%] z-40"
        }
      >
        <h1 className="w-full text-3xl font-bold text-[#00df9a] m-4">
          Data science
        </h1>
        <li className="p-4 cursor-pointer hover:text-gray-500 hover:underline">
          <Link to="/" onClick={handleHomeClick}>Home</Link>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;