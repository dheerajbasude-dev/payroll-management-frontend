import { useEffect } from "react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // auto-close in 4 sec
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-18 right-4 z-50">
      <div className="bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg animate-fadeIn">
        {message}
      </div>
    </div>
  );
}
