import { useEffect } from 'react';

const Toast = ({
  message,
  type = 'success',
  isVisible = true,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md`}>
        <span className="text-2xl">{icon}</span>
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 text-2xl font-bold leading-none transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
