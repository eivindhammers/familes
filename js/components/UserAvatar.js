/**
 * UserAvatar Component
 * Reusable avatar display for user/profile initials
 */

window.UserAvatar = ({ name, size = 'md', bgColor = 'indigo' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl'
  };
  
  const bgColors = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-600',
    gray: 'bg-gray-400'
  };
  
  const initial = name?.charAt(0).toUpperCase() || '?';
  
  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} ${bgColors[bgColor] || bgColors.indigo} rounded-full flex items-center justify-center text-white font-bold`}>
      {initial}
    </div>
  );
};
