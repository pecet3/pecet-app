import { BsArrowLeftCircle } from "react-icons/bs";
import Link from "next/link";
export const BackArrow = () => {
  return (
    <Link className="absolute rounded-full p-2 text-slate-50 " href="/">
      <BsArrowLeftCircle
        size={32}
        className="rounded-full bg-slate-300 bg-opacity-40 shadow-sm shadow-gray-600"
      />
    </Link>
  );
};
