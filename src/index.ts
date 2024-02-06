import express from "express";
import { z } from "zod";
import filesystem from "fs/promises";
import cors from "cors";

const server = express();

//if you need cors (cross origin resource sharing)
server.use(cors());

//header has content type (application json), express knows that the body has to be parsed as json
//json formatum erkezik, megcsinalja a bodyt objecktkent
server.use(express.json());

const QueryParamSchema = z.object({
  min: z.coerce.number(),
  max: z.coerce.number(),
});

const CountrySchema = z.object({
  id: z.number(),
  name: z.string(),
  population: z.number(),
});

type Country = z.infer<typeof CountrySchema>;

const CreateCountrySchema = z.object({
  name: z.string(),
  population: z.number(),
});

const readFile = async () => {
  try {
    const data = await filesystem.readFile(
      `${__dirname}/../database.json`,
      "utf-8"
    );
    const countries: Country[] = JSON.parse(data);
    return countries;
  } catch (error) {
    return null;
  }
};

server.get("/api/countries", async (req, res) => {
  let result = QueryParamSchema.safeParse(req.query);

  if (!result.success) return res.status(400).json(result.error.issues);

  const countries = await readFile();
  //if there is no file, wrong database, syntax error in database
  if (!countries) return res.sendStatus(500);
  const queryParams = result.data;

  const filteredCountries = countries.filter(
    (country) =>
      country.population > queryParams.min &&
      country.population < queryParams.max
  );

  res.json(filteredCountries);
});

server.post("/api/countries", async (req, res) => {
  const result = CreateCountrySchema.safeParse(req.body);

  if (!result.success) return res.status(400).json(result.error.issues);

  const countries = await readFile();
  if (!countries) return res.sendStatus(500);
  const randomNumber = Math.random();
  const newCountry = { ...result.data, id: randomNumber };

  countries.push(newCountry);

  await filesystem.writeFile(
    `${__dirname}/../database.json`,
    JSON.stringify(countries, null, 2)
  );

  res.json({ id: randomNumber });
});

server.delete("/api/countries/:id", async (req, res) => {
  const id = +req.params.id;

  const countries = await readFile();
  if (!countries) return res.sendStatus(500);

  const filteredCountries = countries.filter((country) => country.id !== id);

  await filesystem.writeFile(
    `${__dirname}/../database.json`,
    JSON.stringify(filteredCountries, null, 2)
  );

  res.sendStatus(200);
});

server.patch("/api/countries/:id", async (req, res) => {
  const id = +req.params.id;
  const countries = await readFile();
  if (!countries) return res.sendStatus(500);

  let countryToChange = countries.find((country) => country.id === id);

  if (!countryToChange) return res.sendStatus(404);

  const result = CreateCountrySchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error.issues);

  const updatedCountries = countries.map((country) => {
    if (country.id === id) {
      return { ...result.data, id };
    }
    return country;
    // country.id === id ? { ...result.data, id } : country
  });
  await filesystem.writeFile(
    `${__dirname}/../database.json`,
    JSON.stringify(updatedCountries, null, 2)
  );

  res.sendStatus(200);
});

server.listen(4001);
