import { Edit } from "./edit.model";

export interface Historique 
{
  factureId: string;
  factureNumber: number;
  factureYear: number;
  creator: string;
  date: Date;
  changes: Edit[];
}