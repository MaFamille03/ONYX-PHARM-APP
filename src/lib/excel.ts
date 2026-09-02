import * as XLSX from "xlsx";

export function exporterExcel(
  nomFichier: string,
  feuilles: { nom: string; lignes: Record<string, unknown>[] }[]
) {
  const classeur = XLSX.utils.book_new();

  for (const feuille of feuilles) {
    const worksheet = XLSX.utils.json_to_sheet(feuille.lignes);
    // Largeur de colonnes raisonnable, calculée depuis les en-têtes
    const largeurs = Object.keys(feuille.lignes[0] ?? {}).map((cle) => ({
      wch: Math.min(Math.max(cle.length, 12), 40),
    }));
    worksheet["!cols"] = largeurs;
    XLSX.utils.book_append_sheet(classeur, worksheet, feuille.nom.slice(0, 31));
  }

  XLSX.writeFile(classeur, `${nomFichier}.xlsx`);
}

export function telechargerModeleExcel(
  nomFichier: string,
  colonnes: string[],
  exemple?: Record<string, unknown>
) {
  const classeur = XLSX.utils.book_new();
  const lignes = exemple ? [exemple] : [];
  const worksheet = XLSX.utils.json_to_sheet(lignes, { header: colonnes });
  worksheet["!cols"] = colonnes.map((c) => ({ wch: Math.max(c.length, 16) }));
  XLSX.utils.book_append_sheet(classeur, worksheet, "Modèle");
  XLSX.writeFile(classeur, `${nomFichier}.xlsx`);
}

export async function lireFichierExcel(
  file: File
): Promise<Record<string, unknown>[]> {
  const buffer = await file.arrayBuffer();
  const classeur = XLSX.read(buffer, { type: "array" });
  const premiereFeuille = classeur.Sheets[classeur.SheetNames[0]];
  return XLSX.utils.sheet_to_json(premiereFeuille, { defval: "" });
}
