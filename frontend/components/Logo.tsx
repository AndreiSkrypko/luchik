'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function Logo({ size = 80, className = '', animated = true }: LogoProps) {
  const LogoContent = () => (
    <div className={className} style={{ width: size, height: size }}>
      {/* Временная версия с обычным img для отладки */}
      <img
        src="/images/logo.jpg"
        alt="Логотип детского центра Лучик"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          border: '3px solid #ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
        onError={(e) => {
          console.log('Ошибка загрузки логотипа:', e);
        }}
        onLoad={() => {
          console.log('Логотип успешно загружен!');
        }}
      />
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ display: 'inline-block' }}
        >
          <LogoContent />
        </motion.div>
      </motion.div>
    );
  }

  return <LogoContent />;
}
