import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "approvals.json");

function ensureDataDirExists() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, JSON.stringify({}), "utf8");
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    ensureDataDirExists();

    if (req.method === "GET") {
      const raw = fs.readFileSync(FILE_PATH, "utf8");
      const approvals = JSON.parse(raw || "{}");
      return res.status(200).json({ status: "ok", approvals });
    }

    if (req.method === "POST") {
      const { id, approved } = req.body as { id?: string | number; approved?: boolean };
      if (!id || typeof approved !== "boolean") {
        return res.status(400).json({ status: "error", message: "id and approved (boolean) are required" });
      }

      const raw = fs.readFileSync(FILE_PATH, "utf8");
      const approvals = JSON.parse(raw || "{}");

      approvals[String(id)] = approved;
      fs.writeFileSync(FILE_PATH, JSON.stringify(approvals, null, 2), "utf8");

      return res.status(200).json({ status: "ok", approvals });
    }

    return res.status(405).json({ status: "error", message: "Method not allowed" });
  } catch (err: any) {
    console.error("approvals handler error:", err);
    res.status(500).json({ status: "error", message: err?.message ?? "unknown" });
  };
};