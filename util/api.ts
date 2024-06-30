export const getData = async (
  category: string,
  difficulty: string,
  number: string
) => {
  const API_Key = "B5TYQgebpqiAArpj41jDMIDTZzHCa3z3BBgkjmO6";
  const res = await fetch(
    `https://quizapi.io/api/v1/questions?apiKey=${API_Key}&category=${category}&difficulty=${difficulty}&limit=${number}`
  );

  if (res.ok) {
    const data = await res.json();
    return data;
  }
  throw new Error(`Failed to fetch pokemon with status ${res.status}`);
};
