// eslint-disable-next-line import/no-anonymous-default-export
export default async (url: string) => {
  const requestOptions: RequestInit = {
    method: "GET",
    headers: {
      Cookie: `oauth-abw_church_account_id=3619012236345409;oauth-abw_refresh_token=${process.env.ABW_REFRESH_TOKEN}`,
    },
    redirect: "follow",
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${url}, Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
