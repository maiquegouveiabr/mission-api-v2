type Props = {
  phone: string;
  id: string;
  name: string;
};

export default async (phone: string): Promise<Props[] | []> => {
  try {
    const response = await fetch(`/api/db/phoneMatch?phone=${phone}`);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
