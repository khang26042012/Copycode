import { Router, type IRouter } from "express";
import { db, snippetsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/snippets", async (req, res) => {
  try {
    const snippets = await db
      .select()
      .from(snippetsTable)
      .orderBy(snippetsTable.updatedAt);
    res.json(snippets);
  } catch (err) {
    req.log.error({ err }, "Failed to list snippets");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/snippets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [snippet] = await db
      .select()
      .from(snippetsTable)
      .where(eq(snippetsTable.id, id));
    if (!snippet) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(snippet);
  } catch (err) {
    req.log.error({ err }, "Failed to get snippet");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/snippets", async (req, res) => {
  try {
    const { title, code, language } = req.body as {
      title: string;
      code: string;
      language: string;
    };
    if (!title || !code || !language) {
      res.status(400).json({ error: "title, code, and language are required" });
      return;
    }
    const [snippet] = await db
      .insert(snippetsTable)
      .values({ title, code, language })
      .returning();
    res.status(201).json(snippet);
  } catch (err) {
    req.log.error({ err }, "Failed to create snippet");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/snippets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const { title, code, language } = req.body as {
      title: string;
      code: string;
      language: string;
    };
    if (!title || !code || !language) {
      res.status(400).json({ error: "title, code, and language are required" });
      return;
    }
    const [snippet] = await db
      .update(snippetsTable)
      .set({ title, code, language, updatedAt: new Date() })
      .where(eq(snippetsTable.id, id))
      .returning();
    if (!snippet) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(snippet);
  } catch (err) {
    req.log.error({ err }, "Failed to update snippet");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/snippets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [deleted] = await db
      .delete(snippetsTable)
      .where(eq(snippetsTable.id, id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete snippet");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
