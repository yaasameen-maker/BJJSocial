import BeltBadge from '../BeltBadge';

export default function BeltBadgeExample() {
  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <h3 className="font-semibold">Different Belt Ranks</h3>
        <div className="flex flex-wrap gap-2">
          <BeltBadge belt="White" />
          <BeltBadge belt="Blue" stripes={2} />
          <BeltBadge belt="Purple" stripes={1} />
          <BeltBadge belt="Brown" />
          <BeltBadge belt="Black" stripes={3} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Different Sizes</h3>
        <div className="flex items-center gap-2">
          <BeltBadge belt="Blue" size="sm" />
          <BeltBadge belt="Blue" size="default" />
          <BeltBadge belt="Blue" size="lg" />
        </div>
      </div>
    </div>
  );
}