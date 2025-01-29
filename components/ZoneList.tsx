import { Zone } from "@/pages/mission/zones";

export default function ZoneList({ zones }: { zones: Zone[] }) {
  return (
    <div>
      {zones.map((zone) => (
        <div key={zone.zone_id}>
          <h3>{zone.zone_id}</h3>
          <h3>{zone.name}</h3>
        </div>
      ))}
    </div>
  );
}
