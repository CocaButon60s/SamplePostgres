import express from "express";
import pool from "./client.mjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html")),
);

app.post("/upload", async (req, res) => {
  console.log("POST /upload");

  const { ptn, room } = req.body;
  const building_id = 1;

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // 古いデータを削除
    await client.query(
      `
      DELETE FROM public.ptn p
      WHERE p.id IN (SELECT DISTINCT r.ptn_id FROM public.room r WHERE r.building_id = $1);
      `,
      [building_id],
    );
    await client.query(
      `
      DELETE FROM public.room WHERE building_id = $1;
      `,
      [building_id],
    );

    await client.query(`
      CREATE TEMP TABLE tmproom (
        name TEXT NOT NULL,
        ptn_id INTEGER NOT NULL,
        gen_id INTEGER
      ) ON COMMIT DROP;`);

    for (const { name, ptn_id } of room.rows) {
      await client.query(`INSERT INTO tmproom (name, ptn_id) VALUES ($1,$2)`, [
        name,
        ptn_id,
      ]);
    }

    // パターン登録
    let ret;
    for (const { id, settings, partname } of ptn.rows) {
      ret = await client.query(
        `
        INSERT INTO public.ptn (partname) VALUES ($1) RETURNING id`,
        [partname],
      );
      const gen_ptn_id = ret.rows[0].id;
      const lines = settings.split(/\r?\n/).filter((line) => line.trim());
      for (const line of lines) {
        const [main, sub1, sub2, val] = line.split(",");
        await client.query(
          `
          INSERT INTO public.settings (main,sub1,sub2,val,ptn_id) VALUES ($1,$2,$3,$4,$5)`,
          [main, sub1, sub2, val, gen_ptn_id],
        );
      }
      await client.query(
        `
        UPDATE tmproom SET gen_id = $1 WHERE ptn_id = $2;`,
        [gen_ptn_id, id],
      );
    }
    // 部屋登録
    ret = await client.query(`SELECT * FROM tmproom`);
    for (const { name, gen_id } of ret.rows) {
      await client.query(
        `
        INSERT INTO public.room (building_id, name, ptn_id) VALUES ($1,$2,$3)`,
        [building_id, name, gen_id],
      );
    }

    const query = "COMMIT";
    console.log(query);
    await client.query(query);
    return res.status(200).send("Upload received");
  } catch (err) {
    console.error(err);
    const query = "ROLLBACK";
    console.log(query);
    await client?.query(query);
    return res.status(500).send("Upload failed");
  } finally {
    client?.release();
  }
});

app.listen(port, () => {
  console.log("listening on " + port);
});
