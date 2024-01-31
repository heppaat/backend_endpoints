import express from "express";
import { z } from "zod";
import filesystem from "fs/promises";

const server = express();

server.use(express.json());

const QueryParamSchema = z.object({
  min: z.coerce.number(),
  max: z.coerce.number(),
});

const CountrySchema = z.object({
  name: z.string(),
  population: z.number(),
});

type Country = z.infer<typeof CountrySchema>;

const readFile = async () => {
  const data = await filesystem.readFile(
    `${__dirname}/../database.json`,
    "utf-8"
  );
  const countries: Country[] = JSON.parse(data);
  return countries;
};

server.get("/api/countries", async (req, res) => {
  let result = QueryParamSchema.safeParse(req.query);

  if (!result.success) return res.status(400).json(result.error.issues);

  const countries = await readFile();

  const queryParams = result.data;

  const filteredCountries = countries
    .filter(
      (country) =>
        country.population > queryParams.min &&
        country.population < queryParams.max
    )
    .map((country) => country.name);

  res.json({
    data: filteredCountries,
  });
});

server.post("/api/countries", async (req, res) => {
  const result = CountrySchema.safeParse(req.body);

  if (!result.success) return res.status(400).json(result.error.issues);

  const countries = await readFile();

  const country = result.data;

  countries.push(country);

  await filesystem.writeFile(
    `${__dirname}/../database.json`,
    JSON.stringify(countries, null, 2)
  );

  res.sendStatus(200);
});

server.listen(4001);
