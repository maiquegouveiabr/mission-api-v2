import { Card, CardDescription } from "./ui/card";

type Props = {
  data: {
    id: string;
    phone: string;
    name: string;
  }[];
};

function PhoneItem({ id, phone, name }: { name: string; id: string; phone: string }) {
  return (
    <div>
      <CardDescription>{name}</CardDescription>
      <CardDescription>
        <a href={`https://referralmanager.churchofjesuschrist.org/person/${id}`} target="_blank" rel="noopener noreferrer">
          {phone}
        </a>
      </CardDescription>
    </div>
  );
}

function PhoneMatchList({ data }: Props) {
  return (
    <Card className="w-fit p-3 bg-orange-200">
      <div className="flex flex-col gap-1">
        <CardDescription className="leading-tight font-black">Possible Matches</CardDescription>
        {data.map((item) => (
          <PhoneItem key={item.id} id={item.id} phone={item.phone} name={item.name} />
        ))}
      </div>
    </Card>
  );
}

export default PhoneMatchList;
