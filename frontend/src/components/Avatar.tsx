interface AvatarProps {
  photoURL?: string;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
};

const getBackgroundColor = (name: string): string => {
  const colors = [
    'bg-red-400',
    'bg-yellow-400',
    'bg-green-400',
    'bg-blue-400',
    'bg-indigo-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-orange-400',
  ];

  // Use name hash to consistently assign the same color
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function Avatar({ photoURL, displayName, size = 'md' }: AvatarProps) {
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={displayName}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getBackgroundColor(displayName)} rounded-full flex items-center justify-center font-bold text-white`}
    >
      {getInitials(displayName)}
    </div>
  );
}
