import ZoneList from "@/components/ZoneList";

export interface Zone {
  zone_id: number;
  name: string;
  create_date: string;
}

export default function Zones({ zones }: { zones: Zone[] }) {
  return (
    <div>
      <h1>Zones</h1>
      <ZoneList zones={zones} />
    </div>
  );
}

export async function getServerSideProps() {
  const url = "http://localhost:3000/api/db/zone";
  try {
    const response = await fetch(url);
    const zones = await response.json();
    return {
      props: { zones },
    };
  } catch (error) {
    console.error(error);
    return {
      props: { zones: [] },
    };
  }
}
