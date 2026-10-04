import React from 'react';
import { useStoreSettings } from '../hooks/useStoreSettings.ts';

const WhatsAppButton: React.FC = () => {
  const { cleanWhatsappNumber } = useStoreSettings();
  const message = encodeURIComponent('Hello VIMSA! I am interested in your luxury fashion collection.');
  const waLink = `https://wa.me/${cleanWhatsappNumber}?text=${message}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 focus:outline-none pulse-whatsapp animate-pulse-gold"
      style={{
        boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
      }}
      title="Chat with VIMSA on WhatsApp"
      id="whatsapp-chat-btn"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-7 h-7 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.906-6.99C16.257 1.836 13.78 1.803 11.144 1.8c-5.44 0-9.865 4.422-9.87 9.868-.001 1.77.478 3.498 1.39 5.06L1.656 20.84l4.99-1.686zM17.6 14.34c-.28-.14-1.66-.82-1.92-.915-.26-.095-.45-.14-.64.14-.19.28-.73.915-.89 1.1-.16.185-.32.21-.6.07-.28-.14-1.182-.437-2.253-1.393-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.017-.43.122-.57.126-.127.28-.328.42-.49.14-.163.187-.28.28-.467.094-.188.047-.35-.024-.49-.07-.14-.64-1.54-.877-2.11-.23-.556-.465-.48-.64-.49-.164-.008-.353-.01-.54-.01-.19 0-.498.07-.76.35-.26.28-1 .98-1 2.38s1.02 2.76 1.16 2.95c.14.19 2.007 3.066 4.863 4.302.68.295 1.21.47 1.623.6.685.218 1.31.187 1.803.114.55-.08 1.66-.68 1.89-1.336.23-.656.23-1.22.16-1.336-.07-.116-.26-.21-.54-.35z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
