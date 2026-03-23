import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

let nextId = 1;
const snippets: Snippet[] = [];

router.get("/snippets", (_req, res) => {
  res.json([...snippets].reverse());
});

router.get("/snippets/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const snippet = snippets.find((s) => s.id === id);
  if (!snippet) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(snippet);
});

router.post("/snippets", (req, res) => {
  const { title, code, language } = req.body as {
    title: string;
    code: string;
    language: string;
  };
  if (!title || code === undefined || !language) {
    res.status(400).json({ error: "title, code, and language are required" });
    return;
  }
  const now = new Date().toISOString();
  const snippet: Snippet = {
    id: nextId++,
    title,
    code,
    language,
    createdAt: now,
    updatedAt: now,
  };
  snippets.push(snippet);
  res.status(201).json(snippet);
});

router.put("/snippets/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = snippets.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const { title, code, language } = req.body as {
    title: string;
    code: string;
    language: string;
  };
  if (!title || code === undefined || !language) {
    res.status(400).json({ error: "title, code, and language are required" });
    return;
  }
  snippets[index] = {
    ...snippets[index],
    title,
    code,
    language,
    updatedAt: new Date().toISOString(),
  };
  res.json(snippets[index]);
});

router.delete("/snippets/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = snippets.findIndex((s) => s.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  snippets.splice(index, 1);
  res.status(204).send();
});

export default router;
