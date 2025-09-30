import { Badge } from "@/components/ui/badge";

interface BeltBadgeProps {
  belt: string;
  stripes?: number;
  size?: "sm" | "default" | "lg";
}

export default function BeltBadge({ belt, stripes = 0, size = "default" }: BeltBadgeProps) {
  const getBeltColors = (belt: string) => {
    const colors = {
      White: 'bg-gray-100 text-gray-800 border-gray-300',
      Blue: 'bg-blue-100 text-blue-800 border-blue-300',
      Purple: 'bg-purple-100 text-purple-800 border-purple-300',
      Brown: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Black: 'bg-gray-800 text-white border-gray-600',
      Coral: 'bg-red-100 text-red-800 border-red-300',
      Red: 'bg-red-500 text-white border-red-600'
    };
    return colors[belt as keyof typeof colors] || colors.White;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      className={`${getBeltColors(belt)} border font-medium ${sizeClasses[size]}`}
      data-testid={`badge-belt-${belt.toLowerCase()}`}
    >
      {belt} Belt
      {stripes > 0 && (
        <span className="ml-1">
          ({stripes} {stripes === 1 ? 'stripe' : 'stripes'})
        </span>
      )}
    </Badge>
  );
}