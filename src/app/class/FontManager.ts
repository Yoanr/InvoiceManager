import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

interface FontData {
  font: any;
  fontSize: number;
  fontColor: any;
  fontOpacity: number;
}

export class FontManager {
  static readonly NormalFontData: string = "NormalFontData";
  static readonly LightFontData: string = "LightFontData";
  static readonly LighterFontData: string = "LighterFontData";
  static readonly SmallFontData: string = "SmallFontData";

  public GetFontDataByName(name: string): FontData {
    if (this.FontDataMap.size == 0) {
      console.log("FontDataMap is empty");
      return this.DefaultFontData;
    }
    if (!this.FontDataMap.has(name)) {
      console.log("Wrong fontData name given " + name);
      return this.DefaultFontData;
    }

    return this.FontDataMap.get(name)!;
  }

  public GetDefaultFontData(): FontData {

    return this.DefaultFontData;
  }

  public GetCurrentFontData(): FontData {
    return this.CurrentFontData;
  }

  public SetCurrentFontData(fontDataName: string): void {
    this.CurrentFontData = this.GetFontDataByName(fontDataName);
  }

  public async Init(pdfDoc: PDFDocument): Promise<void> {
    console.log("1")
    pdfDoc.registerFontkit(fontkit);
    console.log("2")
    const exo2Regular = await this.GetFont(pdfDoc, "assets/fonts/Exo2-Regular.ttf");
    console.log("3")
    this.RegisterFontData(FontManager.NormalFontData, { font: exo2Regular, fontSize: 10, fontColor: rgb(0, 0, 0), fontOpacity: 1 });
    this.RegisterFontData(FontManager.LightFontData, { font: exo2Regular, fontSize: 10, fontColor: rgb(0, 0, 0), fontOpacity: 0.8 });
    this.RegisterFontData(FontManager.LighterFontData, { font: exo2Regular, fontSize: 10, fontColor: rgb(0, 0, 0), fontOpacity: 0.6 });
    this.RegisterFontData(FontManager.SmallFontData, { font: exo2Regular, fontSize: 8, fontColor: rgb(0, 0, 0), fontOpacity: 1 });
    console.log("4")
  }

  private DefaultFontData: FontData =
    {
      font: StandardFonts.Helvetica,
      fontSize: 10,
      fontColor: rgb(0, 0, 0),
      fontOpacity: 1
    };

  private FontDataMap = new Map<string, FontData>();

  private CurrentFontData = this.DefaultFontData;

  private RegisterFontData(name: string, fontData: FontData): void {
    if (this.FontDataMap.has(name)) {
      console.log("the font data " + name + " is already registered");
      return;
    }
    this.FontDataMap.set(name, fontData);
  }

  private async GetFont(pdfDoc: any, fontPath: string): Promise<any> {
    const fontBytes = await fetch(fontPath).then((res) => res.arrayBuffer());
    return await pdfDoc.embedFont(fontBytes);
  }
}
