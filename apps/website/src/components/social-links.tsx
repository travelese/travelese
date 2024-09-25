import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaDiscord, FaXTwitter } from "react-icons/fa6";

export function SocialLinks() {
  return (
    <ul className="flex space-x-4 items-center md:ml-5">
      <li>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://go.travelese.xyz/nU1AaKG"
        >
          <span className="sr-only">X</span>
          <FaXTwitter size={22} className="fill-[#878787]" />
        </a>
      </li>
      {/*  <li>
        <a target="_blank" rel="noreferrer" href="https://go.travelese.xyz/">
          <span className="sr-only">Producthunt</span>
          <FaProductHunt size={22} className="fill-[#878787]" />
        </a>
      </li> */}
      <li>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://go.travelese.xyz/YBPQvBx"
        >
          <span className="sr-only">Discord</span>
          <FaDiscord size={24} className="fill-[#878787]" />
        </a>
      </li>
      <li>
        <a target="_blank" rel="noreferrer" href="https://git.new/travelese">
          <span className="sr-only">Github</span>
          <FaGithub size={22} className="fill-[#878787]" />
        </a>
      </li>
      <li>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://go.travelese.xyz/34tYXdW"
        >
          <span className="sr-only">LinkedIn</span>
          <FaLinkedinIn size={22} className="fill-[#878787]" />
        </a>
      </li>
      {/* <li>
        <a target="_blank" rel="noreferrer" href="https://go.travelese.xyz/">
          <span className="sr-only">Youtube</span>
          <FaYoutube size={22} className="fill-[#878787]" />
        </a>
      </li> */}
    </ul>
  );
}
