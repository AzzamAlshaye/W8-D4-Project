// src/components/Footer.jsx
import React from "react";
import { FaFacebook } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa";

function Footer() {
  return (
    <footer className="flex flex-col w-full px-5 py-6 text-white bg-indigo-800 gap-y-3 md:px-5 lg:px-25">
      <div className="flex flex-col items-center md:flex-row md:justify-between gap-y-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">
            Tuwaiq Student Project Management System
          </h1>
          <p className="pl-1.5 text-sm md:text-base text-neutral-200 w-3/4 md:w-1/2">
            Welcome to the Tuwaiq Student Project Management System—your central
            hub for organizing and tracking student projects efficiently.
            Designed for both students and educators, our platform streamlines
            project workflows and fosters collaboration.
          </p>
        </div>
        <div className="flex flex-col gap-y-1.5">
          <h1 className="text-lg font-bold">Contact Us</h1>
          <ul className="flex flex-col gap-y-0.5 pl-1.5">
            <li className="text-sm md:text-base text-neutral-100">
              Email:{" "}
              <span className="text-xs md:text-sm text-neutral-100">
                Admin@tuwaiq.edu.sa
              </span>
            </li>
            <li className="text-sm md:text-base text-neutral-100">
              Phone:{" "}
              <span className="text-xs md:text-sm text-neutral-100">
                +966 55 123 4567
              </span>
            </li>
            <li className="text-sm md:text-base text-neutral-100">
              Address:{" "}
              <span className="text-xs md:text-sm text-neutral-100">
                P.O. Box 12345, Riyadh, Saudi Arabia
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-center w-full md:justify-end gap-x-4">
        <FaDiscord className="text-2xl transition duration-200 cursor-pointer hover:text-white text-neutral-200 hover:scale-105" />
        <FaGithub className="text-2xl transition duration-200 cursor-pointer hover:text-white text-neutral-200 hover:scale-105" />
        <FaFacebook className="text-2xl transition duration-200 cursor-pointer hover:text-white text-neutral-200 hover:scale-105" />
        <FaInstagram className="text-2xl transition duration-200 cursor-pointer hover:text-white text-neutral-200 hover:scale-105" />
        <FaLinkedin className="text-2xl transition duration-200 cursor-pointer hover:text-white text-neutral-200 hover:scale-105" />
        <FaXTwitter className="text-2xl transition duration-200 cursor-pointer hover:text-white text-neutral-200 hover:scale-105" />
      </div>
      <div className="text-center text-neutral-200">
        <p className="text-xs md:text-sm">
          © 2025 Tuwaiq Student Project Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
